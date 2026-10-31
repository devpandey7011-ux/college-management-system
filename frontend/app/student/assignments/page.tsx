"use client";

import { useEffect, useState } from "react";
import {
  useQuery,
  useQueries,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getMyAssignments,
  getMySubmission,
  Assignment,
} from "@/services/assignment.service";

import styles from "./page.module.css";

export default function StudentAssignmentsPage() {
  const router = useRouter();

  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const {
    data: assignments = [],
    isLoading,
    isError,
  } = useQuery<Assignment[]>({
    queryKey: ["student", "assignments"],
    queryFn: getMyAssignments,
  });

  const submissionQueries = useQueries({
    queries: assignments.map((assignment) => ({
      queryKey: [
        "student",
        "assignment-submission",
        assignment._id,
      ],
      queryFn: () => getMySubmission(assignment._id),
      retry: false,
      enabled: assignments.length > 0,
    })),
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <main className={styles.page}>
          <div className={styles.loading}>
            Loading assignments...
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (isError) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <main className={styles.page}>
          <div className={styles.errorCard}>
            <h2>Unable to load assignments</h2>

            <p>
              We couldn&apos;t load your assignments right now.
              Please try again later.
            </p>

            <button
              type="button"
              onClick={() => router.refresh()}
            >
              Try Again
            </button>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <main className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>My Assignments</h1>

            <p>
              View your assignments, submission status,
              grades and teacher feedback.
            </p>
          </div>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push("/student")}
          >
            ← Dashboard
          </button>
        </div>

        {assignments.length === 0 ? (
          <section className={styles.emptyCard}>
            <div className={styles.emptyIcon}>✓</div>

            <h2>No Assignments</h2>

            <p>
              You currently have no assignments for your
              enrolled subjects.
            </p>
          </section>
        ) : (
          <div className={styles.assignmentList}>
            {assignments.map((assignment, index) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                submission={submissionQueries[index]?.data}
                currentTime={currentTime}
                onOpen={() =>
                  router.push(
                    `/student/assignments/${assignment._id}`
                  )
                }
              />
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

function AssignmentCard({
  assignment,
  submission,
  currentTime,
  onOpen,
}: {
  assignment: Assignment;
  submission?: Awaited<ReturnType<typeof getMySubmission>>;
  currentTime: number | null;
  onOpen: () => void;
}) {
  const dueDate = new Date(assignment.dueDate);

  const formattedDate = dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = dueDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  const isOverdue =
    currentTime !== null && dueDate.getTime() < currentTime;

  return (
    <article className={styles.card}>
      <div className={styles.cardMain}>
        <div className={styles.subjectRow}>
          <span className={styles.subjectCode}>
            {assignment.subject.code}
          </span>

          <span
            className={
              isOverdue
                ? styles.overdueBadge
                : styles.dueBadge
            }
          >
            {currentTime === null
              ? "Checking..."
              : isOverdue
                ? "Overdue"
                : "Active"}
          </span>
        </div>

        <h2>{assignment.title}</h2>

        <p className={styles.subjectName}>
          {assignment.subject.name}
        </p>

        <p className={styles.description}>
          {assignment.description}
        </p>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span>Due Date</span>
            <strong>{formattedDate}</strong>
          </div>

          <div className={styles.metaItem}>
            <span>Due Time</span>
            <strong>{formattedTime}</strong>
          </div>

          <div className={styles.metaItem}>
            <span>Maximum Marks</span>
            <strong>{assignment.maxMarks}</strong>
          </div>

          <div className={styles.metaItem}>
            <span>Teacher</span>
            <strong>{assignment.teacher.teacherId}</strong>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.statusArea}>
          <span className={styles.statusLabel}>
            Submission
          </span>

          {!submission ? (
            <span
              className={
                isOverdue
                  ? styles.statusLate
                  : styles.statusPending
              }
            >
              Not Submitted
            </span>
          ) : submission.marksObtained !== undefined ? (
            <span className={styles.statusSubmitted}>
              Graded · {submission.marksObtained}/
              {assignment.maxMarks}
            </span>
          ) : (
            <span className={styles.statusPending}>
              Submitted · Awaiting Grading
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.openButton}
          onClick={onOpen}
        >
          Open Assignment →
        </button>
      </div>
    </article>
  );
}
