# E2E Integration Tests

This directory contains end-to-end integration tests for the Law Enforcement Simulation application.

## Test Structure

- `tests/e2e/crime-generation.test.js` - Tests for the crime generation system
- `tests/e2e/integration.test.js` - Full application integration tests

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## What's Tested

### Crime Generation Tests (`crime-generation.test.js`)

1. **CrimeGenerator Initialization**
   - Successful initialization with data loading
   - Error handling for failed initialization

2. **Crime Generation for All Crime Types**
   - Tests for each crime type: theft, homicide, assault, fraud, cybercrime, drug_offense, burglary, robbery
   - Validates correct crime properties and data structure

3. **Random Crime Generation**
   - Generates random crimes without specifying type
   - Batch generation of multiple crimes

4. **Crime Data Integrity**
   - Valid timestamps
   - Valid person data (suspects, victims, witnesses)
   - Guilty suspect identification
   - Location data completeness
   - Evidence lists
   - Department assignments

5. **Crime Model Integration**
   - Crime model instance creation
   - JSON serialization/deserialization

6. **Error Handling**
   - Invalid crime types
   - Missing data scenarios

7. **Edge Cases**
   - Batch generation
   - Unique ID generation
   - Specific severity requests

### Full Application Integration Tests (`integration.test.js`)

1. **Crime to State Flow**
   - Adding generated crimes to state manager
   - Adding persons to state
   - State consistency across multiple crimes

2. **Case Creation Flow**
   - Creating cases from crimes
   - Crime status updates when case is created

3. **State Persistence**
   - Saving state with crimes
   - Loading and restoring state

4. **Event System Integration**
   - State change event triggering

5. **Data Validation**
   - Invalid crime data rejection
   - Crime type validation

6. **Performance Tests**
   - Bulk crime generation
   - Concurrent crime generation

## Test Coverage

The tests ensure:
- ✅ Bug fix: Random crime generation now correctly uses crime type values
- ✅ All 8 crime types generate successfully
- ✅ Data integrity across all generated entities
- ✅ Integration between crime generator and state management
- ✅ Case creation workflow
- ✅ State persistence and restoration
- ✅ Performance under load

## Technical Details

- Uses Node.js built-in test runner (`node:test`)
- Uses JSDOM for DOM simulation
- Mocks `fetch` API for data file loading
- Mocks `localStorage` for state persistence testing
- No external test frameworks required (except JSDOM)
