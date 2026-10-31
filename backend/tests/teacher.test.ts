
import request from "supertest";
import app from "../src/app";
import { connectTestDB, disconnectTestDB } from "./test-db";

describe("Teacher API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  const loginTeacher = async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "amit.teacher@test.com",
        password: "Teacher@123",
      });

    expect(response.status).toBe(200);

    return response.body.token;
  };

  const loginStudent = async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "karan.student@test.com",
        password: "Student@123",
      });

    expect(response.status).toBe(200);

    return response.body.token;
  };

  describe("GET /api/teachers/profile", () => {
    test("should reject an unauthenticated request", async () => {
      const response = await request(app).get("/api/teachers/profile");

      expect(response.status).toBe(401);
    });

    test("should allow an authenticated teacher", async () => {
      const token = await loginTeacher();

      const response = await request(app)
        .get("/api/teachers/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty("teacher");
      expect(response.body.teacher).toHaveProperty("teacherId", "T003-NEW");
      expect(response.body.teacher).toHaveProperty("department");
    });

    test("should reject a student", async () => {
      const token = await loginStudent();

      const response = await request(app)
        .get("/api/teachers/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/teachers/profile", () => {
    test("should reject an unauthenticated request", async () => {
      const response = await request(app)
        .put("/api/teachers/profile")
        .send({
          phone: "9999999999",
        });

      expect(response.status).toBe(401);
    });

    test("should reject a student", async () => {
      const token = await loginStudent();

      const response = await request(app)
        .put("/api/teachers/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          phone: "9999999999",
        });

      expect(response.status).toBe(403);
    });

    test("should allow a teacher to update their profile", async () => {
      const token = await loginTeacher();

      const response = await request(app)
        .put("/api/teachers/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          phone: "9999999999",
        });

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty(
        "message",
        "Profile updated successfully"
      );

      expect(response.body).toHaveProperty("teacher");
      expect(response.body.teacher).toHaveProperty("phone", "9999999999");
    });
  });

  describe("GET /api/teachers/students", () => {
    test("should reject an unauthenticated request", async () => {
      const response = await request(app).get("/api/teachers/students");

      expect(response.status).toBe(401);
    });

    test("should reject a student", async () => {
      const token = await loginStudent();

      const response = await request(app)
        .get("/api/teachers/students")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    test("should return only students within the teacher's assigned academic scope", async () => {
      const token = await loginTeacher();

      const response = await request(app)
        .get("/api/teachers/students")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(Array.isArray(response.body)).toBe(true);

      const karan = response.body.find(
        (student: {
          enrollmentNumber?: string;
          email?: string;
        }) =>
          student.email === "karan.student@test.com" ||
          student.enrollmentNumber === "BCA-2024-001"
      );

      expect(karan).toBeDefined();

      expect(karan).toHaveProperty("course", "BCA");
      expect(karan).toHaveProperty("semester", 4);

      for (const student of response.body) {
        expect(student).toHaveProperty("id");
        expect(student).toHaveProperty("name");
        expect(student).toHaveProperty("email");
        expect(student).toHaveProperty("enrollmentNumber");
        expect(student).toHaveProperty("course");
        expect(student).toHaveProperty("semester");

        expect(student.course).toBe("BCA");
        expect(student.semester).toBe(4);
      }
    });
  });

  describe("GET /api/teachers/subject-assignments", () => {
    test("should reject an unauthenticated request", async () => {
      const response = await request(app).get(
        "/api/teachers/subject-assignments"
      );

      expect(response.status).toBe(401);
    });

    test("should reject a student", async () => {
      const token = await loginStudent();

      const response = await request(app)
        .get("/api/teachers/subject-assignments")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    test("should return the authenticated teacher's subject assignments", async () => {
      const token = await loginTeacher();

      const response = await request(app)
        .get("/api/teachers/subject-assignments")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty("assignments");
      expect(Array.isArray(response.body.assignments)).toBe(true);

      expect(response.body.assignments.length).toBeGreaterThan(0);

      const webDevelopmentAssignment =
        response.body.assignments.find(
          (assignment: {
            subject?: {
              code?: string;
              name?: string;
            };
          }) =>
            assignment.subject?.code === "BCA-WD" ||
            assignment.subject?.name === "Web Development"
        );

      expect(webDevelopmentAssignment).toBeDefined();

      expect(webDevelopmentAssignment).toHaveProperty("course");
      expect(webDevelopmentAssignment.course).toHaveProperty("code", "BCA");

      expect(webDevelopmentAssignment).toHaveProperty("subject");
      expect(webDevelopmentAssignment.subject).toHaveProperty(
        "code",
        "BCA-WD"
      );
      expect(webDevelopmentAssignment.subject).toHaveProperty(
        "name",
        "Web Development"
      );
      expect(webDevelopmentAssignment.subject).toHaveProperty(
        "semester",
        4
      );
      expect(webDevelopmentAssignment.subject).toHaveProperty(
        "credits"
      );
    });
  });
});

