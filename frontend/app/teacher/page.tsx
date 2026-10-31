"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  getMyTeacherAssignments,
  getTeacherStudents,
} from "@/services/teacher.service";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";

import CreateAssignmentForm from "@/components/teacher/CreateAssignmentForm";
import UploadResultForm from "@/components/teacher/UploadResultForm";
import AttendanceForm from "@/components/teacher/AttendanceForm";
import NoticesList from "@/components/teacher/NoticesList";

import styles from "./page.module.css";

export default function TeacherPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const {
    data: students = [],
    isLoading: studentsLoading,
    isError: studentsError,
  } = useQuery({
    queryKey: ["teacher", "students"],
    queryFn: getTeacherStudents,
  });

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    isError: assignmentsError,
  } = useQuery({
    queryKey: ["teacher", "assignments"],
    queryFn: getMyTeacherAssignments,
  });

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Teacher Dashboard</h1>
            <p>Welcome, {user?.name}</p>
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={logout}
          >
            Logout
          </button>
        </header>

        <section className={styles.content}>
          {/* Overview */}
          <div className={styles.overview}>
            <div className={styles.card}>
              <span className={styles.cardLabel}>
                My Students
              </span>

              <strong className={styles.cardValue}>
                {studentsLoading ? "..." : students.length}
              </strong>
            </div>

            <div className={styles.card}>
              <span className={styles.cardLabel}>
                My Assignments
              </span>

              <strong className={styles.cardValue}>
                {assignmentsLoading ? "..." : assignments.length}
              </strong>
            </div>
          </div>

          {/* Teacher Forms */}
          <CreateAssignmentForm />

          <br />
          <br />

          <UploadResultForm />

          <br />
          <br />

          <AttendanceForm />

          {/* Students */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>My Students</h2>

                <p>
                  Students belonging to your assigned
                  courses.
                </p>
              </div>
            </div>

            {studentsLoading && (
              <p className={styles.message}>
                Loading students...
              </p>
            )}

            {studentsError && (
              <p className={styles.error}>
                Failed to load students.
              </p>
            )}

            {!studentsLoading &&
              !studentsError &&
              students.length === 0 && (
                <p className={styles.message}>
                  No students are currently assigned to
                  you.
                </p>
              )}

            {!studentsLoading &&
              !studentsError &&
              students.length > 0 && (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Enrollment</th>
                        <th>Course</th>
                        <th>Semester</th>
                      </tr>
                    </thead>

                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>
                            {student.enrollmentNumber}
                          </td>
                          <td>{student.course}</td>
                          <td>{student.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </section>

          {/* Assignments */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>My Assignments</h2>

                <p>
                  Assignments you have created.
                </p>
              </div>
            </div>

            {assignmentsLoading && (
              <p className={styles.message}>
                Loading assignments...
              </p>
            )}

            {assignmentsError && (
              <p className={styles.error}>
                Failed to load assignments.
              </p>
            )}

            {!assignmentsLoading &&
              !assignmentsError &&
              assignments.length === 0 && (
                <p className={styles.message}>
                  You have not created any assignments
                  yet.
                </p>
              )}

            {!assignmentsLoading &&
              !assignmentsError &&
              assignments.length > 0 && (
                <div className={styles.assignmentGrid}>
                  {assignments.map((assignment) => (
                    <article
                      key={assignment._id}
                      className={styles.assignmentCard}
                    >
                      <h3>{assignment.title}</h3>

                      <p
                        className={
                          styles.assignmentDescription
                        }
                      >
                        {assignment.description}
                      </p>

                      <div
                        className={
                          styles.assignmentMeta
                        }
                      >
                        <span>
                          Subject:{" "}
                          {assignment.subject?.name ??
                            "Unknown"}
                        </span>

                        <span>
                          Max Marks:{" "}
                          {assignment.maxMarks}
                        </span>

                        <span>
                          Due:{" "}
                          {new Date(
                            assignment.dueDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {/* View Submissions */}
                      <button
                        type="button"
                        className={
                          styles.assignmentButton
                        }
                        onClick={() =>
                          router.push(
                            `/teacher/assignments/${assignment._id}/submissions`
                          )
                        }
                      >
                        View Submissions
                      </button>
                    </article>
                  ))}
                </div>
              )}
          </section>

          <NoticesList />
        </section>
      </main>
    </ProtectedRoute>
  );
}