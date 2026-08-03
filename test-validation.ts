import assert from "assert";
import http from "http";

// Set environment variable to test to prevent server bootstrap from opening other ports
process.env.NODE_ENV = "test";

// Dynamically import to ensure process.env.NODE_ENV is set before server.ts runs
const { app, ValidationError, validateString, validateInteger } = await import("./server");

// ==========================================
// 1. UNIT TESTS: VALIDATION HELPERS
// ==========================================
console.log("=== Running Unit Tests for Input Validation Helpers ===");

// A. Test validateString
try {
  // Valid strings
  assert.strictEqual(validateString("hello", "field"), "hello");
  assert.strictEqual(validateString("  hello  ", "field"), "hello");
  assert.strictEqual(validateString("", "field", 0, 50, true), "");

  // Required missing check
  assert.throws(() => {
    validateString(null, "field");
  }, /field is required/);

  // Type check
  assert.throws(() => {
    validateString(123, "field");
  }, /field must be a string/);

  // Minimum length check
  assert.throws(() => {
    validateString("ab", "field", 3, 10);
  }, /field must be at least 3/);

  // Maximum length check
  assert.throws(() => {
    validateString("abcdefg", "field", 1, 5);
  }, /field must not exceed 5/);

  console.log("✅ validateString unit tests passed!");
} catch (e) {
  console.error("❌ validateString unit tests failed:", e);
  process.exit(1);
}

// B. Test validateInteger
try {
  // Valid integers
  assert.strictEqual(validateInteger(10, "int"), 10);
  assert.strictEqual(validateInteger("10", "int"), 10);
  assert.strictEqual(validateInteger(0, "int", -5, 5), 0);

  // Required check
  assert.throws(() => {
    validateInteger(undefined, "int");
  }, /int is required/);

  // Invalid formats
  assert.throws(() => {
    validateInteger("not-an-int", "int");
  }, /int must be a valid integer/);

  assert.throws(() => {
    validateInteger(5.5, "int");
  }, /int must be a valid integer/);

  // Lower bound check
  assert.throws(() => {
    validateInteger(2, "int", 5, 10);
  }, /int must be at least 5/);

  // Upper bound check
  assert.throws(() => {
    validateInteger(15, "int", 5, 10);
  }, /int must not exceed 10/);

  console.log("✅ validateInteger unit tests passed!");
} catch (e) {
  console.error("❌ validateInteger unit tests failed:", e);
  process.exit(1);
}


// ==========================================
// 2. INTEGRATION TESTS: EXPRESS ROUTE HANDLERS
// ==========================================
console.log("\n=== Running Integration Tests for AI Endpoints ===");

let server: http.Server;
const TEST_PORT = 3500;

