"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  deleteAdminCourse,
  getAdminCourses,
  type AdminCourse,
} from "@/services/admin-course.service";

import styles from "./page.module.css";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: getAdminCourses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCourse,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "courses"],
      });
    },
  });

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course: AdminCourse) => {
      return (
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.department.toLowerCase().includes(query)
      );
    });
  }, [courses, search]);

  const handleDelete = (course: AdminCourse) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.name}" (${course.code})?`
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(course._id);
  };

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

            <h1>Course Management</h1>

            <p>
              Manage courses offered by the college.
            </p>
          </div>

          <button
            type="button"
            className={styles.createButton}
            onClick={() =>
              router.push("/admin/courses/create")
            }
          >
            + Add Course
          </button>
        </header>

        <section className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search by name, code or department..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className={styles.searchInput}
            />
          </div>

          <div className={styles.count}>
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1
              ? "course"
              : "courses"}
          </div>
        </section>

        {isLoading && (
          <div className={styles.state}>
            Loading courses...
          </div>
        )}

        {isError && (
          <div className={styles.error}>
            Failed to load courses. Please try again.
          </div>
        )}

        {!isLoading &&
          !isError &&
          filteredCourses.length === 0 && (
            <div className={styles.empty}>
              <h2>No courses found</h2>

              <p>
                {search
                  ? "Try a different search."
                  : "Create your first course to get started."}
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          filteredCourses.length > 0 && (
            <section className={styles.card}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Code</th>
                      <th>Department</th>
                      <th>Semesters</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course._id}>
                        <td>
                          <div className={styles.courseName}>
                            {course.name}
                          </div>
                        </td>

                        <td>
                          <span className={styles.code}>
                            {course.code}
                          </span>
                        </td>

                        <td>{course.department}</td>

                        <td>
                          {course.totalSemesters}
                        </td>

                        <td>
                          {formatDate(course.createdAt)}
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.editButton}
                              onClick={() =>
                                router.push(
                                  `/admin/courses/${course._id}/edit`
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className={styles.deleteButton}
                              onClick={() =>
                                handleDelete(course)
                              }
                              disabled={
                                deleteMutation.isPending
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
      </div>
    </main>
  );
}

export default function AdminCoursesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <CoursesPage />
    </ProtectedRoute>
  );
}