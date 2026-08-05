import { createServer } from "http";

// 1. Set environment variables before importing the server to avoid listening on port 3000
process.env.NODE_ENV = "test";
// Provide a dummy GEMINI_API_KEY so 'ai' is initialized and we can test real execution failures (HTTP 500)
process.env.GEMINI_API_KEY = "dummy-api-key-for-testing-500-errors";

// 2. Import the express app dynamically to prevent ESM hoisting from executing server.ts before env vars are set
const { app } = await import("./server.js");

async function runTests() {
  console.log("--------------------------------------------------");
  console.log("🛡️ Starting Sentinel Security Integration Tests...");
  console.log("--------------------------------------------------");

  // Start server on an ephemeral port
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to get ephemeral port");
  }
  const port = address.port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  async function assertPost(
    path: string,
    body: any,
    expectedStatus: number,
    expectedErrorPart?: string
  ) {
    const url = `${baseUrl}${path}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status !== expectedStatus) {
        throw new Error(
          `Expected status ${expectedStatus}, but got ${response.status} for ${path}`
        );
      }

      const data: any = await response.json();
      if (expectedStatus >= 400) {
        if (!data.error) {
          throw new Error(`Expected error message, but got none for ${path}`);
        }
        if (expectedErrorPart && !data.error.toLowerCase().includes(expectedErrorPart.toLowerCase())) {
          throw new Error(
            `Expected error to contain "${expectedErrorPart}", but got: "${data.error}"`
          );
        }
      } else {
        if (data.error && !data.fallback && !data.warning) {
          throw new Error(`Unexpected error in successful response: ${JSON.stringify(data)}`);
        }
      }

      console.log(`✅ PASS: POST ${path} -> Status ${response.status} (Expected: ${expectedStatus})`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: POST ${path} with body ${JSON.stringify(body)}`);
      console.error(`   Reason: ${err.message}`);
      failed++;
    }
  }

  // --- TEST CASES ---

  // Endpoint 1: /api/ai/generate-question
  console.log("\nTesting /api/ai/generate-question...");
  // Valid (will call Gemini and throw due to dummy key, testing our 500 error handler!)
  await assertPost(
    "/api/ai/generate-question",
    {
      subject: "Biology",
      topic: "Cell Structure",
      difficulty: "Medium",
      paperType: "Paper 4 (Extended)",
    },
    500,
    "An unexpected error occurred"
  );

  // Invalid: Missing subject
  await assertPost(
    "/api/ai/generate-question",
    {
      topic: "Cell Structure",
      difficulty: "Medium",
      paperType: "Paper 4 (Extended)",
    },
    400,
    "field 'subject' must be a string"
  );

  // Invalid: Empty subject
  await assertPost(
    "/api/ai/generate-question",
    {
      subject: "   ",
      topic: "Cell Structure",
      difficulty: "Medium",
      paperType: "Paper 4 (Extended)",
    },
    400,
    "at least 1 characters"
  );

  // Invalid: Extremely long subject
  await assertPost(
    "/api/ai/generate-question",
    {
      subject: "A".repeat(100),
      topic: "Cell Structure",
      difficulty: "Medium",
      paperType: "Paper 4 (Extended)",
    },
    400,
    "at most 50 characters"
  );

  // Invalid: Topic is a number
  await assertPost(
    "/api/ai/generate-question",
    {
      subject: "Biology",
      topic: 12345,
      difficulty: "Medium",
      paperType: "Paper 4 (Extended)",
    },
    400,
    "field 'topic' must be a string"
  );


  // Endpoint 2: /api/ai/tutor
  console.log("\nTesting /api/ai/tutor...");
  // Valid (will throw 500 due to dummy key)
  await assertPost(
    "/api/ai/tutor",
    {
      message: "Can you explain photosynthesis?",
      history: [],
    },
    500,
    "An unexpected error occurred"
  );

  // Invalid: Missing message
  await assertPost(
    "/api/ai/tutor",
    {
      history: [],
    },
    400,
    "field 'message' must be a string"
  );

  // Invalid: Extremely long message
  await assertPost(
    "/api/ai/tutor",
    {
      message: "B".repeat(2000),
      history: [],
    },
    400,
    "at most 1000 characters"
  );

  // Invalid: History is not an array
  await assertPost(
    "/api/ai/tutor",
    {
      message: "Hello",
      history: "not-an-array",
    },
    400,
    "history' must be an array"
  );

  // Invalid: History contains non-object item
  await assertPost(
    "/api/ai/tutor",
    {
      message: "Hello",
      history: ["just-a-string"],
    },
    400,
    "must be an object"
  );

  // Invalid: History item role is missing
  await assertPost(
    "/api/ai/tutor",
    {
      message: "Hello",
      history: [{ content: "hi" }],
    },
    400,
    "role' must be a string"
  );


  // Endpoint 3: /api/ai/reading-assistance
  console.log("\nTesting /api/ai/reading-assistance...");
  // Valid (will throw 500 due to dummy key)
  await assertPost(
    "/api/ai/reading-assistance",
    {
      text: "This is some mock study reading material notes.",
      numQuestions: 3,
    },
    500,
    "An unexpected error occurred"
  );

  // Invalid: Missing text
  await assertPost(
    "/api/ai/reading-assistance",
    {
      numQuestions: 3,
    },
    400,
    "field 'text' must be a string"
  );

  // Invalid: Text too long
  await assertPost(
    "/api/ai/reading-assistance",
    {
      text: "C".repeat(6000),
      numQuestions: 3,
    },
    400,
    "at most 5000 characters"
  );

  // Invalid: numQuestions out of bounds
  await assertPost(
    "/api/ai/reading-assistance",
    {
      text: "Short text is fine",
      numQuestions: 20,
    },
    400,
    "at most 10"
  );

  // Invalid: numQuestions not an integer
  await assertPost(
    "/api/ai/reading-assistance",
    {
      text: "Short text is fine",
      numQuestions: "three",
    },
    400,
    "must be a valid integer"
  );


  // Endpoint 4: /api/ai/online-igcse-material
  console.log("\nTesting /api/ai/online-igcse-material...");
  // Valid (will throw 500 due to dummy key)
  await assertPost(
    "/api/ai/online-igcse-material",
    {
      grade: 11,
      subject: "Chemistry",
      topicKeyword: "Stoichiometry",
    },
    500,
    "An unexpected error occurred"
  );

  // Invalid: Grade too high
  await assertPost(
    "/api/ai/online-igcse-material",
    {
      grade: 12,
      subject: "Chemistry",
      topicKeyword: "Stoichiometry",
    },
    400,
    "at most 11"
  );

  // Invalid: Grade too low
  await assertPost(
    "/api/ai/online-igcse-material",
    {
      grade: 0,
      subject: "Chemistry",
      topicKeyword: "Stoichiometry",
    },
    400,
    "at least 1"
  );

  // Invalid: Subject too long
  await assertPost(
    "/api/ai/online-igcse-material",
    {
      grade: 9,
      subject: "D".repeat(60),
      topicKeyword: "Stoichiometry",
    },
    400,
    "at most 50 characters"
  );


  // Clean up and shutdown server
  server.close();

  console.log("\n--------------------------------------------------");
  console.log("🛡️ Sentinel Security Integration Test Summary:");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("--------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
