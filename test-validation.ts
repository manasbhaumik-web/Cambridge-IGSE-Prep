import assert from "assert";
import { ValidationError } from "./server.js";

// Integration & Unit test suite for backend input validation and secure error handling
async function runTests() {
  console.log("Running backend validation and secure error handling tests...");

  // Set the environment to test to suppress starting the actual server bootstrap listening
  process.env.NODE_ENV = "test";

  // Use dynamic import to import server AFTER process.env.NODE_ENV is set to "test"
  const serverModule = await import("./server.js");
  const app = serverModule.default;

  // Mock request and response objects to test Express app routing & handlers directly
  const createMockRes = () => {
    const res: any = {
      statusCode: 200,
      headers: {},
      body: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this.body = data;
        return this;
      }
    };
    return res;
  };

  const getHandler = (route: string) => {
    const layer = app._router.stack.find((l: any) => l.route && l.route.path === route);
    if (!layer) throw new Error(`Route handler for ${route} not found`);
    return layer.route.stack[0].handle;
  };

  // 1. Test generate-question validation
  console.log("-> Testing /api/ai/generate-question validation...");
  const generateQuestionHandler = getHandler("/api/ai/generate-question");

  // Invalid subject type
  let res = createMockRes();
  await generateQuestionHandler({ body: { subject: 123, topic: "Cell Division", difficulty: "Easy", paperType: "Paper 1" } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'subject' must be a string/);

  // Blank subject
  res = createMockRes();
  await generateQuestionHandler({ body: { subject: "   ", topic: "Cell Division", difficulty: "Easy", paperType: "Paper 1" } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'subject' must be at least 1 characters/);

  // Subject too long
  res = createMockRes();
  await generateQuestionHandler({ body: { subject: "a".repeat(101), topic: "Cell Division", difficulty: "Easy", paperType: "Paper 1" } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'subject' must be at most 100 characters/);

  // Valid inputs (Gemini not configured fallback)
  res = createMockRes();
  await generateQuestionHandler({ body: { subject: "Biology", topic: "Cell Division", difficulty: "Easy", paperType: "Paper 1" } }, res);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.fallback);

  // 2. Test chatbot tutor validation
  console.log("-> Testing /api/ai/tutor validation...");
  const tutorHandler = getHandler("/api/ai/tutor");

  // Missing/invalid message
  res = createMockRes();
  await tutorHandler({ body: { message: "", history: [] } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'message' must be at least 1 characters/);

  // Invalid history type
  res = createMockRes();
  await tutorHandler({ body: { message: "Hello", history: "invalid" } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'history' must be an array of messages/);

  // Valid chatbot response when offline
  res = createMockRes();
  await tutorHandler({ body: { message: "Hello", history: [] } }, res);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.reply);

  // 3. Test AI Reading Assistant validation
  console.log("-> Testing /api/ai/reading-assistance validation...");
  const readingAssistanceHandler = getHandler("/api/ai/reading-assistance");

  // Missing text
  res = createMockRes();
  await readingAssistanceHandler({ body: { text: "", numQuestions: 3 } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'text' must be at least 1 characters/);

  // Invalid numQuestions type
  res = createMockRes();
  await readingAssistanceHandler({ body: { text: "Some study text", numQuestions: "invalid" } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'numQuestions' must be a valid integer/);

  // Out of bounds numQuestions
  res = createMockRes();
  await readingAssistanceHandler({ body: { text: "Some study text", numQuestions: 11 } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'numQuestions' must be at most 10/);

  // Valid request when offline
  res = createMockRes();
  await readingAssistanceHandler({ body: { text: "Some study text", numQuestions: 3 } }, res);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.offline);

  // 4. Test IGCSE Approved Online Material Selector validation
  console.log("-> Testing /api/ai/online-igcse-material validation...");
  const onlineIgcseMaterialHandler = getHandler("/api/ai/online-igcse-material");

  // Out of bounds grade
  res = createMockRes();
  await onlineIgcseMaterialHandler({ body: { grade: 12, subject: "Biology", topicKeyword: "Cell Division" } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.error, /Field 'grade' must be at most 11/);

  // Valid request when offline
  res = createMockRes();
  await onlineIgcseMaterialHandler({ body: { grade: 7, subject: "Biology", topicKeyword: "Cell Division" } }, res);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.title);

  console.log("All backend validation and secure error handling tests passed successfully!");
}

runTests().catch(err => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
