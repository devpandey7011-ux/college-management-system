"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAssignment,
  CreateAssignmentData,
  getTeacherSubjectAssignments,
} from "@/services/teacher.service";

import styles from "./CreateAssignmentForm.module.css";

export default function CreateAssignmentForm() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    data: teacherAssignments = [],
    isLoading: assignmentsLoading,
    isError: assignmentsError,
  } = useQuery({
    queryKey: ["teacher", "subject-assignments"],
    queryFn: getTeacherSubjectAssignments,
  });

  const courses = useMemo(() => {
    const uniqueCourses = new Map<
      string,
      {
        _id: string;
        name: string;
        code: string;
      }
    >();

    teacherAssignments.forEach((assignment) => {
      uniqueCourses.set(
        assignment.course._id,
        assignment.course
      );
    });

    return Array.from(uniqueCourses.values());
  }, [teacherAssignments]);

  const semesters = useMemo(() => {
    if (!course) {
      return [];
    }

    return Array.from(
      new Set(
        teacherAssignments
          .filter(
            (assignment) =>
              assignment.course._id === course
          )
          .map(
            (assignment) =>
              assignment.subject.semester
          )
      )
    ).sort((a, b) => a - b);
  }, [teacherAssignments, course]);

  const subjects = useMemo(() => {
    if (!course || !semester) {
      return [];
    }

    return teacherAssignments
      .filter(
        (assignment) =>
          assignment.course._id === course &&
          assignment.subject.semester ===
            Number(semester)
      )
      .map((assignment) => assignment.subject);
  }, [teacherAssignments, course, semester]);

  const mutation = useMutation({
    mutationFn: (data: CreateAssignmentData) =>
      createAssignment(data),

    onSuccess: async (data) => {
      setMessage(data.message);
      setError("");

      setTitle("");
      setDescription("");
      setCourse("");
      setSemester("");
      setSubject("");
      setDueDate("");
      setMaxMarks("");

        await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["teacher", "assignments"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["student", "assignments"],
      }),
    ]);
    },

    onError: () => {
      setError(
        "Failed to create assignment. Please check your selected subject and course."
      );
      setMessage("");
    },
  });

  const handleCourseChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCourse(event.target.value);

    setSemester("");
    setSubject("");
    setError("");
    setMessage("");
  };

  const handleSemesterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSemester(event.target.value);

    setSubject("");
    setError("");
    setMessage("");
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!course || !semester || !subject) {
      setError(
        "Please select a course, semester and subject."
      );
      return;
    }

    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    if (Number(maxMarks) <= 0) {
      setError(
        "Maximum marks must be greater than 0."
      );
      return;
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      setError("Please enter a valid due date.");
      return;
    }

    if (parsedDueDate <= new Date()) {
      setError(
        "Due date must be in the future."
      );
      return;
    }

    mutation.mutate({
      title,
      description,
      subject,
      course,
      dueDate: parsedDueDate.toISOString(),
      maxMarks: Number(maxMarks),
    });
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Create Assignment</h2>

          <p>
            Create a new assignment for one of your
            assigned subjects.
          </p>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div className={styles.field}>
          <label htmlFor="assignment-title">
            Assignment Title
          </label>

          <input
            id="assignment-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Enter assignment title"
            maxLength={200}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="assignment-description">
            Description
          </label>

          <textarea
            id="assignment-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe the assignment"
            maxLength={5000}
            rows={5}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="assignment-course">
              Course
            </label>

            <select
              id="assignment-course"
              value={course}
              onChange={handleCourseChange}
              required
              disabled={
                assignmentsLoading ||
                assignmentsError
              }
            >
              <option value="">
                {assignmentsLoading
                  ? "Loading courses..."
                  : assignmentsError
                    ? "Unable to load courses"
                    : "Select course"}
              </option>

              {courses.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="assignment-semester">
              Semester
            </label>

            <select
              id="assignment-semester"
              value={semester}
              onChange={handleSemesterChange}
              required
              disabled={
                !course ||
                semesters.length === 0
              }
            >
              <option value="">
                {!course
                  ? "Select course first"
                  : "Select semester"}
              </option>

              {semesters.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  Semester {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="assignment-subject">
            Subject
          </label>

          <select
            id="assignment-subject"
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value)
            }
            required
            disabled={
              !semester ||
              subjects.length === 0
            }
          >
            <option value="">
              {!course
                ? "Select course first"
                : !semester
                  ? "Select semester first"
                  : subjects.length === 0
                    ? "No assigned subjects"
                    : "Select subject"}
            </option>

            {subjects.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.name} ({item.code})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="assignment-due-date">
              Due Date
            </label>

            <input
              id="assignment-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="assignment-max-marks">
              Maximum Marks
            </label>

            <input
              id="assignment-max-marks"
              type="number"
              min="1"
              max="1000"
              value={maxMarks}
              onChange={(event) =>
                setMaxMarks(event.target.value)
              }
              placeholder="e.g. 20"
              required
            />
          </div>
        </div>

        {message && (
          <p className={styles.success}>
            {message}
          </p>
        )}

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? "Creating..."
            : "Create Assignment"}
        </button>
      </form>
    </section>
  );
}