function makeRequest(path: string, method: string, body: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: "127.0.0.1",
      port: TEST_PORT,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode || 0, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode || 0, data: responseBody });
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function runIntegrationTests() {
  try {
    // A. Endpoint: /api/ai/generate-question
    console.log("Testing /api/ai/generate-question...");

    // Invalid input: missing fields
    const resGen1 = await makeRequest("/api/ai/generate-question", "POST", {
      subject: "Chemistry"
    });
    assert.strictEqual(resGen1.status, 400);
    assert.match(JSON.stringify(resGen1.data), /topic is required/);

    // Invalid input: wrong type
    const resGen2 = await makeRequest("/api/ai/generate-question", "POST", {
      subject: 123,
      topic: "Organic Compounds",
      difficulty: "Medium",
      paperType: "Paper 4"
    });
    assert.strictEqual(resGen2.status, 400);
    assert.match(JSON.stringify(resGen2.data), /subject must be a string/);

    // Valid input (should execute and return 200/500 depending on API configuration fallback)
    const resGen3 = await makeRequest("/api/ai/generate-question", "POST", {
      subject: "Chemistry",
      topic: "States of matter",
      difficulty: "Medium",
      paperType: "Paper 4"
    });
    assert.strictEqual(resGen3.status, 200);
    assert.ok(resGen3.data.fallback || resGen3.data.id);

    // B. Endpoint: /api/ai/tutor
    console.log("Testing /api/ai/tutor...");

    // Invalid input: missing message
    const resTut1 = await makeRequest("/api/ai/tutor", "POST", {
      history: []
    });
    assert.strictEqual(resTut1.status, 400);
    assert.match(JSON.stringify(resTut1.data), /message is required/);

    // Invalid input: message too long
    const resTut2 = await makeRequest("/api/ai/tutor", "POST", {
      message: "a".repeat(2500)
    });
    assert.strictEqual(resTut2.status, 400);
    assert.match(JSON.stringify(resTut2.data), /message must not exceed 2000 characters/);

    // Invalid input: history is not an array
    const resTut3 = await makeRequest("/api/ai/tutor", "POST", {
      message: "hello",
      history: "not-an-array"
    });
    assert.strictEqual(resTut3.status, 400);
    assert.match(JSON.stringify(resTut3.data), /history must be an array/);

    // Invalid input: history element is not an object
    const resTut4 = await makeRequest("/api/ai/tutor", "POST", {
      message: "hello",
      history: ["invalid-element"]
    });
    assert.strictEqual(resTut4.status, 400);
    assert.match(JSON.stringify(resTut4.data), /history\[0\] must be an object/);

    // Invalid input: history element role is invalid
    const resTut5 = await makeRequest("/api/ai/tutor", "POST", {
      message: "hello",
      history: [{ role: "admin", content: "some text" }]
    });
    assert.strictEqual(resTut5.status, 400);
    assert.match(JSON.stringify(resTut5.data), /history\[0\].role must be 'user', 'model', or 'assistant'/);

    // Valid input
    const resTut6 = await makeRequest("/api/ai/tutor", "POST", {
      message: "Explain covalent bonding.",
      history: [{ role: "user", content: "hello" }]
    });
    assert.strictEqual(resTut6.status, 200);
    assert.ok(resTut6.data.reply);

    // C. Endpoint: /api/ai/reading-assistance
    console.log("Testing /api/ai/reading-assistance...");

    // Invalid input: missing text
    const resRead1 = await makeRequest("/api/ai/reading-assistance", "POST", {
      numQuestions: 3
    });
    assert.strictEqual(resRead1.status, 400);
    assert.match(JSON.stringify(resRead1.data), /text is required/);

    // Invalid input: invalid integer for numQuestions
    const resRead2 = await makeRequest("/api/ai/reading-assistance", "POST", {
      text: "Curriculum study notes about physics.",
      numQuestions: "ten"
    });
    assert.strictEqual(resRead2.status, 400);
    assert.match(JSON.stringify(resRead2.data), /numQuestions must be a valid integer/);

    // Invalid input: numQuestions out of bounds
    const resRead3 = await makeRequest("/api/ai/reading-assistance", "POST", {
      text: "Curriculum study notes about physics.",
      numQuestions: 25
    });
    assert.strictEqual(resRead3.status, 400);
    assert.match(JSON.stringify(resRead3.data), /numQuestions must not exceed 10/);

    // Valid input
    const resRead4 = await makeRequest("/api/ai/reading-assistance", "POST", {
      text: "Curriculum study notes about physics.",
      numQuestions: 3
    });
    assert.strictEqual(resRead4.status, 200);
    assert.ok(resRead4.data.summary);

    // D. Endpoint: /api/ai/online-igcse-material
    console.log("Testing /api/ai/online-igcse-material...");

    // Invalid input: missing grade
    const resMat1 = await makeRequest("/api/ai/online-igcse-material", "POST", {
      subject: "Biology"
    });
    assert.strictEqual(resMat1.status, 400);
    assert.match(JSON.stringify(resMat1.data), /grade is required/);

    // Invalid input: grade out of bounds
    const resMat2 = await makeRequest("/api/ai/online-igcse-material", "POST", {
      grade: 15,
      subject: "Biology"
    });
    assert.strictEqual(resMat2.status, 400);
    assert.match(JSON.stringify(resMat2.data), /grade must not exceed 11/);

    // Invalid input: missing subject
    const resMat3 = await makeRequest("/api/ai/online-igcse-material", "POST", {
      grade: 9
    });
    assert.strictEqual(resMat3.status, 400);
    assert.match(JSON.stringify(resMat3.data), /subject is required/);

    // Valid input
    const resMat4 = await makeRequest("/api/ai/online-igcse-material", "POST", {
      grade: 10,
      subject: "Biology",
      topicKeyword: "Photosynthesis"
    });
    assert.strictEqual(resMat4.status, 200);
    assert.strictEqual(resMat4.data.syllabusCode, "0610/Paper4");

    console.log("✅ All integration tests passed successfully!");
    cleanupAndExit(0);
  } catch (err) {
    console.error("❌ Integration tests failed:", err);
    cleanupAndExit(1);
  }
}

function cleanupAndExit(code: number) {
  if (server) {
    server.close(() => {
      process.exit(code);
    });
  } else {
    process.exit(code);
  }
}

// Start the server and run the integration tests
server = app.listen(TEST_PORT, "127.0.0.1", () => {
  console.log(`Test server successfully listening on http://127.0.0.1:${TEST_PORT}`);
  runIntegrationTests();
});
