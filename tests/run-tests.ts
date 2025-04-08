/**
 * Test runner script to execute all face detection tests
 * This script provides an easy way to run both unit tests and integration tests
 */
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { runFaceDetection } from './integration/face-detection-cli';

// Ensure output directory exists
const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Run Jest unit tests
 */
async function runUnitTests(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('\n==== Running Unit Tests ====\n');
    
    // Use the npm script to ensure proper Jest configuration
    const jestProcess = spawn('npm', ['run', 'test:unit'], {
      stdio: 'inherit',
      shell: true
    });
    
    jestProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('\n✅ Unit tests completed successfully');
        resolve(true);
      } else {
        console.error('\n❌ Unit tests failed');
        resolve(false);
      }
    });
  });
}

/**
 * Run integration tests using the CLI tool
 */
async function runIntegrationTests(): Promise<boolean> {
  console.log('\n==== Running Integration Tests ====\n');
  
  try {
    await runFaceDetection();
    console.log('\n✅ Integration tests completed successfully');
    return true;
  } catch (error) {
    console.error('\n❌ Integration tests failed:', error);
    return false;
  }
}

/**
 * Runs Jest integration tests
 */
async function runJestIntegrationTests(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('\n==== Running Jest Integration Tests ====\n');
    
    // Use the npm script to ensure proper Jest configuration with jsdom environment
    const jestProcess = spawn('npm', ['run', 'test:integration'], {
      stdio: 'inherit',
      shell: true
    });
    
    jestProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('\n✅ Jest integration tests completed successfully');
        resolve(true);
      } else {
        console.error('\n❌ Jest integration tests failed');
        resolve(false);
      }
    });
  });
}

/**
 * Main test runner function
 */
async function runAllTests() {
  console.log('🔍 Starting Face Detection Test Suite');
  
  // Run unit tests first
  const unitTestsPassed = await runUnitTests();
  
  // Run CLI-based integration tests
  const cliIntegrationTestsPassed = await runIntegrationTests();
  
  // Run Jest-based integration tests
  const jestIntegrationTestsPassed = await runJestIntegrationTests();
  
  // Show test summary
  console.log('\n==== Test Summary ====');
  console.log(`Unit Tests: ${unitTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`CLI Integration Tests: ${cliIntegrationTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Jest Integration Tests: ${jestIntegrationTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (unitTestsPassed && cliIntegrationTestsPassed && jestIntegrationTestsPassed) {
    console.log('\n🎉 All tests passed successfully!');
    console.log(`Check the test outputs in: ${OUTPUT_DIR}`);
    process.exit(0);
  } else {
    console.error('\n❌ Some tests failed. See above for details.');
    process.exit(1);
  }
}

// Run all tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
}

export { runAllTests, runIntegrationTests, runUnitTests, runJestIntegrationTests }; 