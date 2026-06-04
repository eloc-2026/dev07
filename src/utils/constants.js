/**
 * Application constants
 */

export const CRIME_TYPES = {
  THEFT: 'theft',
  HOMICIDE: 'homicide',
  ASSAULT: 'assault',
  FRAUD: 'fraud',
  CYBERCRIME: 'cybercrime',
  DRUG_OFFENSE: 'drug_offense',
  BURGLARY: 'burglary',
  ROBBERY: 'robbery'
};

export const CRIME_SEVERITY = {
  LOW: 1,
  LOW_MEDIUM: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5
};

export const CASE_STATUS = {
  REPORTED: 'reported',
  INVESTIGATING: 'investigating',
  SOLVED: 'solved',
  COLD: 'cold',
  CLOSED: 'closed'
};

export const EVIDENCE_TYPES = {
  FINGERPRINT: 'fingerprint',
  DNA: 'dna',
  DIGITAL: 'digital',
  WEAPON: 'weapon',
  DOCUMENT: 'document',
  WITNESS_STATEMENT: 'witness_statement',
  PHOTO: 'photo',
  VIDEO: 'video',
  TRACE: 'trace',
  BALLISTIC: 'ballistic'
};

export const DEPARTMENTS = {
  PATROL: 'patrol',
  DETECTIVE: 'detective',
  FORENSICS: 'forensics',
  CYBERCRIME: 'cybercrime',
  K9: 'k9',
  SWAT: 'swat'
};

export const INTERVIEW_TECHNIQUES = {
  EMPATHETIC: 'empathetic',
  AGGRESSIVE: 'aggressive',
  GOOD_COP: 'good_cop',
  BAD_COP: 'bad_cop',
  TACTICAL: 'tactical'
};

export const PERSON_ROLES = {
  SUSPECT: 'suspect',
  VICTIM: 'victim',
  WITNESS: 'witness'
};

export default {
  CRIME_TYPES,
  CRIME_SEVERITY,
  CASE_STATUS,
  EVIDENCE_TYPES,
  DEPARTMENTS,
  INTERVIEW_TECHNIQUES,
  PERSON_ROLES
};
