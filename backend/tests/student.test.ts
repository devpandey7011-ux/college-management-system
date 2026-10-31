
import request from "supertest";
import app from "../src/app";
import { connectTestDB, disconnectTestDB } from "./test-db";

describe("Student API", () => {
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

  test("GET /api/students/profile should reject an unauthenticated request", async () => {
    const response = await request(app).get("/api/students/profile");

    expect(response.status).toBe(401);
  });

  test("GET /api/students/profile should allow an authenticated student", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .get("/api/students/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("student");
  });

  test("GET /api/students/profile should reject a teacher", async () => {
    const token = await loginTeacher();

    const response = await request(app)
      .get("/api/students/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("PUT /api/students/profile should reject an unauthenticated request", async () => {
    const response = await request(app)
      .put("/api/students/profile")
      .send({
        phone: "9999999999",
      });

    expect(response.status).toBe(401);
  });

  test("PUT /api/students/profile should reject a teacher", async () => {
    const token = await loginTeacher();

    const response = await request(app)
      .put("/api/students/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phone: "9999999999",
      });

    expect(response.status).toBe(403);
  });

  test("PUT /api/students/profile should reject a phone number longer than 20 characters", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .put("/api/students/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phone: "123456789012345678901",
      });

    expect(response.status).toBe(400);
  });

  test("PUT /api/students/profile should reject an invalid date of birth", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .put("/api/students/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dateOfBirth: "not-a-valid-date",
      });

    expect(response.status).toBe(400);
  });

  test("PUT /api/students/profile should allow valid student profile data", async () => {
    const token = await loginStudent();

    const response = await request(app)
      .put("/api/students/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phone: "9999999999",
      });

    expect(response.status).toBe(200);
  });
});
