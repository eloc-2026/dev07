/**
 * CrimeGenerator - Procedural crime generation system
 * Generates realistic crimes with suspects, victims, witnesses, and evidence
 */
import Crime from '../models/Crime.js';
import Person from '../models/Person.js';
import { randomChoice, randomChoices, randomInt, randomBoolean, randomId } from '../utils/random.js';
import { CRIME_TYPES, PERSON_ROLES, EVIDENCE_TYPES } from '../utils/constants.js';

// Import data files (will be loaded dynamically)
let crimeTemplates = null;
let nameData = null;
let locationData = null;

export class CrimeGenerator {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the generator by loading data files
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load data files
      const [crimes, names, locations] = await Promise.all([
        fetch('/src/data/crimes.json').then(r => r.json()),
        fetch('/src/data/names.json').then(r => r.json()),
        fetch('/src/data/locations.json').then(r => r.json())
      ]);

      crimeTemplates = crimes;
      nameData = names;
      locationData = locations;

      this.initialized = true;
      console.log('CrimeGenerator initialized');
    } catch (error) {
      console.error('Failed to initialize CrimeGenerator:', error);
    }
  }

  /**
   * Generate a random name
   */
  generateName(gender = null) {
    if (!nameData) return 'Unknown Person';

    const selectedGender = gender || randomChoice(['male', 'female']);
    const firstName = randomChoice(nameData.firstNames[selectedGender]);
    const lastName = randomChoice(nameData.lastNames);

    return `${firstName} ${lastName}`;
  }

  /**
   * Generate a random location
   */
  generateLocation() {
    if (!locationData) {
      return {
        address: 'Unknown Location',
        lat: 0,
        lng: 0,
        description: ''
      };
    }

    const street = randomChoice(locationData.streets);
    const number = randomInt(100, 9999);
    const city = randomChoice(locationData.cities);
    const neighborhood = randomChoice(locationData.neighborhoods);

    return {
      address: `${number} ${street}, ${city}`,
      lat: randomInt(-90, 90) + Math.random(),
      lng: randomInt(-180, 180) + Math.random(),
      description: `${neighborhood} area`
    };
  }

  /**
   * Generate a person (suspect, victim, or witness)
   */
  generatePerson(role, isGuilty = false) {
    const gender = randomChoice(['male', 'female']);
    const age = randomInt(18, 75);
    const occupation = randomChoice(nameData?.occupations || ['Unknown']);

    return new Person({
      name: this.generateName(gender),
      role,
      demographics: {
        age,
        gender,
        occupation
      },
      background: `${age} year old ${occupation}`,
      credibility: randomInt(40, 90),
      cooperation: randomInt(30, 80),
      isGuilty
    });
  }

  /**
   * Generate a crime with all related data
   */
  async generate(crimeType = null) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Select crime type
    const type = crimeType || randomChoice(Object.values(CRIME_TYPES));
    const templates = crimeTemplates?.templates[type] || [];

    if (templates.length === 0) {
      console.error(`No templates found for crime type: ${type}`);
      return null;
    }

    // Select random template
    const template = randomChoice(templates);

    // Generate location
    const location = this.generateLocation();

    // Generate description
    const description = template.description.replace('{location}', location.address);

    // Generate time (within last 48 hours)
    const hoursAgo = randomInt(1, 48);
    const timeOccurred = Date.now() - (hoursAgo * 60 * 60 * 1000);
    const timeReported = timeOccurred + randomInt(5, 120) * 60 * 1000; // 5-120 min after

    // Generate persons involved
    const numSuspects = randomInt(1, 3);
    const suspects = [];
    let guiltyPersonId = null;

    for (let i = 0; i < numSuspects; i++) {
      const isGuilty = i === 0; // First suspect is guilty
      const suspect = this.generatePerson(PERSON_ROLES.SUSPECT, isGuilty);
      suspects.push(suspect);

      if (isGuilty) {
        guiltyPersonId = suspect.id;
        suspect.suspicionLevel = randomInt(40, 70);
        suspect.alibi = this.generateAlibi(false);
      } else {
        suspect.suspicionLevel = randomInt(20, 50);
        suspect.alibi = this.generateAlibi(true);
      }
    }

    // Generate victims (not for all crime types)
    const victims = [];
    if (['homicide', 'assault', 'robbery', 'theft'].includes(type)) {
      const numVictims = type === 'homicide' ? 1 : randomInt(1, 2);
      for (let i = 0; i < numVictims; i++) {
        victims.push(this.generatePerson(PERSON_ROLES.VICTIM));
      }
    }

    // Generate witnesses
    const numWitnesses = randomInt(0, 3);
    const witnesses = [];
    for (let i = 0; i < numWitnesses; i++) {
      const witness = this.generatePerson(PERSON_ROLES.WITNESS);
      witness.credibility = randomInt(50, 95);
      witnesses.push(witness);
    }

    // Determine required evidence (what's needed to solve the case)
    const requiredEvidence = randomChoices(template.evidenceTypes, randomInt(2, 4));

    // Determine available evidence (what can be found)
    const availableEvidence = [...requiredEvidence];
    // Add some red herrings
    const otherEvidenceTypes = Object.values(EVIDENCE_TYPES).filter(
      e => !requiredEvidence.includes(e)
    );
    if (otherEvidenceTypes.length > 0 && randomBoolean(0.6)) {
      availableEvidence.push(...randomChoices(otherEvidenceTypes, randomInt(1, 2)));
    }

    // Create crime object
    const crime = new Crime({
      type,
      severity: template.severity,
      location,
      timeOccurred,
      timeReported,
      description,
      suspects: suspects.map(s => s.id),
      victims: victims.map(v => v.id),
      witnesses: witnesses.map(w => w.id),
      evidenceRequired: requiredEvidence,
      evidenceAvailable: availableEvidence
    });

    return {
      crime,
      persons: [...suspects, ...victims, ...witnesses],
      guiltyPersonId,
      departments: template.departments
    };
  }

  /**
   * Generate an alibi
   */
  generateAlibi(isTrue) {
    const alibis = [
      'Was at home watching TV',
      'Was at work during that time',
      'Was with family at dinner',
      'Was at the gym',
      'Was shopping at the mall',
      'Was visiting a friend',
      'Was at a movie theater',
      'Was sleeping at home',
      'Was at a bar with friends',
      'Was driving home from work'
    ];

    const alibi = randomChoice(alibis);

    if (!isTrue && randomBoolean(0.3)) {
      return null; // No alibi
    }

    return alibi;
  }

  /**
   * Generate multiple crimes
   */
  async generateBatch(count = 5) {
    const crimes = [];

    for (let i = 0; i < count; i++) {
      const result = await this.generate();
      if (result) {
        crimes.push(result);
      }
    }

    return crimes;
  }

  /**
   * Generate a crime of specific type and severity
   */
  async generateSpecific(type, severity) {
    const result = await this.generate(type);

    if (result && severity) {
      result.crime.severity = severity;
    }

    return result;
  }
}

// Create singleton instance
const crimeGenerator = new CrimeGenerator();
export default crimeGenerator;
