import { AddressInfo } from "net";

async function runTests() {
  process.env.NODE_ENV = "test";

  // Dynamically import the server to prevent bootstrap running before NODE_ENV is set
  const { app } = await import("./server.js");

  // Start the server on a free dynamic port
  const server = app.listen(0, "127.0.0.1", async () => {
    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;
    console.log(`Test server running at ${baseUrl}`);

    let failed = false;

    async function assertResponse(
      endpoint: string,
      body: object,
      expectedStatus: number,
      expectedErrorMessage?: string
    ) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (response.status !== expectedStatus) {
          throw new Error(`Expected status ${expectedStatus}, but got ${response.status}`);
        }

        const data = await response.json();
        if (expectedStatus === 400) {
          if (!data.error) {
            throw new Error(`Expected error message, but got none`);
          }
          if (expectedErrorMessage && !data.error.includes(expectedErrorMessage)) {
            throw new Error(`Expected error message to contain "${expectedErrorMessage}", but got "${data.error}"`);
          }
        }
        console.log(`\u001b[32m\u2714\u001b[0m POST ${endpoint} with ${JSON.stringify(body).slice(0, 60)}... -> Status ${response.status}`);
      } catch (err: any) {
        console.error(`\u001b[31m\u2718\u001b[0m FAILED: POST ${endpoint} with ${JSON.stringify(body)}:`, err.message);
        failed = true;
      }
    }

    console.log("\n--- RUNNING VALIDATION TESTS ---");

    // 1. generate-question
    // Good input (should succeed with 200, offline or online mode)
    await assertResponse("/api/ai/generate-question", {
      subject: "Biology",
      topic: "Photosynthesis",
      difficulty: "Medium",
      paperType: "Paper 4 (Extended)"
    }, 200);

    // Missing subject
    await assertResponse("/api/ai/generate-question", {
      topic: "Photosynthesis",
      difficulty: "Medium",
      paperType: "Paper 4"
    }, 400, "subject is required");

    // Subject too long
    await assertResponse("/api/ai/generate-question", {
      subject: "A".repeat(101),
      topic: "Photosynthesis",
      difficulty: "Medium",
      paperType: "Paper 4"
    }, 400, "subject exceeds maximum length");

    // Topic too long
    await assertResponse("/api/ai/generate-question", {
      subject: "Biology",
      topic: "A".repeat(201),
      difficulty: "Medium",
      paperType: "Paper 4"
    }, 400, "topic exceeds maximum length");


    // 2. tutor
    // Good input
    await assertResponse("/api/ai/tutor", {
      message: "Explain gravity."
    }, 200);

    // Missing message
    await assertResponse("/api/ai/tutor", {}, 400, "message is required");

    // Bad history structure
    await assertResponse("/api/ai/tutor", {
      message: "Explain gravity.",
      history: "not-an-array"
    }, 400, "history must be an array");

    await assertResponse("/api/ai/tutor", {
      message: "Explain gravity.",
      history: [{ role: "invalid_role", content: "hi" }]
    }, 400, "role must be 'user' or 'model'");


    // 3. reading-assistance
    // Good input
    await assertResponse("/api/ai/reading-assistance", {
      text: "This is photosynthesis syllabus text."
    }, 200);

    // Missing text
    await assertResponse("/api/ai/reading-assistance", {}, 400, "text is required");

    // Too high numQuestions
    await assertResponse("/api/ai/reading-assistance", {
      text: "This is text.",
      numQuestions: 15
    }, 400, "numQuestions must be between 1 and 10");


    // 4. online-igcse-material
    // Good input
    await assertResponse("/api/ai/online-igcse-material", {
      grade: 9,
      subject: "Chemistry",
      topicKeyword: "Acids and Bases"
    }, 200);

    // Bad grade out of bounds
    await assertResponse("/api/ai/online-igcse-material", {
      grade: 12,
      subject: "Chemistry",
      topicKeyword: "Acids"
    }, 400, "grade must be between 1 and 11");

    // Grade missing/invalid
    await assertResponse("/api/ai/online-igcse-material", {
      subject: "Chemistry",
      topicKeyword: "Acids"
    }, 400, "grade is required");

    // Subject missing
    await assertResponse("/api/ai/online-igcse-material", {
      grade: 8,
      topicKeyword: "Acids"
    }, 400, "subject is required");

    server.close(() => {
      console.log("\n--- TEST RUN FINISHED ---");
      if (failed) {
        console.error("❌ Some validation tests FAILED!");
        process.exit(1);
      } else {
        console.log("🎉 All validation tests PASSED successfully!");
        process.exit(0);
      }
    });
  });
}

runTests().catch(err => {
  console.error("Unhandled test execution error:", err);
  process.exit(1);
});
