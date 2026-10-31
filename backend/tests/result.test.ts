
import request from "supertest";
import app from "../src/app";

import { connectTestDB, disconnectTestDB } from "./test-db";
import Result from "../src/models/Result.model";
import Student from "../src/models/Student.model";
import Subject from "../src/models/Subject.model";

describe("Results API", () => {
  let studentToken: string;
  let amitToken: string;
  let rajToken: string;

  let createdResultId: string | undefined;

  beforeAll(async () => {
    await connectTestDB();

    const studentLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "karan.student@test.com",
        password: "Student@123",
      });

    expect(studentLogin.status).toBe(200);
    studentToken = studentLogin.body.token;

    const amitLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "amit.teacher@test.com",
        password: "Teacher@123",
      });

    expect(amitLogin.status).toBe(200);
    amitToken = amitLogin.body.token;

    const rajLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "raj.teacher@test.com",
        password: "Teacher@123",
      });

    expect(rajLogin.status).toBe(200);
    rajToken = rajLogin.body.token;

    // Remove only the specific test result used by this suite.
    // This makes repeated test runs safe.
    const student = await Student.findOne({
      enrollmentNumber: "BCA-2024-001",
    });

    const subject = await Subject.findOne({
      code: "BCA-WD",
    });

    if (student && subject) {
      await Result.deleteOne({
        student: student._id,
        subject: subject._id,
        examType: "final",
      });
    }
  });

  afterAll(async () => {
    if (createdResultId) {
      await Result.findByIdAndDelete(createdResultId);
    }

    await disconnectTestDB();
  });

  describe("GET /api/results/my-results", () => {
    test("should reject an unauthenticated request", async () => {
      const response = await request(app).get("/api/results/my-results");

      expect(response.status).toBe(401);
    });

    test("should reject a teacher", async () => {
      const response = await request(app)
        .get("/api/results/my-results")
        .set("Authorization", `Bearer ${amitToken}`);

      expect(response.status).toBe(403);
    });

    test("should allow an authenticated student to view their own results", async () => {
      const response = await request(app)
        .get("/api/results/my-results")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty("results");
      expect(Array.isArray(response.body.results)).toBe(true);

      for (const result of response.body.results) {
        expect(result).toHaveProperty("student");
        expect(result).toHaveProperty("subject");
        expect(result).toHaveProperty("examType");
        expect(result).toHaveProperty("marksObtained");
        expect(result).toHaveProperty("maxMarks");
        expect(result).toHaveProperty("grade");
      }
    });
  });

  describe("POST /api/results", () => {
    test("should reject an unauthenticated request", async () => {
      const response = await request(app)
        .post("/api/results")
        .send({
          student: "6ab3afdca25f324ac99a8bff",
          subject: "6ab3b2cba25f324ac99a8c03",
          examType: "final",
          marksObtained: 80,
          maxMarks: 100,
        });

      expect(response.status).toBe(401);
    });

    test("should reject a student", async () => {
      const response = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          student: "6ab3afdca25f324ac99a8bff",
          subject: "6ab3b2cba25f324ac99a8c03",
          examType: "final",
          marksObtained: 80,
          maxMarks: 100,
        });

      expect(response.status).toBe(403);
    });

    test("should reject an invalid result payload", async () => {
      const response = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          student: "not-an-object-id",
          subject: "not-an-object-id",
          examType: "invalid",
          marksObtained: -10,
          maxMarks: 0,
        });

      expect(response.status).toBe(400);
    });

    test("should reject marks greater than maximum marks", async () => {
      const response = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          student: "6ab3afdca25f324ac99a8bff",
          subject: "6ab3b2cba25f324ac99a8c03",
          examType: "final",
          marksObtained: 101,
          maxMarks: 100,
        });

      expect(response.status).toBe(400);
    });

    test("should reject negative marks", async () => {
      const response = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          student: "6ab3afdca25f324ac99a8bff",
          subject: "6ab3b2cba25f324ac99a8c03",
          examType: "final",
          marksObtained: -1,
          maxMarks: 100,
        });

      expect(response.status).toBe(400);
    });

    test("should reject a teacher who is not assigned to the requested subject", async () => {
      const response = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${rajToken}`)
        .send({
          student: "6ab3afdca25f324ac99a8bff",
          subject: "6ab3b2cba25f324ac99a8c03",
          examType: "final",
          marksObtained: 80,
          maxMarks: 100,
        });

      expect(response.status).toBe(403);

      expect(response.body).toHaveProperty(
        "message",
        "You are not assigned to this subject"
      );
    });

    test("should reject a subject that does not belong to the student's semester", async () => {
      const response = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          student: "6ab3aedda25f324ac99a8bf5",
          subject: "6ab3b2cba25f324ac99a8c03",
          examType: "final",
          marksObtained: 80,
          maxMarks: 100,
        });

      expect(response.status).toBe(403);

      expect(response.body).toHaveProperty(
        "message",
        "Subject does not belong to the student's semester"
      );
    });

    test("should create a valid result for an assigned student and subject", async () => {
      const response = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          student: "6ab3afdca25f324ac99a8bff",
          subject: "6ab3b2cba25f324ac99a8c03",
          examType: "final",
          marksObtained: 85,
          maxMarks: 100,
          remarks: "Automated API test result",
        });

      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty(
        "message",
        "Result uploaded successfully"
      );

      expect(response.body).toHaveProperty("result");

      expect(response.body.result).toHaveProperty(
        "marksObtained",
        85
      );
      expect(response.body.result).toHaveProperty("maxMarks", 100);
      expect(response.body.result).toHaveProperty("grade", "A");
      expect(response.body.result).toHaveProperty(
        "examType",
        "final"
      );

      createdResultId = response.body.result._id;

      expect(createdResultId).toBeDefined();
    });

    test("should reject a duplicate result for the same student, subject and exam type", async () => {
      const response = await request(app)
        .post("/api/results")
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          student: "6ab3afdca25f324ac99a8bff",
          subject: "6ab3b2cba25f324ac99a8c03",
          examType: "final",
          marksObtained: 90,
          maxMarks: 100,
        });

      expect(response.status).toBe(409);

      expect(response.body).toHaveProperty(
        "message",
        "Result already exists for this student, subject and exam type"
      );
    });
  });

  describe("PUT /api/results/:id", () => {
    test("should reject an unauthenticated request", async () => {
      expect(createdResultId).toBeDefined();

      const response = await request(app)
        .put(`/api/results/${createdResultId}`)
        .send({
          marksObtained: 90,
        });

      expect(response.status).toBe(401);
    });

    test("should reject a student", async () => {
      expect(createdResultId).toBeDefined();

      const response = await request(app)
        .put(`/api/results/${createdResultId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          marksObtained: 90,
        });

      expect(response.status).toBe(403);
    });

    test("should reject another teacher from updating the result", async () => {
      expect(createdResultId).toBeDefined();

      const response = await request(app)
        .put(`/api/results/${createdResultId}`)
        .set("Authorization", `Bearer ${rajToken}`)
        .send({
          marksObtained: 90,
        });

      expect(response.status).toBe(403);

      expect(response.body).toHaveProperty(
        "message",
        "You do not have permission to update this result"
      );
    });

    test("should reject marks greater than maximum marks", async () => {
      expect(createdResultId).toBeDefined();

      const response = await request(app)
        .put(`/api/results/${createdResultId}`)
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          marksObtained: 101,
        });

      expect(response.status).toBe(400);
    });

    test("should reject a negative maximum marks value", async () => {
      expect(createdResultId).toBeDefined();

      const response = await request(app)
        .put(`/api/results/${createdResultId}`)
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          maxMarks: -10,
        });

      expect(response.status).toBe(400);
    });

    test("should allow the teacher who created the result to update it", async () => {
      expect(createdResultId).toBeDefined();

      const response = await request(app)
        .put(`/api/results/${createdResultId}`)
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          marksObtained: 90,
          remarks: "Updated automated API test result",
        });

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty(
        "message",
        "Result updated successfully"
      );

      expect(response.body.result).toHaveProperty(
        "marksObtained",
        90
      );
      expect(response.body.result).toHaveProperty("maxMarks", 100);
      expect(response.body.result).toHaveProperty("grade", "A+");
      expect(response.body.result).toHaveProperty(
        "remarks",
        "Updated automated API test result"
      );
    });

    test("should reject an invalid result ID", async () => {
      const response = await request(app)
        .put("/api/results/not-a-valid-object-id")
        .set("Authorization", `Bearer ${amitToken}`)
        .send({
          marksObtained: 90,
        });

      expect(response.status).toBe(400);
    });
  });
});
