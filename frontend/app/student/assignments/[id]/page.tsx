"use client";

import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getMyAssignments,
  getMySubmission,
  submitAssignment,
  Assignment,
} from "@/services/assignment.service";

import styles from "./page.module.css";

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const assignmentId = params.id as string;

  const [submissionText, setSubmissionText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    isError: assignmentsError,
  } = useQuery<Assignment[]>({
    queryKey: ["student", "assignments"],
    queryFn: getMyAssignments,
  });

  const assignment = assignments.find(
    (item) => item._id === assignmentId
  );

  const {
    data: submission,
    isLoading: submissionLoading,
  } = useQuery({
    queryKey: ["student", "assignment-submission", assignmentId],
    queryFn: () => getMySubmission(assignmentId),
    retry: false,
    enabled: !!assignmentId,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submitAssignment(assignmentId, {
        submissionText: submissionText.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
      }),
    onSuccess: async () => {
      setSubmissionText("");
      setFileUrl("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "student",
            "assignment-submission",
            assignmentId,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ["student", "assignments"],
        }),
      ]);
    },
  });

  const isLoading = assignmentsLoading || submissionLoading;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <main className={styles.page}>
          <div className={styles.loading}>
            Loading assignment...
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (assignmentsError || !assignment) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <main className={styles.page}>
          <div className={styles.errorCard}>
            <h2>Assignment not found</h2>

            <p>We couldn&apos;t find this assignment.</p>

            <button
              type="button"
              onClick={() => router.push("/student")}
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  const dueDate = new Date(assignment.dueDate);

  const formattedDate = dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = dueDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  const hasSubmission = !!submission;

  const isOverdue =
    currentTime !== null && dueDate.getTime() < currentTime;

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!submissionText.trim() && !fileUrl.trim()) {
      return;
    }

    submitMutation.mutate();
  };

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <main className={styles.page}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
        >
          ← Back
        </button>

        <section className={styles.card}>
          <div className={styles.top}>
            <div>
              <span className={styles.subject}>
                {assignment.subject.code}
              </span>

              <h1>{assignment.title}</h1>

              <p className={styles.subjectName}>
                {assignment.subject.name}
              </p>
            </div>

            <div className={styles.marks}>
              <span>Maximum Marks</span>
              <strong>{assignment.maxMarks}</strong>
            </div>
          </div>

          <div className={styles.divider} />

          <section className={styles.descriptionSection}>
            <h2>Assignment Description</h2>
            <p>{assignment.description}</p>
          </section>

          <div className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <span>Course</span>
              <strong>{assignment.course.name}</strong>
            </div>

            <div className={styles.infoBox}>
              <span>Course Code</span>
              <strong>{assignment.course.code}</strong>
            </div>

            <div className={styles.infoBox}>
              <span>Teacher</span>
              <strong>{assignment.teacher.teacherId}</strong>
            </div>

            <div className={styles.infoBox}>
              <span>Due Date</span>
              <strong>{formattedDate}</strong>
            </div>

            <div className={styles.infoBox}>
              <span>Due Time</span>
              <strong>{formattedTime}</strong>
            </div>

            <div className={styles.infoBox}>
              <span>Status</span>

              <strong
                className={
                  hasSubmission
                    ? styles.statusSubmitted
                    : isOverdue
                      ? styles.statusLate
                      : styles.statusPending
                }
              >
                {hasSubmission
                  ? submission.status === "late"
                    ? "Submitted Late"
                    : "Submitted"
                  : currentTime === null
                    ? "Checking..."
                    : isOverdue
                      ? "Overdue"
                      : "Not Submitted"}
              </strong>
            </div>
          </div>

          <section className={styles.actionSection}>
            <h2>Submission</h2>

            {hasSubmission ? (
              <div className={styles.submissionCard}>
                <div className={styles.submissionHeader}>
                  <strong>Assignment Submitted</strong>

                  <span
                    className={
                      submission.status === "late"
                        ? styles.statusLate
                        : styles.statusSubmitted
                    }
                  >
                    {submission.status === "late" ? "Late" : "On Time"}
                  </span>
                </div>

                <div className={styles.submissionInfo}>
                  <div>
                    <span>Submitted At</span>

                    <strong>
                      {new Date(submission.submittedAt).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Grading Status</span>

                    <strong
                      className={
                        submission.marksObtained !== undefined
                          ? styles.statusSubmitted
                          : styles.statusPending
                      }
                    >
                      {submission.marksObtained !== undefined
                        ? "Graded"
                        : "Awaiting Grading"}
                    </strong>
                  </div>

                  <div>
                    <span>Marks</span>

                    <strong>
                      {submission.marksObtained !== undefined
                        ? `${submission.marksObtained} / ${assignment.maxMarks}`
                        : "—"}
                    </strong>
                  </div>
                </div>

                {submission.submissionText && (
                  <div className={styles.submissionContent}>
                    <span>Your Submission</span>
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

                {submission.feedback && (
                  <div className={styles.feedback}>
                    <span>Teacher Feedback</span>
                    <p>{submission.feedback}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <label>
                  Submission Text
                  <textarea
                    value={submissionText}
                    onChange={(event) =>
                      setSubmissionText(event.target.value)
                    }
                    placeholder="Write your answer or submission here..."
                    rows={7}
                  />
                </label>

                <label>
                  File URL
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(event) => setFileUrl(event.target.value)}
                    placeholder="https://example.com/your-file.pdf"
                  />
                </label>

                <p className={styles.formHint}>
                  Provide either submission text or a file URL.
                </p>

                {submitMutation.isError && (
                  <p className={styles.formError}>
                    Failed to submit assignment. Please try again.
                  </p>
                )}

                {submitMutation.isSuccess && (
                  <p className={styles.formSuccess}>
                    Assignment submitted successfully.
                  </p>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={
                    submitMutation.isPending ||
                    (!submissionText.trim() && !fileUrl.trim())
                  }
                >
                  {submitMutation.isPending
                    ? "Submitting..."
                    : "Submit Assignment"}
                </button>
              </form>
            )}
          </section>
        </section>
      </main>
    </ProtectedRoute>
  );
}
