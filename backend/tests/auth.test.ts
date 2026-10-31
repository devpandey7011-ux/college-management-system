
import request from "supertest";
import app from "../src/app";
import { connectTestDB, disconnectTestDB } from "./test-db";

import Otp from "../src/models/Otp.model";
import { generateOtp } from "../src/utils/otp";



jest.mock("../src/utils/otp", () => {
  const crypto = require("crypto");

  return {
    generateOtp: jest.fn(() => "482731"),
    hashOtp: (otp: string) =>
      crypto.createHash("sha256").update(otp).digest("hex"),
  };
});




describe("Authentication API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  test("POST /api/auth/login should login a valid student", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "karan.student@test.com",
        password: "Student@123",
      });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
    expect(response.body.token.length).toBeGreaterThan(0);

    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty(
      "email",
      "karan.student@test.com"
    );
    expect(response.body.user).toHaveProperty("role", "student");
  });

  test("POST /api/auth/login should reject an incorrect password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "karan.student@test.com",
        password: "WrongPassword@123",
      });

    expect(response.status).toBe(401);
  });

  test("POST /api/auth/login should reject invalid input", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "not-an-email",
        password: "",
      });

    expect(response.status).toBe(400);
  });

  test("GET /api/auth/me should return the authenticated user", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "karan.student@test.com",
        password: "Student@123",
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty(
      "email",
      "karan.student@test.com"
    );
    expect(response.body.user).toHaveProperty("role", "student");
  });

  test("GET /api/auth/me should reject a request without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  test("GET /api/auth/me should reject an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.jwt.token");

    expect(response.status).toBe(401);
  });

  test("POST /api/auth/forgot-password should return a generic response for an existing email", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "karan.student@test.com",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  test("POST /api/auth/forgot-password should return the same generic response for an unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "does-not-exist@test.com",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  test("POST /api/auth/forgot-password should reject invalid input", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "not-an-email",
      });

    expect(response.status).toBe(400);
  });

 
  test("POST /api/auth/register/request-otp should reject invalid input", async () => {
    const response = await request(app)
      .post("/api/auth/register/request-otp")
      .send({
        email: "not-an-email",
      });

    expect(response.status).toBe(400);
  });

  test("POST /api/auth/register/request-otp should reject an already registered email", async () => {
    const response = await request(app)
      .post("/api/auth/register/request-otp")
      .send({
        email: "karan.student@test.com",
      });

    expect(response.status).toBe(400);
  });

  test("POST /api/auth/register/verify-otp should reject an invalid OTP", async () => {
    const response = await request(app)
      .post("/api/auth/register/verify-otp")
      .send({
        email: "new-registration-test@test.com",
        otp: "000000",
        password: "Student@123",
        name: "Registration Test Student",
      });

    expect([400, 401, 404]).toContain(response.status);
  });

  
test("password reset token should only work once", async () => {
  const email = "karan.student@test.com";
  const otp = "482731";
  (generateOtp as jest.Mock).mockReturnValue(otp);

  // Request a password-reset OTP.
  const requestOtpResponse = await request(app)
    .post("/api/auth/forgot-password")
    .send({ email });

  expect(requestOtpResponse.status).toBe(200);

  // Verify the OTP and obtain a reset token.
  const verifyOtpResponse = await request(app)
    .post("/api/auth/verify-reset-otp")
    .send({ email, otp });

  expect(verifyOtpResponse.status).toBe(200);
  expect(verifyOtpResponse.body).toHaveProperty("resetToken");

  const resetToken = verifyOtpResponse.body.resetToken;

  // Use the token once.
  
  const firstResetResponse = await request(app)
    .post("/api/auth/reset-password")
    .send({
      resetToken: resetToken,
      password: "NewStudent@123",
    });


  expect(firstResetResponse.status).toBe(200);


  // The same token must now be rejected.
  const secondResetResponse = await request(app)
    .post("/api/auth/reset-password")
    .send({
      resetToken: resetToken,
      password: "AnotherStudent@123",
    });

  expect(secondResetResponse.status).toBe(401);

  // Confirm the new password works.
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password: "NewStudent@123",
    });

  expect(loginResponse.status).toBe(200);

  // Restore the shared test account's original password.
  const restoreOtp = "593184";
  (generateOtp as jest.Mock).mockReturnValue(restoreOtp);

  const restoreRequest = await request(app)
    .post("/api/auth/forgot-password")
    .send({ email });

  expect(restoreRequest.status).toBe(200);

  const restoreVerify = await request(app)
    .post("/api/auth/verify-reset-otp")
    .send({ email, otp: restoreOtp });

  expect(restoreVerify.status).toBe(200);

 
const restoreReset = await request(app)
  .post("/api/auth/reset-password")
  .send({
    resetToken: restoreVerify.body.resetToken,
    password: "Student@123",
  });


  expect(restoreReset.status).toBe(200);

  await Otp.deleteMany({
    email,
    purpose: "reset-password",
  });
});


});
