import request from "supertest";
import mongoose from "mongoose";

import app from "../src/app";

import Notice from "../src/models/Notice.model";
import Course from "../src/models/Course.model";
import Student from "../src/models/Student.model";
import Teacher from "../src/models/Teacher.model";

import {
  connectTestDB,
  disconnectTestDB,
} from "./test-db";

describe("Notices API", () => {
  let studentToken: string;
  let teacherToken: string;

  let studentUserId: mongoose.Types.ObjectId;
  let teacherUserId: mongoose.Types.ObjectId;

  let bcaCourseId: mongoose.Types.ObjectId;

  const createdNoticeIds: mongoose.Types.ObjectId[] = [];

  beforeAll(async () => {
    await connectTestDB();

    // --------------------------------------------------
    // Resolve BCA course
    // --------------------------------------------------

    const bcaCourse = await Course.findOne({
      code: "BCA",
    }).select("_id");

    if (!bcaCourse) {
      throw new Error("BCA course not found");
    }

    bcaCourseId = bcaCourse._id;

    // --------------------------------------------------
    // Resolve student user
    // --------------------------------------------------

    const student = await Student.findOne({
      userId: {
        $exists: true,
      },
    }).select("userId");

    if (!student?.userId) {
      throw new Error("No student with a userId found");
    }

    studentUserId = student.userId;

    // --------------------------------------------------
    // Resolve teacher user
    // --------------------------------------------------

    const teacher = await Teacher.findOne({
      user: {
        $exists: true,
      },
    }).select("user");

    if (!teacher?.user) {
      throw new Error("No teacher with a user found");
    }

    teacherUserId = teacher.user;

    // --------------------------------------------------
    // Login student
    // --------------------------------------------------

    const studentLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "karan.student@test.com",
        password: "Student@123",
      });

    expect(studentLogin.status).toBe(200);
    expect(studentLogin.body.token).toBeDefined();

    studentToken = studentLogin.body.token;

    // --------------------------------------------------
    // Login teacher
    // --------------------------------------------------

    const teacherLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "raj.teacher@test.com",
        password: "Teacher@123",
      });

    expect(teacherLogin.status).toBe(200);
    expect(teacherLogin.body.token).toBeDefined();

    teacherToken = teacherLogin.body.token;
  });

  afterEach(async () => {
    if (createdNoticeIds.length > 0) {
      await Notice.deleteMany({
        _id: {
          $in: createdNoticeIds,
        },
      });

      createdNoticeIds.length = 0;
    }
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  // ==================================================
  // GET /api/notices
  // ==================================================

  describe("GET /api/notices", () => {
    test("should reject an unauthenticated request", async () => {
      const response = await request(app)
        .get("/api/notices");

      expect(response.status).toBe(401);
    });

    test("should allow an authenticated student to view notices", async () => {
      const globalNotice = await Notice.create({
        title: "Global Student Test Notice",
        content: "Visible to everyone",
        audience: "all",
        createdBy: studentUserId,
      });

      const studentNotice = await Notice.create({
        title: "Student Test Notice",
        content: "Visible to students",
        audience: "students",
        createdBy: studentUserId,
      });

      const teacherNotice = await Notice.create({
        title: "Teacher Test Notice",
        content: "Should not be visible to students",
        audience: "teachers",
        createdBy: teacherUserId,
      });

      createdNoticeIds.push(
        globalNotice._id,
        studentNotice._id,
        teacherNotice._id
      );

      const response = await request(app)
        .get("/api/notices")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.notices)).toBe(true);

      const ids = response.body.notices.map(
        (notice: { _id: string }) => notice._id
      );

      expect(ids).toContain(
        globalNotice._id.toString()
      );

      expect(ids).toContain(
        studentNotice._id.toString()
      );

      expect(ids).not.toContain(
        teacherNotice._id.toString()
      );
    });

    test("should allow an authenticated teacher to view teacher and global notices", async () => {
      const globalNotice = await Notice.create({
        title: "Global Teacher Test Notice",
        content: "Visible to everyone",
        audience: "all",
        createdBy: studentUserId,
      });

      const teacherNotice = await Notice.create({
        title: "Teacher Audience Notice",
        content: "Visible to teachers",
        audience: "teachers",
        createdBy: teacherUserId,
      });

      const studentNotice = await Notice.create({
        title: "Student Audience Notice",
        content: "Should not be visible to teachers",
        audience: "students",
        createdBy: studentUserId,
      });

      createdNoticeIds.push(
        globalNotice._id,
        teacherNotice._id,
        studentNotice._id
      );

      const response = await request(app)
        .get("/api/notices")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.notices)).toBe(true);

      const ids = response.body.notices.map(
        (notice: { _id: string }) => notice._id
      );

      expect(ids).toContain(
        globalNotice._id.toString()
      );

      expect(ids).toContain(
        teacherNotice._id.toString()
      );

      expect(ids).not.toContain(
        studentNotice._id.toString()
      );
    });

    test("should allow a student to view a notice targeted to their course", async () => {
      const courseNotice = await Notice.create({
        title: "BCA Course Notice",
        content: "BCA students only",
        audience: "students",
        course: bcaCourseId,
        createdBy: studentUserId,
      });

      createdNoticeIds.push(courseNotice._id);

      const response = await request(app)
        .get("/api/notices")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);

      const ids = response.body.notices.map(
        (notice: { _id: string }) => notice._id
      );

      expect(ids).toContain(
        courseNotice._id.toString()
      );
    });

    test("should not expose a course-targeted student notice to a teacher", async () => {
      const courseNotice = await Notice.create({
        title: "Student Course Notice",
        content: "Students only",
        audience: "students",
        course: bcaCourseId,
        createdBy: studentUserId,
      });

      createdNoticeIds.push(courseNotice._id);

      const response = await request(app)
        .get("/api/notices")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);

      const ids = response.body.notices.map(
        (notice: { _id: string }) => notice._id
      );

      expect(ids).not.toContain(
        courseNotice._id.toString()
      );
    });
  });

  // ==================================================
  // GET /api/notices/:id
  // ==================================================

  describe("GET /api/notices/:id", () => {
    test("should reject an unauthenticated request", async () => {
      const notice = await Notice.create({
        title: "Unauthenticated Test Notice",
        content: "Test",
        audience: "all",
        createdBy: studentUserId,
      });

      createdNoticeIds.push(notice._id);

      const response = await request(app)
        .get(`/api/notices/${notice._id}`);

      expect(response.status).toBe(401);
    });

    test("should reject an invalid notice ID", async () => {
      const response = await request(app)
        .get("/api/notices/not-a-valid-id")
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        );

      expect(response.status).toBe(400);
    });

    test("should return 404 for a non-existent notice", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/notices/${fakeId}`)
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Notice not found"
      );
    });

    test("should allow a student to view a global notice", async () => {
      const notice = await Notice.create({
        title: "Global Detail Notice",
        content: "Global notice content",
        audience: "all",
        createdBy: studentUserId,
      });

      createdNoticeIds.push(notice._id);

      const response = await request(app)
        .get(`/api/notices/${notice._id}`)
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        );

      expect(response.status).toBe(200);
      expect(response.body.notice).toBeDefined();

      expect(response.body.notice._id).toBe(
        notice._id.toString()
      );

      expect(response.body.notice.title).toBe(
        "Global Detail Notice"
      );
    });

    test("should reject a student from viewing a teacher-only notice", async () => {
      const notice = await Notice.create({
        title: "Teacher Only Detail Notice",
        content: "Teacher content",
        audience: "teachers",
        createdBy: teacherUserId,
      });

      createdNoticeIds.push(notice._id);

      const response = await request(app)
        .get(`/api/notices/${notice._id}`)
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        );

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "You do not have permission to view this notice"
      );
    });

    test("should reject a teacher from viewing a student-only notice", async () => {
      const notice = await Notice.create({
        title: "Student Only Detail Notice",
        content: "Student content",
        audience: "students",
        createdBy: studentUserId,
      });

      createdNoticeIds.push(notice._id);

      const response = await request(app)
        .get(`/api/notices/${notice._id}`)
        .set(
          "Authorization",
          `Bearer ${teacherToken}`
        );

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "You do not have permission to view this notice"
      );
    });

    test("should allow a student to view a notice targeted to their course", async () => {
      const notice = await Notice.create({
        title: "BCA Detail Notice",
        content: "BCA student content",
        audience: "students",
        course: bcaCourseId,
        createdBy: studentUserId,
      });

      createdNoticeIds.push(notice._id);

      const response = await request(app)
        .get(`/api/notices/${notice._id}`)
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        );

      expect(response.status).toBe(200);
      expect(response.body.notice._id).toBe(
        notice._id.toString()
      );
    });
  });

  // ==================================================
  // POST /api/notices
  // ==================================================

  describe("POST /api/notices", () => {
    test("should reject an unauthenticated request", async () => {
      const response = await request(app)
        .post("/api/notices")
        .send({
          title: "Test Notice",
          content: "Test content",
          audience: "all",
        });

      expect(response.status).toBe(401);
    });

    test("should reject a student", async () => {
      const response = await request(app)
        .post("/api/notices")
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        )
        .send({
          title: "Student Attempt",
          content: "Should fail",
          audience: "all",
        });

      expect(response.status).toBe(403);
    });

    test("should reject a teacher", async () => {
      const response = await request(app)
        .post("/api/notices")
        .set(
          "Authorization",
          `Bearer ${teacherToken}`
        )
        .send({
          title: "Teacher Attempt",
          content: "Should fail",
          audience: "all",
        });

      expect(response.status).toBe(403);
    });

    test("should reject an invalid notice payload", async () => {
      const response = await request(app)
        .post("/api/notices")
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        )
        .send({
          title: "",
          content: "",
          audience: "invalid",
        });

      expect(response.status).toBe(403);
    });
  });

  // ==================================================
  // PUT /api/notices/:id
  // ==================================================

  describe("PUT /api/notices/:id", () => {
    test("should reject an unauthenticated request", async () => {
      const notice = await Notice.create({
        title: "Update Test Notice",
        content: "Original content",
        audience: "all",
        createdBy: studentUserId,
      });

      createdNoticeIds.push(notice._id);

      const response = await request(app)
        .put(`/api/notices/${notice._id}`)
        .send({
          title: "Updated title",
        });

      expect(response.status).toBe(401);
    });

    test("should reject a student", async () => {
      const notice = await Notice.create({
        title: "Student Update Attempt",
        content: "Original",
        audience: "all",
        createdBy: studentUserId,
      });

      createdNoticeIds.push(notice._id);

      const response = await request(app)
        .put(`/api/notices/${notice._id}`)
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        )
        .send({
          title: "Updated",
        });

      expect(response.status).toBe(403);
    });

    test("should reject a teacher", async () => {
      const notice = await Notice.create({
        title: "Teacher Update Attempt",
        content: "Original",
        audience: "all",
        createdBy: teacherUserId,
      });

      createdNoticeIds.push(notice._id);

      const response = await request(app)
        .put(`/api/notices/${notice._id}`)
        .set(
          "Authorization",
          `Bearer ${teacherToken}`
        )
        .send({
          title: "Updated",
        });

      expect(response.status).toBe(403);
    });

    test("should reject an invalid notice ID", async () => {
      const response = await request(app)
        .put("/api/notices/not-a-valid-id")
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        )
        .send({
          title: "Updated",
        });

      expect(response.status).toBe(403);
    });
  });

  // ==================================================
  // DELETE /api/notices/:id
  // ==================================================

  describe("DELETE /api/notices/:id", () => {
    test("should reject an unauthenticated request", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/notices/${fakeId}`);

      expect(response.status).toBe(401);
    });

    test("should reject a student", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/notices/${fakeId}`)
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        );

      expect(response.status).toBe(403);
    });

    test("should reject a teacher", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/notices/${fakeId}`)
        .set(
          "Authorization",
          `Bearer ${teacherToken}`
        );

      expect(response.status).toBe(403);
    });

    test("should reject an invalid notice ID", async () => {
      const response = await request(app)
        .delete("/api/notices/not-a-valid-id")
        .set(
          "Authorization",
          `Bearer ${studentToken}`
        );

      expect(response.status).toBe(403);
    });
  });
});