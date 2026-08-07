import { test } from "node:test";
import assert from "node:assert";
import http from "http";

// In ES Module environments, setting test environment variables must happen before importing the server.
// Dynamic import ensures that NODE_ENV is set to suppress live bootstrapping of the server.
process.env.NODE_ENV = "test";

const { app } = await import("./server.ts");

// Helper to send a POST request to our express app without listening on a live port
function makeRequest(path: string, body: any): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        return reject(new Error("Failed to get server address"));
      }

      const postData = JSON.stringify(body);
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        },
        (res) => {
          let rawData = "";
          res.on("data", (chunk) => {
            rawData += chunk;
          });
          res.on("end", () => {
            server.close();
            try {
              const parsed = JSON.parse(rawData);
              resolve({ statusCode: res.statusCode || 0, data: parsed });
            } catch (err) {
              resolve({ statusCode: res.statusCode || 0, data: rawData });
            }
          });
        }
      );

      req.on("error", (err) => {
        server.close();
        reject(err);
      });

      req.write(postData);
      req.end();
    });
  });
}

test("1. /api/ai/generate-question input validation", async (t) => {
  await t.test("should fail validation (HTTP 400) if missing subject", async () => {
    const res = await makeRequest("/api/ai/generate-question", {
      topic: "Photosynthesis",
      difficulty: "Medium",
      paperType: "Paper 4"
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'subject' must be a string/);
  });

  await t.test("should fail validation (HTTP 400) if subject is too short", async () => {
    const res = await makeRequest("/api/ai/generate-question", {
      subject: "",
      topic: "Photosynthesis",
      difficulty: "Medium",
      paperType: "Paper 4"
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'subject' must be between 1 and 100 characters/);
  });

  await t.test("should return 200 fallback structure when AI is not configured but inputs are valid", async () => {
    const res = await makeRequest("/api/ai/generate-question", {
      subject: "Biology",
      topic: "Photosynthesis",
      difficulty: "Medium",
      paperType: "Paper 4"
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.fallback, true);
  });
});

test("2. /api/ai/tutor input validation", async (t) => {
  await t.test("should fail validation (HTTP 400) if missing message", async () => {
    const res = await makeRequest("/api/ai/tutor", {});
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'message' must be a string/);
  });

  await t.test("should fail validation (HTTP 400) if history is not an array", async () => {
    const res = await makeRequest("/api/ai/tutor", {
      message: "Hello",
      history: "not-an-array"
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'history' must be an array/);
  });

  await t.test("should fail validation (HTTP 400) if history items have wrong role type", async () => {
    const res = await makeRequest("/api/ai/tutor", {
      message: "Hello",
      history: [{ role: 123, content: "hi" }]
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'history.role' must be a string/);
  });

  await t.test("should succeed (HTTP 200) with valid inputs in tutor", async () => {
    const res = await makeRequest("/api/ai/tutor", {
      message: "Explain covalent bonds",
      history: [{ role: "user", content: "hello" }]
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.data.reply);
  });
});

test("3. /api/ai/reading-assistance input validation", async (t) => {
  await t.test("should fail validation (HTTP 400) if text is missing", async () => {
    const res = await makeRequest("/api/ai/reading-assistance", {});
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'text' must be a string/);
  });

  await t.test("should fail validation (HTTP 400) if numQuestions is out of bounds", async () => {
    const res = await makeRequest("/api/ai/reading-assistance", {
      text: "Some valid textbook content",
      numQuestions: 20
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'numQuestions' must be between 1 and 10/);
  });

  await t.test("should succeed (HTTP 200) with valid text content", async () => {
    const res = await makeRequest("/api/ai/reading-assistance", {
      text: "This is some syllabus study guide text to summarize.",
      numQuestions: 2
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.data.summary);
  });
});

test("4. /api/ai/online-igcse-material input validation", async (t) => {
  await t.test("should fail validation (HTTP 400) if grade is too high", async () => {
    const res = await makeRequest("/api/ai/online-igcse-material", {
      grade: 12,
      subject: "Chemistry",
      topicKeyword: "Stoichiometry"
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'grade' must be between 1 and 11/);
  });

  await t.test("should fail validation (HTTP 400) if grade is negative", async () => {
    const res = await makeRequest("/api/ai/online-igcse-material", {
      grade: -1,
      subject: "Chemistry",
      topicKeyword: "Stoichiometry"
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'grade' must be between 1 and 11/);
  });

  await t.test("should fail validation (HTTP 400) if grade is a non-numeric string", async () => {
    const res = await makeRequest("/api/ai/online-igcse-material", {
      grade: "primary-5",
      subject: "Chemistry",
      topicKeyword: "Stoichiometry"
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.data.error, /Field 'grade' must be a valid number or numeric string between 1 and 11/);
  });

  await t.test("should succeed (HTTP 200) with valid parameters", async () => {
    const res = await makeRequest("/api/ai/online-igcse-material", {
      grade: 10,
      subject: "Chemistry",
      topicKeyword: "Stoichiometry"
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.difficulty, "Exam Standard");
  });

  await t.test("should succeed (HTTP 200) with numeric string grade", async () => {
    const res = await makeRequest("/api/ai/online-igcse-material", {
      grade: "5",
      subject: "Chemistry",
      topicKeyword: "Stoichiometry"
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.difficulty, "Easy");
  });
});
