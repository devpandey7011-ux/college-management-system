
import request from "supertest";
import app from "../src/app";

describe("Root API", () => {
  test("GET / should return API status", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      message: "College Management API is running",
    });
  });
});
