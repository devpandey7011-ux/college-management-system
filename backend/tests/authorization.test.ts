
import request from "supertest";
import app from "../src/app";
import { connectTestDB, disconnectTestDB } from "./test-db";

describe("Role Authorization API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

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

  const loginTeacher = async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "raj.teacher@test.com",
        password: "Teacher@123",
      });

    expect(response.status).toBe(200);

    return response.body.token;
  };

  test("GET /api/admin/students should reject an unauthenticated request", async () => {
    const response = await request(app).get("/api/admin/students");

    expect(response.status).toBe(401);
  });

  test("GET /api/admin/students should reject a student", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .get("/api/admin/students")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("GET /api/admin/students should reject a teacher", async () => {
    const token = await loginTeacher();

    const response = await request(app)
      .get("/api/admin/students")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("POST /api/admin/courses should reject a student", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .post("/api/admin/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Unauthorized Course",
        code: "UNAUTHORIZED-TEST",
        totalSemesters: 6,
      });

    expect(response.status).toBe(403);
  });

  test("POST /api/admin/courses should reject a teacher", async () => {
    const token = await loginTeacher();

    const response = await request(app)
      .post("/api/admin/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Unauthorized Course",
        code: "UNAUTHORIZED-TEST",
        totalSemesters: 6,
      });

    expect(response.status).toBe(403);
  });

  test("GET /api/admin/teachers should reject a student", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .get("/api/admin/teachers")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("GET /api/admin/teachers should reject a teacher", async () => {
    const token = await loginTeacher();

    const response = await request(app)
      .get("/api/admin/teachers")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("GET /api/admin/subjects should reject a student", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .get("/api/admin/subjects")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("GET /api/admin/subjects should reject a teacher", async () => {
    const token = await loginTeacher();

    const response = await request(app)
      .get("/api/admin/subjects")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("GET /api/admin/subject-assignments should reject a student", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .get("/api/admin/subject-assignments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("GET /api/admin/subject-assignments should reject a teacher", async () => {
    const token = await loginTeacher();

    const response = await request(app)
      .get("/api/admin/subject-assignments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
