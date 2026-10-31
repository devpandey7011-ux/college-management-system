
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  getAdminTeachers,
  type AdminTeacher,
} from "@/services/admin-teacher.service";

import {
  getAdminSubjects,
  type AdminSubject,
} from "@/services/admin-subject.service";

import {
  getAdminCourses,
  type AdminCourse,
} from "@/services/admin-course.service";

import {
  createSubjectAssignment,
  deleteSubjectAssignment,
  getSubjectAssignments,
  type SubjectAssignment,
} from "@/services/admin-subject-assignment.service";

import styles from "./page.module.css";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

function SubjectAssignmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [courseId, setCourseId] = useState("");
  const [semester, setSemester] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const {
    data: teachers = [],
    isLoading: teachersLoading,
  } = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: getAdminTeachers,
  });

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
  } = useQuery({
    queryKey: ["admin", "subjects"],
    queryFn: getAdminSubjects,
  });

  const {
    data: courses = [],
    isLoading: coursesLoading,
  } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: getAdminCourses,
  });

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    isError: assignmentsError,
  } = useQuery({
    queryKey: ["admin", "subject-assignments"],
    queryFn: getSubjectAssignments,
  });

  const selectedCourse = courses.find(
    (course: AdminCourse) => course._id === courseId
  );

  const semesterOptions = selectedCourse
    ? Array.from(
        { length: selectedCourse.totalSemesters },
        (_, index) => index + 1
      )
    : [];

  const filteredSubjects = useMemo(() => {
    if (!courseId || !semester) {
      return [];
    }

    return subjects.filter(
      (subject: AdminSubject) =>
        subject.courseId._id === courseId &&
        subject.semester === Number(semester)
    );
  }, [subjects, courseId, semester]);

  const createMutation = useMutation({
    mutationFn: createSubjectAssignment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "subject-assignments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["teacher", "subject-assignments"],
        }),
      ]);

      setCourseId("");
      setSemester("");
      setSubjectId("");
      setTeacherId("");
      setError("");
    },

    onError: (mutationError: unknown) => {
      setError(
        getErrorMessage(
          mutationError,
          "Failed to assign subject."
        )
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubjectAssignment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "subject-assignments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["teacher", "subject-assignments"],
        }),
      ]);

      setError("");
    },

    onError: (mutationError: unknown) => {
      setError(
        getErrorMessage(
          mutationError,
          "Failed to remove assignment."
        )
      );
    },
  });

  const handleCourseChange = (value: string) => {
    setCourseId(value);
    setSemester("");
    setSubjectId("");
    setError("");
  };

  const handleSemesterChange = (value: string) => {
    setSemester(value);
    setSubjectId("");
    setError("");
  };

  const handleSubjectChange = (value: string) => {
    setSubjectId(value);
    setError("");
  };

  const handleTeacherChange = (value: string) => {
    setTeacherId(value);
    setError("");
  };

  const handleAssign = () => {
    setError("");

    if (!courseId) {
      setError("Please select a course.");
      return;
    }

    if (!semester) {
      setError("Please select a semester.");
      return;
    }

    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (!teacherId) {
      setError("Please select a teacher.");
      return;
    }

    const selectedSubjectData = subjects.find(
      (subject: AdminSubject) => subject._id === subjectId
    );

    if (!selectedSubjectData) {
      setError("Selected subject not found.");
      return;
    }

    if (selectedSubjectData.courseId._id !== courseId) {
      setError(
        "Selected subject does not belong to the selected course."
      );
      return;
    }

    if (selectedSubjectData.semester !== Number(semester)) {
      setError(
        "Selected subject does not belong to the selected semester."
      );
      return;
    }

    const alreadyAssigned = assignments.some(
      (assignment: SubjectAssignment) =>
        assignment.teacher._id === teacherId &&
        assignment.subject._id === subjectId
    );

    if (alreadyAssigned) {
      setError(
        "This teacher is already assigned to this subject."
      );
      return;
    }

    createMutation.mutate({
      teacher: teacherId,
      subject: subjectId,
      course: courseId,
    });
  };

  const handleDelete = (assignment: SubjectAssignment) => {
    const confirmed = window.confirm(
      `Remove ${assignment.subject.name} from ${assignment.teacher.teacherId}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    deleteMutation.mutate(assignment._id);
  };

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return assignments;
    }

    return assignments.filter(
      (assignment: SubjectAssignment) =>
        assignment.teacher.teacherId
          .toLowerCase()
          .includes(query) ||
        assignment.teacher.department
          .toLowerCase()
          .includes(query) ||
        assignment.teacher.designation
          .toLowerCase()
          .includes(query) ||
        assignment.subject.name
          .toLowerCase()
          .includes(query) ||
        assignment.subject.code
          .toLowerCase()
          .includes(query) ||
        assignment.course.name
          .toLowerCase()
          .includes(query) ||
        assignment.course.code
          .toLowerCase()
          .includes(query)
    );
  }, [assignments, search]);

  const loading =
    teachersLoading ||
    subjectsLoading ||
    coursesLoading ||
    assignmentsLoading;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.push("/admin")}
            >
              ← Back to Admin
            </button>

            <h1>Subject Assignments</h1>

            <p>
              Assign college subjects to teachers and manage
              existing assignments.
            </p>
          </div>
        </header>

        <section className={styles.assignmentCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Assign Subject</h2>

              <p>
                Select a course, semester, subject and teacher
                to create an assignment.
              </p>
            </div>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="course">Course</label>

              <select
                id="course"
                value={courseId}
                onChange={(event) =>
                  handleCourseChange(event.target.value)
                }
                disabled={
                  loading || createMutation.isPending
                }
              >
                <option value="">Select course</option>

                {courses.map((course: AdminCourse) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="semester">Semester</label>

              <select
                id="semester"
                value={semester}
                onChange={(event) =>
                  handleSemesterChange(event.target.value)
                }
                disabled={
                  !courseId ||
                  loading ||
                  createMutation.isPending
                }
              >
                <option value="">
                  {courseId
                    ? "Select semester"
                    : "Select course first"}
                </option>

                {semesterOptions.map((semesterNumber) => (
                  <option
                    key={semesterNumber}
                    value={semesterNumber}
                  >
                    Semester {semesterNumber}
                  </option>
                ))}
              </select>

              {selectedCourse && (
                <span className={styles.hint}>
                  {selectedCourse.totalSemesters} semesters
                  available in this course.
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="subject">Subject</label>

              <select
                id="subject"
                value={subjectId}
                onChange={(event) =>
                  handleSubjectChange(event.target.value)
                }
                disabled={
                  !courseId ||
                  !semester ||
                  loading ||
                  createMutation.isPending
                }
              >
                <option value="">
                  {!courseId
                    ? "Select course first"
                    : !semester
                      ? "Select semester first"
                      : filteredSubjects.length === 0
                        ? "No subjects available"
                        : "Select subject"}
                </option>

                {filteredSubjects.map((subject: AdminSubject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>

              {courseId && semester && (
                <span className={styles.hint}>
                  {filteredSubjects.length} subject
                  {filteredSubjects.length === 1 ? "" : "s"} in
                  Semester {semester}.
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="teacher">Teacher</label>

              <select
                id="teacher"
                value={teacherId}
                onChange={(event) =>
                  handleTeacherChange(event.target.value)
                }
                disabled={
                  loading || createMutation.isPending
                }
              >
                <option value="">Select teacher</option>

                {teachers.map((teacher: AdminTeacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.teacherId}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.assignAction}>
              <button
                type="button"
                className={styles.assignButton}
                onClick={handleAssign}
                disabled={
                  loading ||
                  createMutation.isPending ||
                  !courseId ||
                  !semester ||
                  !subjectId ||
                  !teacherId
                }
              >
                {createMutation.isPending
                  ? "Assigning..."
                  : "Assign Subject"}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.listSection}>
          <div className={styles.listHeader}>
            <div>
              <h2>Current Assignments</h2>

              <p>
                {filteredAssignments.length}{" "}
                {filteredAssignments.length === 1
                  ? "assignment"
                  : "assignments"}
              </p>
            </div>

            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search assignments..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search assignments"
            />
          </div>

          {assignmentsError && (
            <div className={styles.error} role="alert">
              Failed to load subject assignments.
            </div>
          )}

          {loading && (
            <div className={styles.state}>
              Loading assignments...
            </div>
          )}

          {!loading &&
            !assignmentsError &&
            filteredAssignments.length === 0 && (
              <div className={styles.empty}>
                <h3>No assignments found</h3>

                <p>
                  {search
                    ? "Try a different search."
                    : "No teachers have been assigned subjects yet."}
                </p>
              </div>
            )}

          {!loading &&
            !assignmentsError &&
            filteredAssignments.length > 0 && (
              <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Teacher</th>
                        <th>Subject</th>
                        <th>Course</th>
                        <th>Semester</th>
                        <th>Credits</th>
                        <th>Assigned</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAssignments.map(
                        (assignment: SubjectAssignment) => (
                          <tr key={assignment._id}>
                            <td>
                              <div className={styles.primaryText}>
                                {assignment.teacher.teacherId}
                              </div>

                              <div className={styles.secondaryText}>
                                {assignment.teacher.department}
                              </div>
                            </td>

                            <td>
                              <div className={styles.primaryText}>
                                {assignment.subject.name}
                              </div>

                              <span className={styles.badge}>
                                {assignment.subject.code}
                              </span>
                            </td>

                            <td>
                              <div className={styles.primaryText}>
                                {assignment.course.name}
                              </div>

                              <div className={styles.secondaryText}>
                                {assignment.course.code}
                              </div>
                            </td>

                            <td>{assignment.subject.semester}</td>
                            <td>{assignment.subject.credits}</td>

                            <td>
                              {formatDate(assignment.createdAt)}
                            </td>

                            <td>
                              <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={() =>
                                  handleDelete(assignment)
                                }
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending
                                  ? "Removing..."
                                  : "Remove"}
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}

export default function AdminSubjectAssignmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <SubjectAssignmentsPage />
    </ProtectedRoute>
  );
}
