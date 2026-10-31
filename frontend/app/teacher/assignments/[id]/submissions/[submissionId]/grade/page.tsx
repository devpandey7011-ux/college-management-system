"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getAssignmentSubmissions,
  gradeAssignmentSubmission,
} from "@/services/teacher.service";

import styles from "./page.module.css";

export default function GradeSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const assignmentId =
    typeof params.id === "string" ? params.id : "";

  const submissionId =
    typeof params.submissionId === "string"
      ? params.submissionId
      : "";

  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "teacher",
      "assignment-submissions",
      assignmentId,
    ],
    queryFn: () => getAssignmentSubmissions(assignmentId),
    enabled: Boolean(assignmentId),
  });

  const submission = data?.submissions.find(
    (item) => item._id === submissionId
  );

  const gradeMutation = useMutation({
    mutationFn: () =>
      gradeAssignmentSubmission(submissionId, {
        marksObtained: Number(marks),
        feedback: feedback.trim() || undefined,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "teacher",
          "assignment-submissions",
          assignmentId,
        ],
      });

      router.push(
        `/teacher/assignments/${assignmentId}/submissions`
      );
    },

    onError: () => {
      setError(
        "Unable to save the grade. Please check the marks and try again."
      );
    },
  });

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const numericMarks = Number(marks);

    if (marks.trim() === "") {
      setError("Please enter the marks obtained.");
      return;
    }

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0 ||
      numericMarks > (data?.assignment.maxMarks ?? 0)
    ) {
      setError(
        `Marks must be between 0 and ${
          data?.assignment.maxMarks ?? 0
        }.`
      );
      return;
    }

    gradeMutation.mutate();
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <main className={styles.page}>
          <p className={styles.message}>
            Loading submission...
          </p>
        </main>
      </ProtectedRoute>
    );
  }

  if (isError || !data || !submission) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <main className={styles.page}>
          <div className={styles.errorCard}>
            <h1>Submission not found</h1>

            <p>
              The submission could not be loaded.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={() =>
                router.push(
                  `/teacher/assignments/${assignmentId}/submissions`
                )
              }
            >
              Back to Submissions
            </button>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <main className={styles.page}>
        <div className={styles.container}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              router.push(
                `/teacher/assignments/${assignmentId}/submissions`
              )
            }
          >
            ← Back to Submissions
          </button>

          <header className={styles.header}>
            <h1>Grade Submission</h1>

            <p>
              Review the student&apos;s work and assign marks.
            </p>
          </header>

          <section className={styles.assignmentCard}>
            <div>
              <span>Assignment</span>

              <strong>{data.assignment.title}</strong>
            </div>

            <div>
              <span>Maximum Marks</span>

              <strong>{data.assignment.maxMarks}</strong>
            </div>
          </section>

          <section className={styles.studentCard}>
            <div className={styles.studentHeader}>
              <div>
                <span className={styles.label}>
                  Student
                </span>

                <h2>
                  {submission.student.enrollmentNumber}
                </h2>

                <p>
                  {submission.student.course}
                  {" · "}
                  Semester {submission.student.semester}
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

            {submission.submissionText && (
              <div className={styles.submission}>
                <h3>Student Submission</h3>

                <p>{submission.submissionText}</p>
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
          </section>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <div className={styles.formHeader}>
              <h2>Grade</h2>

              <p>
                Enter the marks and optional feedback.
              </p>
            </div>

            <label htmlFor="marks">
              Marks Obtained
            </label>

            <div className={styles.marksWrapper}>
              <input
                id="marks"
                type="number"
                min="0"
                max={data.assignment.maxMarks}
                step="0.5"
                value={marks}
                onChange={(event) =>
                  setMarks(event.target.value)
                }
                placeholder="Enter marks"
              />

              <span>
                / {data.assignment.maxMarks}
              </span>
            </div>

            <label htmlFor="feedback">
              Feedback
            </label>

            <textarea
              id="feedback"
              rows={5}
              value={feedback}
              onChange={(event) =>
                setFeedback(event.target.value)
              }
              placeholder="Write feedback for the student..."
            />

            {error && (
              <p className={styles.error}>{error}</p>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={gradeMutation.isPending}
            >
              {gradeMutation.isPending
                ? "Saving..."
                : "Save Grade"}
            </button>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
