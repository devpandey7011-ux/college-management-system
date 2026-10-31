"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  getMyAssignments,
  Assignment,
} from "@/services/assignment.service";

import styles from "./AssignmentsList.module.css";

export default function AssignmentsList() {
  const {
    data: assignments = [],
    isLoading,
    isError,
  } = useQuery<Assignment[]>({
    queryKey: ["student", "assignments"],
    queryFn: getMyAssignments,
  });

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2>Assignments</h2>
            <p>Loading your assignments...</p>
          </div>
        </div>

        <div className={styles.loading}>
          Loading assignments...
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2>Assignments</h2>
            <p>Your academic assignments</p>
          </div>
        </div>

        <div className={styles.error}>
          Failed to load assignments. Please try again.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2>Assignments</h2>
          <p>
            View your assignments, subjects, deadlines and marks.
          </p>
        </div>

        <div className={styles.count}>
          {assignments.length}{" "}
          {assignments.length === 1
            ? "Assignment"
            : "Assignments"}
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className={styles.empty}>
          <h3>No assignments yet</h3>
          <p>
            Your teachers haven&apos;t assigned any work yet.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AssignmentCard({
  assignment,
}: {
  assignment: Assignment;
}) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

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
      <div className={styles.cardTop}>
        <span className={styles.subject}>
          {assignment.subject.code}
        </span>

        <span
          className={
            isOverdue
              ? styles.overdue
              : styles.upcoming
          }
        >
          {currentTime === null
            ? "Checking..."
            : isOverdue
              ? "Overdue"
              : "Upcoming"}
        </span>
      </div>

      <h3 className={styles.title}>
        {assignment.title}
      </h3>

      <p className={styles.description}>
        {assignment.description}
      </p>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span>Subject</span>
          <strong>{assignment.subject.name}</strong>
        </div>

        <div className={styles.detail}>
          <span>Course</span>
          <strong>{assignment.course.code}</strong>
        </div>

        <div className={styles.detail}>
          <span>Due Date</span>
          <strong>{formattedDate}</strong>
        </div>

        <div className={styles.detail}>
          <span>Due Time</span>
          <strong>{formattedTime}</strong>
        </div>

        <div className={styles.detail}>
          <span>Maximum Marks</span>
          <strong>{assignment.maxMarks}</strong>
        </div>

        <div className={styles.detail}>
          <span>Teacher</span>
          <strong>{assignment.teacher.teacherId}</strong>
        </div>
      </div>

      <button
        type="button"
        className={styles.viewButton}
        onClick={() =>
          router.push(`/student/assignments/${assignment._id}`)
        }
      >
        View Assignment
      </button>
    </article>
  );
}
