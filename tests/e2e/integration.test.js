/**
 * E2E Integration Tests for Full Application Flow
 * Tests the complete flow from crime generation through the UI
 */

import { describe, it, before, after, beforeEach } from 'node:test';
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

before(async () => {
  // Create a JSDOM instance with full HTML
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Law Enforcement Simulation - Test</title>
    </head>
    <body>
      <div id="app">
        <div id="header-container"></div>
        <div id="tab-nav-container"></div>
        <div class="main-content" id="main-content"></div>
      </div>
    </body>
    </html>
  `;

  dom = new JSDOM(html, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
  });

  window = dom.window;
  document = window.document;

  // Setup global fetch mock
  global.fetch = async (url) => {
    const fs = await import('fs/promises');

    const pathMap = {
      '/src/data/crimes.json': join(projectRoot, 'src/data/crimes.json'),
      '/src/data/names.json': join(projectRoot, 'src/data/names.json'),
      '/src/data/locations.json': join(projectRoot, 'src/data/locations.json'),
      '/src/data/evidence.json': join(projectRoot, 'src/data/evidence.json'),
      '/src/data/interrogation.json': join(projectRoot, 'src/data/interrogation.json')
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

  // Setup localStorage mock
  global.localStorage = {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = value;
    },
    removeItem(key) {
      delete this.data[key];
    },
    clear() {
      this.data = {};
    }
  };

  global.window = window;
  global.document = document;
});

after(() => {
  dom.window.close();
  delete global.fetch;
  delete global.window;
  delete global.document;
  delete global.localStorage;
});

describe('Full Application Integration Tests', () => {
  let stateManager;
  let crimeGenerator;

  before(async () => {
    // Import and initialize state manager
    const StateManagerModule = await import('../../src/core/StateManager.js');
    stateManager = StateManagerModule.default;
    stateManager.initialize();

    // Import and initialize crime generator
    const CrimeGeneratorModule = await import('../../src/systems/CrimeGenerator.js');
    crimeGenerator = CrimeGeneratorModule.default;
    await crimeGenerator.initialize();
  });

  beforeEach(() => {
    // Reset state before each test
    stateManager.reset();
    global.localStorage.clear();
  });

  describe('Crime to State Flow', () => {
    it('should add generated crime to state manager', async () => {
      const result = await crimeGenerator.generate('theft');

      // Add crime to state
      stateManager.updateState('crimes', crimes => [...crimes, result.crime.toJSON()]);

      const crimes = stateManager.getState('crimes');
      assert.strictEqual(crimes.length, 1);
      assert.strictEqual(crimes[0].id, result.crime.id);
      assert.strictEqual(crimes[0].type, 'theft');
    });

    it('should add persons to state manager', async () => {
      const result = await crimeGenerator.generate('homicide');

      // Add persons to state
      result.persons.forEach(person => {
        stateManager.updateState('persons', persons => [...persons, person.toJSON()]);
      });

      const persons = stateManager.getState('persons');
      assert.strictEqual(persons.length, result.persons.length);

      // Verify all person types are present
      const roles = persons.map(p => p.role);
      assert.ok(roles.includes('suspect'));
    });

    it('should maintain state consistency across multiple crimes', async () => {
      const results = await Promise.all([
        crimeGenerator.generate('theft'),
        crimeGenerator.generate('assault'),
        crimeGenerator.generate('fraud')
      ]);

      // Add all crimes and persons to state
      results.forEach(result => {
        stateManager.updateState('crimes', crimes => [...crimes, result.crime.toJSON()]);
        result.persons.forEach(person => {
          stateManager.updateState('persons', persons => [...persons, person.toJSON()]);
        });
      });

      const crimes = stateManager.getState('crimes');
      const persons = stateManager.getState('persons');

      assert.strictEqual(crimes.length, 3);
      assert.ok(persons.length >= 3); // At least one person per crime

      // Verify all crime IDs are unique
      const crimeIds = crimes.map(c => c.id);
      assert.strictEqual(new Set(crimeIds).size, 3);
    });
  });

  describe('Case Creation Flow', () => {
    it('should create case from crime', async () => {
      const CaseManagerModule = await import('../../src/systems/CaseManager.js');
      const caseManager = CaseManagerModule.default;

      const result = await crimeGenerator.generate('robbery');
      const newCase = caseManager.createCase(result.crime, result.departments);

      assert.ok(newCase);
      assert.ok(newCase.caseNumber);
      assert.strictEqual(newCase.crimeId, result.crime.id);
      assert.ok(newCase.assignedDepartments.length > 0);

      // Verify crime is assigned to case
      assert.strictEqual(result.crime.assignedCase, newCase.id);
    });

    it('should update crime status when case is created', async () => {
      const CaseManagerModule = await import('../../src/systems/CaseManager.js');
      const caseManager = CaseManagerModule.default;

      const result = await crimeGenerator.generate('burglary');

      // Add to state
      stateManager.updateState('crimes', crimes => [...crimes, result.crime.toJSON()]);

      // Create case
      const newCase = caseManager.createCase(result.crime, result.departments);

      // Update state
      stateManager.updateState('crimes', crimes =>
        crimes.map(c => c.id === result.crime.id ? result.crime.toJSON() : c)
      );

      const crimes = stateManager.getState('crimes');
      const updatedCrime = crimes.find(c => c.id === result.crime.id);

      assert.strictEqual(updatedCrime.status, 'investigating');
      assert.strictEqual(updatedCrime.assignedCase, newCase.id);
    });
  });

  describe('State Persistence', () => {
    it('should save and load state with crimes', async () => {
      const StorageModule = await import('../../src/core/Storage.js');
      const Storage = StorageModule.default;

      const storage = new Storage(stateManager);

      // Generate and add crime
      const result = await crimeGenerator.generate('cybercrime');
      stateManager.updateState('crimes', crimes => [...crimes, result.crime.toJSON()]);

      // Save state
      const currentState = stateManager.getAllState();
      storage.save(currentState);

      // Verify localStorage has data
      const saved = global.localStorage.getItem('law_enforcement_sim');
      assert.ok(saved);

      const parsed = JSON.parse(saved);
      assert.strictEqual(parsed.crimes.length, 1);
      assert.strictEqual(parsed.crimes[0].type, 'cybercrime');
    });

    it('should restore state on load', async () => {
      const StorageModule = await import('../../src/core/Storage.js');
      const Storage = StorageModule.default;

      const storage = new Storage(stateManager);

      // Generate and save multiple crimes
      const results = await Promise.all([
        crimeGenerator.generate('theft'),
        crimeGenerator.generate('assault')
      ]);

      results.forEach(result => {
        stateManager.updateState('crimes', crimes => [...crimes, result.crime.toJSON()]);
      });

      const currentState = stateManager.getAllState();
      storage.save(currentState);

      // Clear state
      stateManager.reset();
      assert.strictEqual(stateManager.getState('crimes').length, 0);

      // Load state
      const loaded = storage.load();
      assert.ok(loaded);
      assert.strictEqual(loaded.crimes.length, 2);
    });
  });

  describe('Event System Integration', () => {
    it('should trigger state change events', async () => {
      const result = await crimeGenerator.generate('drug_offense');

      let eventFired = false;
      let receivedCrimes = [];

      // Subscribe to state changes
      const unsubscribe = stateManager.subscribe('crimes', (crimes) => {
        eventFired = true;
        receivedCrimes = crimes;
      });

      // Add crime to state
      stateManager.updateState('crimes', crimes => [...crimes, result.crime.toJSON()]);

      // Wait a tick for the event to fire
      await new Promise(resolve => setTimeout(resolve, 10));

      assert.ok(eventFired, 'State change event should fire');
      assert.strictEqual(receivedCrimes.length, 1);
      assert.strictEqual(receivedCrimes[0].type, 'drug_offense');

      unsubscribe();
    });
  });

  describe('Data Validation', () => {
    it('should reject invalid crime data', async () => {
      const result = await crimeGenerator.generate('invalid_type');
      assert.strictEqual(result, null);
    });

    it('should validate crime types match template types', async () => {
      const crimeTypes = ['theft', 'homicide', 'assault', 'fraud', 'cybercrime', 'drug_offense', 'burglary', 'robbery'];

      for (const type of crimeTypes) {
        const result = await crimeGenerator.generate(type);
        assert.ok(result, `Should generate ${type} successfully`);
        assert.strictEqual(result.crime.type, type);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should generate 50 crimes in reasonable time', async () => {
      const startTime = Date.now();

      const results = await crimeGenerator.generateBatch(50);

      const endTime = Date.now();
      const duration = endTime - startTime;

      assert.strictEqual(results.length, 50);
      assert.ok(duration < 5000, `Generation took ${duration}ms, should be under 5000ms`);
    });

    it('should handle concurrent crime generation', async () => {
      const promises = Array(10).fill(null).map(() => crimeGenerator.generate());

      const results = await Promise.all(promises);

      assert.strictEqual(results.length, 10);
      results.forEach(result => {
        assert.ok(result);
        assert.ok(result.crime.id);
      });

      // All IDs should be unique
      const ids = results.map(r => r.crime.id);
      assert.strictEqual(new Set(ids).size, 10);
    });
  });
});
