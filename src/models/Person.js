/**
 * Person Model - Represents a person involved in a case (suspect, victim, witness)
 */
import { randomId } from '../utils/random.js';
import { PERSON_ROLES } from '../utils/constants.js';

export class Person {
  constructor(data = {}) {
    this.id = data.id || randomId('person');
    this.name = data.name || 'Unknown Person';
    this.role = data.role || PERSON_ROLES.WITNESS;
    this.demographics = data.demographics || {
      age: 30,
      gender: 'Unknown',
      occupation: 'Unknown'
    };
    this.background = data.background || '';
    this.alibi = data.alibi || null;
    this.interviewed = data.interviewed || false;
    this.interviewNotes = data.interviewNotes || [];
    this.credibility = data.credibility || 50;
    this.cooperation = data.cooperation || 50;
    this.connections = data.connections || [];
    this.suspicionLevel = data.suspicionLevel || 0;
    this.isGuilty = data.isGuilty || false;
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      demographics: this.demographics,
      background: this.background,
      alibi: this.alibi,
      interviewed: this.interviewed,
      interviewNotes: this.interviewNotes,
      credibility: this.credibility,
      cooperation: this.cooperation,
      connections: this.connections,
      suspicionLevel: this.suspicionLevel,
      isGuilty: this.isGuilty
    };
  }

  /**
   * Create Person instance from JSON
   */
  static fromJSON(json) {
    return new Person(json);
  }

  /**
   * Conduct an interview
   */
  interview(technique, officerSkill) {
    this.interviewed = true;

    // Cooperation and credibility affected by technique and officer skill
    let cooperationChange = 0;
    let credibilityChange = 0;

    switch (technique) {
      case 'empathetic':
        cooperationChange = 10 + (officerSkill / 10);
        credibilityChange = 5;
        break;
      case 'aggressive':
        cooperationChange = -15 + (officerSkill / 20);
        credibilityChange = -10;
        break;
      case 'good_cop':
        cooperationChange = 15;
        credibilityChange = 5;
        break;
      case 'bad_cop':
        cooperationChange = -10;
        credibilityChange = -5;
        break;
      case 'tactical':
        cooperationChange = 5 + (officerSkill / 10);
        credibilityChange = 10;
        break;
    }

    // If person is guilty, they're less cooperative with effective questioning
    if (this.isGuilty && officerSkill > 70) {
      cooperationChange -= 10;
    }

    this.cooperation = Math.max(0, Math.min(100, this.cooperation + cooperationChange));
    this.credibility = Math.max(0, Math.min(100, this.credibility + credibilityChange));

    return {
      cooperation: this.cooperation,
      credibility: this.credibility,
      information: this.getInformation()
    };
  }

  /**
   * Add interview note
   */
  addInterviewNote(note) {
    this.interviewNotes.push({
      timestamp: Date.now(),
      note
    });
  }

  /**
   * Get information based on cooperation level
   */
  getInformation() {
    if (this.cooperation > 70) {
      return this.alibi || 'Provided detailed information';
    } else if (this.cooperation > 40) {
      return 'Provided some information';
    } else {
      return 'Refused to cooperate';
    }
  }

  /**
   * Set alibi
   */
  setAlibi(alibi) {
    this.alibi = alibi;
  }

  /**
   * Add connection to another person
   */
  addConnection(personId, relationship) {
    this.connections.push({
      personId,
      relationship
    });
  }

  /**
   * Increase suspicion level
   */
  increaseSuspicion(amount = 10) {
    this.suspicionLevel = Math.min(100, this.suspicionLevel + amount);
  }

  /**
   * Decrease suspicion level
   */
  decreaseSuspicion(amount = 10) {
    this.suspicionLevel = Math.max(0, this.suspicionLevel - amount);
  }

  /**
   * Check if person is a viable suspect
   */
  isViableSuspect() {
    return this.role === PERSON_ROLES.SUSPECT && this.suspicionLevel > 30;
  }

  /**
   * Check if alibi is verified
   */
  hasVerifiedAlibi() {
    return this.alibi && this.credibility > 70;
  }

  /**
   * Get person summary
   */
  getSummary() {
    return {
      name: this.name,
      role: this.role,
      age: this.demographics.age,
      occupation: this.demographics.occupation,
      interviewed: this.interviewed,
      cooperation: this.cooperation,
      credibility: this.credibility,
      suspicionLevel: this.suspicionLevel
    };
  }
}

export default Person;
