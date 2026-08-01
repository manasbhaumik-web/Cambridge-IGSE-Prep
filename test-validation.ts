import { ValidationError, validateString, validateInteger, validateHistory } from "./server";
import assert from "assert";

console.log("=== Running Validation Unit Tests ===");

// 1. Test validateString
try {
  const result = validateString("   hello world   ", "test_field", 1, 20);
  assert.strictEqual(result, "hello world");
  console.log("✅ validateString: trims whitespace");
} catch (e: any) {
  console.error("❌ validateString: trim failed", e);
  process.exit(1);
}

try {
  validateString(null, "test_field", 1, 10);
  assert.fail("Should throw ValidationError for null");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "test_field is required.");
  console.log("✅ validateString: throws on null");
}

try {
  validateString(123, "test_field", 1, 10);
  assert.fail("Should throw ValidationError for number");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "test_field must be a string.");
  console.log("✅ validateString: throws on non-string");
}

try {
  validateString("short", "test_field", 10, 20);
  assert.fail("Should throw ValidationError for too short");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "test_field must be at least 10 characters long.");
  console.log("✅ validateString: throws on too short");
}

try {
  validateString("verylongstring", "test_field", 1, 5);
  assert.fail("Should throw ValidationError for too long");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "test_field cannot exceed 5 characters.");
  console.log("✅ validateString: throws on too long");
}

// 2. Test validateInteger
try {
  const result = validateInteger(5, "test_num", 1, 10);
  assert.strictEqual(result, 5);
  console.log("✅ validateInteger: parses and passes valid int");
} catch (e: any) {
  console.error("❌ validateInteger failed", e);
  process.exit(1);
}

try {
  const result = validateInteger("8", "test_num", 1, 10);
  assert.strictEqual(result, 8);
  console.log("✅ validateInteger: parses and passes valid string representation of int");
} catch (e: any) {
  console.error("❌ validateInteger failed", e);
  process.exit(1);
}

try {
  validateInteger("invalid", "test_num", 1, 10);
  assert.fail("Should throw for non-integer");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "test_num must be an integer.");
  console.log("✅ validateInteger: throws on non-integer string");
}

try {
  validateInteger(15, "test_num", 1, 10);
  assert.fail("Should throw for out of bounds integer");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "test_num must be between 1 and 10.");
  console.log("✅ validateInteger: throws on out of bounds");
}

// 3. Test validateHistory
try {
  const result = validateHistory(null);
  assert.deepStrictEqual(result, []);
  console.log("✅ validateHistory: returns empty array on null");
} catch (e: any) {
  console.error("❌ validateHistory failed", e);
  process.exit(1);
}

try {
  validateHistory("not-an-array");
  assert.fail("Should throw on non-array history");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "history must be an array.");
  console.log("✅ validateHistory: throws on non-array");
}

try {
  validateHistory([{ role: "user", content: "hello" }, { role: "invalid", content: "yo" }]);
  assert.fail("Should throw on invalid role");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "history[1].role must be one of: user, model, assistant, system.");
  console.log("✅ validateHistory: throws on invalid role in array");
}

try {
  validateHistory([{ role: "user", content: 123 }]);
  assert.fail("Should throw on invalid content type");
} catch (e: any) {
  assert(e instanceof ValidationError);
  assert.strictEqual(e.message, "history[0].content must be a string.");
  console.log("✅ validateHistory: throws on non-string content");
}

