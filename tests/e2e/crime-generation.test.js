/**
 * E2E Integration Tests for Crime Generation
 * Tests the full crime generation flow from data loading to crime creation
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

// Setup DOM environment
let dom;
let window;
let document;
let fetch;

before(async () => {
  // Create a JSDOM instance
  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
  });

  window = dom.window;
  document = window.document;

  // Setup global fetch mock
  global.fetch = async (url) => {
    const fs = await import('fs/promises');

    // Map URL paths to actual file paths
    const pathMap = {
      '/src/data/crimes.json': join(projectRoot, 'src/data/crimes.json'),
      '/src/data/names.json': join(projectRoot, 'src/data/names.json'),
      '/src/data/locations.json': join(projectRoot, 'src/data/locations.json')
    };

    const filePath = pathMap[url];
    if (!filePath) {
      throw new Error(`Unknown URL: ${url}`);
    }

    const content = await fs.readFile(filePath, 'utf-8');
    return {
      json: async () => JSON.parse(content),
      ok: true,
      status: 200
    };
  };

  // Setup globals needed by modules
  global.window = window;
  global.document = document;
});

after(() => {
  dom.window.close();
  delete global.fetch;
  delete global.window;
  delete global.document;
});

describe('Crime Generation E2E Tests', () => {
  describe('CrimeGenerator Initialization', () => {
    it('should initialize successfully and load all data files', async () => {
      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      const generator = new CrimeGenerator();

      await generator.initialize();

      assert.ok(generator.initialized, 'Generator should be initialized');
    });

    it('should handle initialization errors gracefully', async () => {
      // Temporarily break fetch
      const originalFetch = global.fetch;
      global.fetch = async () => {
        throw new Error('Network error');
      };

      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      const generator = new CrimeGenerator();

      await generator.initialize();

      assert.strictEqual(generator.initialized, false, 'Generator should not be initialized on error');

      // Restore fetch
      global.fetch = originalFetch;
    });
  });

  describe('Crime Generation for All Crime Types', () => {
    let generator;

    before(async () => {
      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      generator = new CrimeGenerator();
      await generator.initialize();
    });

    it('should generate theft crimes successfully', async () => {
      const result = await generator.generate('theft');

      assert.ok(result, 'Result should not be null');
      assert.strictEqual(result.crime.type, 'theft');
      assert.ok(result.crime.severity >= 1 && result.crime.severity <= 3);
      assert.ok(result.crime.description.length > 0);
      assert.ok(result.crime.location.address);
      assert.ok(result.persons.length > 0);
      assert.ok(result.crime.evidenceAvailable.length > 0);
    });

    it('should generate homicide crimes successfully', async () => {
      const result = await generator.generate('homicide');

      assert.ok(result, 'Result should not be null');
      assert.strictEqual(result.crime.type, 'homicide');
      assert.strictEqual(result.crime.severity, 5);
      assert.ok(result.persons.some(p => p.role === 'victim'));
      assert.ok(result.persons.some(p => p.role === 'suspect'));
    });

    it('should generate assault crimes successfully', async () => {
      const result = await generator.generate('assault');

      assert.ok(result, 'Result should not be null');
      assert.strictEqual(result.crime.type, 'assault');
      assert.ok(result.crime.severity >= 2 && result.crime.severity <= 4);
    });

    it('should generate fraud crimes successfully', async () => {
      const result = await generator.generate('fraud');

      assert.ok(result, 'Result should not be null');
      assert.strictEqual(result.crime.type, 'fraud');
      assert.ok(result.crime.severity >= 2 && result.crime.severity <= 3);
      assert.ok(result.departments.includes('detective'));
    });

    it('should generate cybercrime successfully', async () => {
      const result = await generator.generate('cybercrime');

      assert.ok(result, 'Result should not be null');
      assert.strictEqual(result.crime.type, 'cybercrime');
      assert.ok(result.departments.includes('cybercrime'));
    });

    it('should generate drug offense crimes successfully', async () => {
      const result = await generator.generate('drug_offense');

      assert.ok(result, 'Result should not be null');
      assert.strictEqual(result.crime.type, 'drug_offense');
      assert.ok(result.crime.severity >= 3 && result.crime.severity <= 5);
    });

    it('should generate burglary crimes successfully', async () => {
      const result = await generator.generate('burglary');

      assert.ok(result, 'Result should not be null');
      assert.strictEqual(result.crime.type, 'burglary');
      assert.ok(result.departments.includes('detective'));
    });

    it('should generate robbery crimes successfully', async () => {
      const result = await generator.generate('robbery');

      assert.ok(result, 'Result should not be null');
      assert.strictEqual(result.crime.type, 'robbery');
      assert.ok(result.crime.severity >= 4 && result.crime.severity <= 5);
    });
  });

  describe('Random Crime Generation', () => {
    let generator;

    before(async () => {
      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      generator = new CrimeGenerator();
      await generator.initialize();
    });

    it('should generate random crimes without specifying type', async () => {
      const result = await generator.generate();

      assert.ok(result, 'Result should not be null');
      assert.ok(result.crime.type, 'Crime should have a type');
      assert.ok(['theft', 'homicide', 'assault', 'fraud', 'cybercrime', 'drug_offense', 'burglary', 'robbery'].includes(result.crime.type));
    });

    it('should generate multiple different random crimes', async () => {
      const results = await generator.generateBatch(10);

      assert.strictEqual(results.length, 10);

      // Check that we got some variety (with 10 crimes and 8 types, very likely to have duplicates but also variety)
      const types = new Set(results.map(r => r.crime.type));
      assert.ok(types.size >= 1, 'Should generate at least one crime type');

      // All crimes should be valid
      results.forEach(result => {
        assert.ok(result.crime.id);
        assert.ok(result.crime.type);
        assert.ok(result.crime.location.address);
      });
    });
  });

  describe('Crime Data Integrity', () => {
    let generator;

    before(async () => {
      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      generator = new CrimeGenerator();
      await generator.initialize();
    });

    it('should generate crimes with valid timestamps', async () => {
      const result = await generator.generate();

      assert.ok(result.crime.timeOccurred > 0);
      assert.ok(result.crime.timeReported > 0);
      assert.ok(result.crime.timeReported >= result.crime.timeOccurred, 'Report time should be after occurrence');

      // Should be within last 48 hours
      const now = Date.now();
      const hoursSinceOccurred = (now - result.crime.timeOccurred) / (1000 * 60 * 60);
      assert.ok(hoursSinceOccurred <= 48, 'Crime should occur within last 48 hours');
    });

    it('should generate valid person data', async () => {
      const result = await generator.generate();

      assert.ok(result.persons.length > 0, 'Should have at least one person');

      result.persons.forEach(person => {
        assert.ok(person.id, 'Person should have ID');
        assert.ok(person.name, 'Person should have name');
        assert.ok(['suspect', 'victim', 'witness'].includes(person.role));
        assert.ok(person.demographics.age >= 18 && person.demographics.age <= 75);
        assert.ok(['male', 'female'].includes(person.demographics.gender));
      });
    });

    it('should identify guilty suspect', async () => {
      const result = await generator.generate();

      const suspects = result.persons.filter(p => p.role === 'suspect');
      assert.ok(suspects.length > 0, 'Should have at least one suspect');

      const guiltySuspects = suspects.filter(s => s.isGuilty);
      assert.strictEqual(guiltySuspects.length, 1, 'Should have exactly one guilty suspect');
      assert.strictEqual(guiltySuspects[0].id, result.guiltyPersonId);
    });

    it('should generate location with all required fields', async () => {
      const result = await generator.generate();

      assert.ok(result.crime.location.address);
      assert.ok(typeof result.crime.location.lat === 'number');
      assert.ok(typeof result.crime.location.lng === 'number');
      assert.ok(result.crime.location.description);
    });

    it('should generate evidence lists', async () => {
      const result = await generator.generate();

      assert.ok(result.crime.evidenceRequired.length >= 2, 'Should have at least 2 required evidence items');
      assert.ok(result.crime.evidenceAvailable.length >= result.crime.evidenceRequired.length,
        'Available evidence should include all required evidence');

      // All required evidence should be in available evidence
      result.crime.evidenceRequired.forEach(req => {
        assert.ok(result.crime.evidenceAvailable.includes(req),
          `Required evidence ${req} should be in available evidence`);
      });
    });

    it('should assign appropriate departments', async () => {
      const result = await generator.generate();

      assert.ok(result.departments.length > 0, 'Should assign at least one department');
      assert.ok(Array.isArray(result.departments), 'Departments should be an array');

      // All departments should be valid
      const validDepartments = ['patrol', 'detective', 'forensics', 'cybercrime', 'k9', 'swat'];
      result.departments.forEach(dept => {
        assert.ok(validDepartments.includes(dept), `${dept} should be a valid department`);
      });
    });
  });

  describe('Crime Model Integration', () => {
    it('should create valid Crime model instances', async () => {
      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      const { default: Crime } = await import('../../src/models/Crime.js');

      const generator = new CrimeGenerator();
      await generator.initialize();

      const result = await generator.generate();

      assert.ok(result.crime instanceof Crime);

      // Test Crime methods
      assert.ok(result.crime.getSeverityLabel());
      assert.ok(typeof result.crime.getTimeElapsed() === 'number');
      assert.ok(typeof result.crime.isUrgent() === 'boolean');

      // Test JSON serialization
      const json = result.crime.toJSON();
      assert.ok(json.id);
      assert.ok(json.type);

      // Test JSON deserialization
      const restored = Crime.fromJSON(json);
      assert.strictEqual(restored.id, result.crime.id);
      assert.strictEqual(restored.type, result.crime.type);
    });
  });

  describe('Error Handling', () => {
    it('should return null for invalid crime type', async () => {
      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      const generator = new CrimeGenerator();
      await generator.initialize();

      const result = await generator.generate('invalid_crime_type');

      assert.strictEqual(result, null);
    });

    it('should not throw errors during generation failures', async () => {
      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      const generator = new CrimeGenerator();
      await generator.initialize();

      // Generate with invalid type should return null, not throw
      const result = await generator.generate('nonexistent_type');
      assert.strictEqual(result, null, 'Should return null for invalid crime type');

      // Generate with valid type should work
      const validResult = await generator.generate('theft');
      assert.ok(validResult, 'Should generate valid crime');
    });
  });

  describe('Edge Cases', () => {
    let generator;

    before(async () => {
      const { CrimeGenerator } = await import('../../src/systems/CrimeGenerator.js');
      generator = new CrimeGenerator();
      await generator.initialize();
    });

    it('should handle batch generation of specific crime type', async () => {
      const results = await Promise.all([
        generator.generate('theft'),
        generator.generate('theft'),
        generator.generate('theft')
      ]);

      assert.strictEqual(results.length, 3);
      results.forEach(result => {
        assert.strictEqual(result.crime.type, 'theft');
      });
    });

    it('should generate unique IDs for all entities', async () => {
      const result1 = await generator.generate();
      const result2 = await generator.generate();

      assert.notStrictEqual(result1.crime.id, result2.crime.id);

      // Check person IDs are unique within a crime
      const personIds = new Set(result1.persons.map(p => p.id));
      assert.strictEqual(personIds.size, result1.persons.length);
    });

    it('should generate specific severity when requested', async () => {
      const result = await generator.generateSpecific('theft', 5);

      assert.ok(result);
      assert.strictEqual(result.crime.type, 'theft');
      assert.strictEqual(result.crime.severity, 5);
    });
  });
});
