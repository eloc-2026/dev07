# Testing Guide

## Bug Fix Verification

### The Bug
Error when clicking "Generate New Crime": 
```
No templates found for crime type: THEFT
(or HOMICIDE, ASSAULT, etc.)
```

### The Fix
Changed `Object.keys(CRIME_TYPES)` to `Object.values(CRIME_TYPES)` in CrimeGenerator.js:116

```diff
- const type = crimeType || randomChoice(Object.keys(CRIME_TYPES));
+ const type = crimeType || randomChoice(Object.values(CRIME_TYPES));
```

## Manual Testing Steps

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open the Application
Navigate to: `http://localhost:5173` (or the displayed URL)

### 3. Test Crime Generation
1. Click the **"Generate New Crime"** button in the Dispatch Center
2. ✅ **Expected**: A new crime card appears with:
   - Crime type (theft, homicide, assault, etc.)
   - Location
   - Time occurred
   - Description
   - Severity badge
   - Create Case and View Details buttons
3. ❌ **Before Fix**: Console error "No templates found for crime type: X"

### 4. Test Multiple Crime Types
1. Click "Generate New Crime" multiple times (10-15 times)
2. ✅ **Expected**: Different crime types are generated randomly
3. ✅ **Expected**: All crimes display correctly
4. Verify you see variety in:
   - Crime types (theft, homicide, assault, fraud, cybercrime, drug_offense, burglary, robbery)
   - Locations
   - Severity levels (1-5)

### 5. Test Case Creation
1. Click **"View Details"** on any crime
2. ✅ **Expected**: Modal shows complete crime information
3. Click **"Create Case"** on a crime
4. ✅ **Expected**: 
   - Navigation to Cases view
   - New case appears with assigned case number
   - Crime status changes from "Reported" to "Investigating"

## Automated Testing

### Run All Tests
```bash
npm test
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Expected Test Results
```
✅ 36 tests pass
✅ 0 failures
✅ All crime types generate successfully
✅ Data integrity verified
✅ Integration with state manager working
✅ Performance benchmarks met
```

## Test Coverage

### Crime Generation Tests (22 tests)
- Initialization and data loading
- All 8 crime types (theft, homicide, assault, fraud, cybercrime, drug_offense, burglary, robbery)
- Random generation
- Batch generation
- Data integrity (timestamps, persons, locations, evidence)
- Error handling

### Integration Tests (14 tests)
- State management integration
- Case creation workflow
- State persistence
- Event system
- Performance testing

## Continuous Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Multiple Node.js versions (20.x, 22.x)

See: `.github/workflows/test.yml`

## Debugging

### If Tests Fail
1. Check Node.js version: `node --version` (requires 20.x or later)
2. Clean install: `rm -rf node_modules package-lock.json && npm install`
3. Run tests with verbose output: `node --test --test-reporter=spec tests/**/*.test.js`

### If Crime Generation Still Fails
1. Open browser console (F12)
2. Look for errors when clicking "Generate New Crime"
3. Check Network tab - verify data files load:
   - `/src/data/crimes.json`
   - `/src/data/names.json`
   - `/src/data/locations.json`

## Common Issues

### "Module not found" errors
- Ensure you're running from the project root
- Check that `src/` directory exists with all files

### "localStorage" errors  
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Check browser privacy settings allow localStorage

### Tests timeout
- Increase timeout in test files if needed
- Check for infinite loops in code

## Performance Benchmarks

Expected performance:
- Single crime generation: < 10ms
- 50 crimes batch: < 5000ms (5 seconds)
- 10 concurrent generations: completes successfully

## Success Criteria

✅ **Manual Test**: Successfully generate 10 different crimes without errors  
✅ **Automated Test**: All 36 tests pass  
✅ **Integration Test**: Create a case from a generated crime  
✅ **Performance Test**: Generate 50 crimes in under 5 seconds  
✅ **Data Validation**: All crime types represented in batch of 20 crimes