console.log("✅ Unit tests passed!");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runIntegrationTests() {
  console.log("=== Running Integration Tests ===");
  await sleep(1500); // Wait for Express server to start

  const baseUrl = "http://localhost:3000";

  // Endpoint 1: Generate Question - ValidationError Case
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "", topic: "Physics", difficulty: "Medium", paperType: "MCQ" })
    });
    assert.strictEqual(res.status, 400);
    const data = (await res.json()) as { error: string };
    assert.strictEqual(data.error, "subject must be at least 1 characters long.");
    console.log("✅ POST /api/ai/generate-question [400 Validation Error] passes");
  } catch (err) {
    console.error("❌ POST /api/ai/generate-question [400] failed", err);
    process.exit(1);
  }

  // Endpoint 1: Generate Question - Successful Fallback Case (ai is null on test env)
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "Math", topic: "Algebra", difficulty: "Medium", paperType: "MCQ" })
    });
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as { error: string };
    assert(data.error.includes("Gemini API key is not configured"));
    console.log("✅ POST /api/ai/generate-question [200 Success Fallback] passes");
  } catch (err) {
    console.error("❌ POST /api/ai/generate-question [200] failed", err);
    process.exit(1);
  }

  // Endpoint 2: AI Tutor Chatbot - ValidationError Case (invalid message)
  try {
    const res = await fetch(`${baseUrl}/api/ai/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "", history: [] })
    });
    assert.strictEqual(res.status, 400);
    const data = (await res.json()) as { error: string };
    assert.strictEqual(data.error, "message must be at least 1 characters long.");
    console.log("✅ POST /api/ai/tutor [400 Validation Error] passes");
  } catch (err) {
    console.error("❌ POST /api/ai/tutor [400] failed", err);
    process.exit(1);
  }

  // Endpoint 2: AI Tutor Chatbot - Success Fallback Case
  try {
    const res = await fetch(`${baseUrl}/api/ai/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello!", history: [] })
    });
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as { reply: string };
    assert(data.reply.includes("The Gemini API key is currently not active"));
    console.log("✅ POST /api/ai/tutor [200 Success Fallback] passes");
  } catch (err) {
    console.error("❌ POST /api/ai/tutor [200] failed", err);
    process.exit(1);
  }

  // Endpoint 3: AI Reading Assistant - ValidationError Case
  try {
    const res = await fetch(`${baseUrl}/api/ai/reading-assistance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "  ", numQuestions: 3 })
    });
    assert.strictEqual(res.status, 400);
    const data = (await res.json()) as { error: string };
    assert.strictEqual(data.error, "text must be at least 1 characters long.");
    console.log("✅ POST /api/ai/reading-assistance [400 Validation Error] passes");
  } catch (err) {
    console.error("❌ POST /api/ai/reading-assistance [400] failed", err);
    process.exit(1);
  }

  // Endpoint 3: AI Reading Assistant - Success Fallback Case
  try {
    const res = await fetch(`${baseUrl}/api/ai/reading-assistance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Syllabus details for Cambridge IGCSE", numQuestions: 3 })
    });
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as { summary: string };
    assert(data.summary.includes("Core Summary of Provided Text"));
    console.log("✅ POST /api/ai/reading-assistance [200 Success Fallback] passes");
  } catch (err) {
    console.error("❌ POST /api/ai/reading-assistance [200] failed", err);
    process.exit(1);
  }

  // Endpoint 4: Online Material - ValidationError Case (invalid grade)
  try {
    const res = await fetch(`${baseUrl}/api/ai/online-igcse-material`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade: 15, subject: "Biology", topicKeyword: "Cells" })
    });
    assert.strictEqual(res.status, 400);
    const data = (await res.json()) as { error: string };
    assert.strictEqual(data.error, "grade must be between 1 and 11.");
    console.log("✅ POST /api/ai/online-igcse-material [400 Validation Error] passes");
  } catch (err) {
    console.error("❌ POST /api/ai/online-igcse-material [400] failed", err);
    process.exit(1);
  }

  // Endpoint 4: Online Material - Success Fallback Case
  try {
    const res = await fetch(`${baseUrl}/api/ai/online-igcse-material`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade: 7, subject: "Biology", topicKeyword: "Cells" })
    });
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as { title: string };
    assert(data.title.includes("Syllabus Guide: Biology"));
    console.log("✅ POST /api/ai/online-igcse-material [200 Success Fallback] passes");
  } catch (err) {
    console.error("❌ POST /api/ai/online-igcse-material [200] failed", err);
    process.exit(1);
  }

  console.log("🎉 All integration tests passed successfully!");
  process.exit(0);
}

runIntegrationTests();
