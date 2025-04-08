# Face Detection Test Suite

This directory contains tests for the Face Detection library. The tests are organized into unit tests and integration tests.

## Test Structure

- `unit/`: Contains unit tests for individual components
  - `services/`: Tests for service classes
  - `core/`: Tests for core functionality

- `integration/`: Contains integration tests
  - `face-detection.test.ts`: Jest tests for the face detection functionality
  - `face-detection-cli.ts`: CLI tool for testing face detection

- `images/`: Contains test images with different face scenarios
- `output/`: Where test results are saved

## Running Tests

### Running All Tests

To run both unit and integration tests:

```bash
npm test
# or
npx ts-node tests/run-tests.ts
```

### Running Only Unit Tests

To run only the unit tests:

```bash
npm run test:unit
```

### Running Service Tests

These tests are more reliable in Node.js environment:

```bash
npm run test:config
```

### Running Integration Tests

To run only the integration tests:

```bash
npm run test:integration
```

> **Note**: Integration tests may fail in Node.js environment due to missing browser APIs required by TensorFlow.js.
> For best results, use a browser-based test environment for integration tests.

### Running Individual Tests

To run a specific test file:

```bash
npx jest tests/unit/services/configuration-service.test.ts
```

## Test Outputs

After running the tests, check the `tests/output` directory for visual results of the face detection.
The output includes:

- `detection_*.jpg`: Basic face detection results
- `landmarks_*.jpg`: Face detection with landmarks
- `high_threshold_*.jpg`: Results with high confidence threshold
- `low_threshold_*.jpg`: Results with low confidence threshold

## Adding New Tests

When adding new tests:

1. Unit tests should be placed in the appropriate subdirectory under `tests/unit/`
2. Integration tests should be added to `tests/integration/`
3. New test images can be added to `tests/images/`
4. Update the `TEST_IMAGES` array in `tests/integration/base.ts` if adding new test images

## Testing Limitations

This package relies on TensorFlow.js and browser APIs for face detection functionality. Testing these features in a Node.js environment can be challenging due to:

1. **Missing Browser APIs**: The face detection models require browser APIs not available in Node.js
2. **WebGL Dependencies**: TensorFlow.js works best with WebGL acceleration in a browser
3. **Model Loading**: Model loading requires fetch API which is not natively available in Node.js

For comprehensive testing:

- Focus on unit testing non-browser dependent code in Node.js
- Use a headless browser environment for integration testing
- Consider manual testing for visual verification of detection results 