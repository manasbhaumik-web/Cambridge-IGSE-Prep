import { validateString, validateInteger, ValidationError } from "./server";
import assert from "assert";

console.log("Starting Sentinel Security Validation Test Suite... 🛡️");

let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`❌ FAIL: ${name}`);
    console.error(error);
    failedTests++;
  }
}

// 1. ValidationError Tests
test("ValidationError should extend Error and have correct name", () => {
  const err = new ValidationError("Test validation message");
  assert(err instanceof Error);
  assert.strictEqual(err.name, "ValidationError");
  assert.strictEqual(err.message, "Test validation message");
});

// 2. validateString Tests
test("validateString with valid inputs should return trimmed string", () => {
  const res = validateString("  Biology  ", "subject", 1, 100);
  assert.strictEqual(res, "Biology");
});

test("validateString missing/undefined should throw ValidationError", () => {
  assert.throws(() => {
    validateString(undefined, "subject");
  }, /Field 'subject' is required/);
});

test("validateString non-string should throw ValidationError", () => {
  assert.throws(() => {
    validateString(12345, "subject");
  }, /Field 'subject' must be a string/);
});

test("validateString empty string should throw ValidationError", () => {
  assert.throws(() => {
    validateString("   ", "subject");
  }, /Field 'subject' cannot be empty/);
});

test("validateString exceeding maximum length should throw ValidationError", () => {
  assert.throws(() => {
    validateString("a".repeat(256), "subject", 1, 255);
  }, /Field 'subject' exceeds maximum length of 255 characters/);
});

// 3. validateInteger Tests
test("validateInteger with valid inputs should return valid number", () => {
  const res = validateInteger(7, "grade", 1, 11);
  assert.strictEqual(res, 7);
});

test("validateInteger with string number should parse and return valid number", () => {
  const res = validateInteger("9", "grade", 1, 11);
  assert.strictEqual(res, 9);
});

test("validateInteger missing/undefined should throw ValidationError", () => {
  assert.throws(() => {
    validateInteger(undefined, "grade", 1, 11);
  }, /Field 'grade' is required/);
});

test("validateInteger non-integer should throw ValidationError", () => {
  assert.throws(() => {
    validateInteger("not-a-number", "grade", 1, 11);
  }, /Field 'grade' must be an integer/);

  assert.throws(() => {
    validateInteger(5.5, "grade", 1, 11);
  }, /Field 'grade' must be an integer/);
});

test("validateInteger out of bounds should throw ValidationError", () => {
  assert.throws(() => {
    validateInteger(0, "grade", 1, 11);
  }, /Field 'grade' must be between 1 and 11/);

  assert.throws(() => {
    validateInteger(12, "grade", 1, 11);
  }, /Field 'grade' must be between 1 and 11/);
});

// Summary
console.log("\n=================================");
console.log(`Validation Test Suite Complete.`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log("=================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("All validation tests completed successfully! 🎉");
  process.exit(0);
}
