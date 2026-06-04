/**
 * Officer Model - Represents a law enforcement officer/agent
 */
import { randomId } from '../utils/random.js';
import { DEPARTMENTS } from '../utils/constants.js';

export class Officer {
  constructor(data = {}) {
    this.id = data.id || randomId('officer');
    this.name = data.name || 'Officer Unknown';
    this.badge = data.badge || this.generateBadgeNumber();
    this.department = data.department || DEPARTMENTS.PATROL;
    this.rank = data.rank || 'Officer';
    this.skills = data.skills || {
      investigation: 50,
      forensics: 50,
      interrogation: 50,
      tactical: 50,
      technical: 50
    };
    this.activeCases = data.activeCases || [];
    this.casesSolved = data.casesSolved || 0;
    this.experience = data.experience || 0;
    this.specializations = data.specializations || [];
  }

  /**
   * Generate a badge number
   */
  generateBadgeNumber() {
    return `BADGE-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      badge: this.badge,
      department: this.department,
      rank: this.rank,
      skills: this.skills,
      activeCases: this.activeCases,
      casesSolved: this.casesSolved,
      experience: this.experience,
      specializations: this.specializations
    };
  }

  /**
   * Create Officer instance from JSON
   */
  static fromJSON(json) {
    return new Officer(json);
  }

  /**
   * Assign to a case
   */
  assignToCase(caseId) {
    if (!this.activeCases.includes(caseId)) {
      this.activeCases.push(caseId);
    }
  }

  /**
   * Remove from a case
   */
  removeFromCase(caseId) {
    this.activeCases = this.activeCases.filter(id => id !== caseId);
  }

  /**
   * Mark case as solved
   */
  solveCase(caseId, accuracy) {
    this.removeFromCase(caseId);
    this.casesSolved++;
    this.gainExperience(accuracy);
  }

  /**
   * Gain experience and potentially level up skills
   */
  gainExperience(amount) {
    this.experience += amount;

    // Level up skills based on department
    const skillMapping = {
      [DEPARTMENTS.PATROL]: 'investigation',
      [DEPARTMENTS.DETECTIVE]: 'investigation',
      [DEPARTMENTS.FORENSICS]: 'forensics',
      [DEPARTMENTS.CYBERCRIME]: 'technical',
      [DEPARTMENTS.K9]: 'tactical',
      [DEPARTMENTS.SWAT]: 'tactical'
    };

    const primarySkill = skillMapping[this.department];
    if (primarySkill && this.skills[primarySkill] < 100) {
      this.skills[primarySkill] = Math.min(100, this.skills[primarySkill] + 1);
    }
  }

  /**
   * Check if officer can use a tool
   */
  canUseTool(toolRequirements) {
    if (!toolRequirements) return true;

    for (const [skill, required] of Object.entries(toolRequirements)) {
      if (this.skills[skill] < required) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get overall skill level
   */
  getOverallSkillLevel() {
    const skills = Object.values(this.skills);
    return Math.floor(skills.reduce((sum, skill) => sum + skill, 0) / skills.length);
  }

  /**
   * Check if officer is available (not overworked)
   */
  isAvailable() {
    return this.activeCases.length < 3;
  }

  /**
   * Get rank based on experience
   */
  getRank() {
    if (this.experience >= 1000) return 'Captain';
    if (this.experience >= 500) return 'Lieutenant';
    if (this.experience >= 200) return 'Sergeant';
    if (this.experience >= 50) return 'Corporal';
    return 'Officer';
  }
}

export default Officer;
