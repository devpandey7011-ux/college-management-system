"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getAssignmentSubmissions } from "@/services/teacher.service";

import styles from "./page.module.css";

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const router = useRouter();

  const assignmentId =
    typeof params.id === "string" ? params.id : "";

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "teacher",
      "assignment-submissions",
      assignmentId,
    ],
    queryFn: () =>
      getAssignmentSubmissions(assignmentId),
    enabled: Boolean(assignmentId),
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <main className={styles.page}>
          <p className={styles.message}>
            Loading submissions...
          </p>
        </main>
      </ProtectedRoute>
    );
  }

  if (isError || !data) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <main className={styles.page}>
          <div className={styles.errorCard}>
            <h1>Unable to load submissions</h1>

            <p>
              You may not have permission to view this
              assignment, or the assignment could not be
              found.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.push("/teacher")}
            >
              Back to Teacher Dashboard
            </button>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.push("/teacher")}
            >
              ← Teacher Dashboard
            </button>

            <h1>{data.assignment.title}</h1>

            <p>
              Review and grade student submissions.
            </p>
          </div>
        </header>

        <section className={styles.assignmentCard}>
          <div>
            <span className={styles.label}>
              Due Date
            </span>

            <strong>
              {new Date(
                data.assignment.dueDate
              ).toLocaleString()}
            </strong>
          </div>

          <div>
            <span className={styles.label}>
              Maximum Marks
            </span>

            <strong>
              {data.assignment.maxMarks}
            </strong>
          </div>

          <div>
            <span className={styles.label}>
              Submissions
            </span>

            <strong>
              {data.submissions.length}
            </strong>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Student Submissions</h2>

              <p>
                Review each submission and assign marks.
              </p>
            </div>
          </div>

          {data.submissions.length === 0 ? (
            <div className={styles.emptyCard}>
              <h3>No submissions yet</h3>

              <p>
                Students have not submitted this
                assignment.
              </p>
            </div>
          ) : (
            <div className={styles.submissionList}>
              {data.submissions.map((submission) => (
                <article
                  key={submission._id}
                  className={styles.submissionCard}
                >
                  <div className={styles.studentHeader}>
                    <div>
                      <h3>
                        {submission.student.enrollmentNumber}
                      </h3>

                      <p>
                        Course:{" "}
                        {submission.student.course}
                        {" · "}
                        Semester{" "}
                        {submission.student.semester}
                      </p>
                    </div>

                    <span
                      className={
                        submission.status === "late"
                          ? styles.late
                          : styles.submitted
                      }
                    >
                      {submission.status === "late"
                        ? "Late"
                        : "Submitted"}
                    </span>
                  </div>

                  <div className={styles.meta}>
                    <span>
                      Submitted:{" "}
                      {new Date(
                        submission.submittedAt
                      ).toLocaleString()}
                    </span>

                    {submission.marksObtained !==
                      undefined && (
                      <span>
                        Marks:{" "}
                        {submission.marksObtained}/
                        {data.assignment.maxMarks}
                      </span>
                    )}
                  </div>

                  {submission.submissionText && (
                    <div className={styles.content}>
                      <h4>Submission</h4>

                      <p>
                        {submission.submissionText}
                      </p>
                    </div>
                  )}

                  {submission.fileUrl && (
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      View Submitted File
                    </a>
                  )}

                  {submission.feedback && (
                    <div className={styles.feedback}>
                      <h4>Feedback</h4>

                      <p>
                        {submission.feedback}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.gradeButton}
                    onClick={() =>
                      router.push(
                        `/teacher/assignments/${assignmentId}/submissions/${submission._id}/grade`
                      )
                    }
                  >
                    {submission.marksObtained !==
                    undefined
                      ? "Edit Grade"
                      : "Grade Submission"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}