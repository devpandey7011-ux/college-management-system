
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  AdminStudent,
  deleteAdminStudent,
  getAdminStudents,
} from "@/services/admin-student.service";

import styles from "./page.module.css";

function formatDate(date?: string) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const {
    data: students = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: getAdminStudents,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminStudent,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "students"],
      });

      setDeleteError("");
    },

    onError: () => {
      setDeleteError(
        "Unable to delete the student. Please try again."
      );
    },
  });

  const filteredStudents = students.filter((student) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      student.userId.name
        .toLowerCase()
        .includes(searchValue) ||
      student.userId.email
        .toLowerCase()
        .includes(searchValue) ||
      student.enrollmentNumber
        .toLowerCase()
        .includes(searchValue) ||
      student.course
        .toLowerCase()
        .includes(searchValue)
    );
  });

  const handleDelete = (student: AdminStudent) => {
    const confirmed = window.confirm(
      `Delete ${student.userId.name}?\n\nThis will permanently delete the student profile and associated login account.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    deleteMutation.mutate(student._id);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => router.push("/admin")}
              >
                ← Admin Dashboard
              </button>

              <span className={styles.eyebrow}>
                Administration
              </span>

              <h1>Student Management</h1>

              <p>
                View and manage registered students.
              </p>
            </div>

            <button
              type="button"
              className={styles.createButton}
              onClick={() =>
                router.push("/admin/students/create")
              }
            >
              + Add Student
            </button>
          </header>

          <section className={styles.toolbar}>
            <div className={styles.searchWrapper}>
              <label htmlFor="student-search">
                Search students
              </label>

              <input
                id="student-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email, enrollment or course..."
              />
            </div>

            <div className={styles.count}>
              <strong>{filteredStudents.length}</strong>
              <span>
                {filteredStudents.length === 1
                  ? "student"
                  : "students"}
              </span>
            </div>
          </section>

          {deleteError && (
            <div className={styles.error}>
              {deleteError}
            </div>
          )}

          <section className={styles.section}>
            {isLoading ? (
              <div className={styles.message}>
                Loading students...
              </div>
            ) : isError ? (
              <div className={styles.error}>
                Unable to load students.
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className={styles.empty}>
                <h2>
                  {students.length === 0
                    ? "No students yet"
                    : "No students found"}
                </h2>

                <p>
                  {students.length === 0
                    ? "Add your first student to get started."
                    : "Try changing your search."}
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Enrollment</th>
                      <th>Course</th>
                      <th>Semester</th>
                      <th>Phone</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student._id}>
                        <td>
                          <div className={styles.studentInfo}>
                            <strong>
                              {student.userId.name}
                            </strong>

                            <span>
                              {student.userId.email}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className={styles.enrollment}>
                            {student.enrollmentNumber}
                          </span>
                        </td>

                        <td>
                          <span className={styles.course}>
                            {student.course}
                          </span>
                        </td>

                        <td>
                          Semester {student.semester}
                        </td>

                        <td>
                          {student.phone || "—"}
                        </td>

                        <td>
                          {formatDate(student.createdAt)}
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.editButton}
                              onClick={() =>
                                router.push(
                                  `/admin/students/${student._id}/edit`
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className={styles.deleteButton}
                              onClick={() =>
                                handleDelete(student)
                              }
                              disabled={
                                deleteMutation.isPending &&
                                deleteMutation.variables ===
                                  student._id
                              }
                            >
                              {deleteMutation.isPending &&
                              deleteMutation.variables ===
                                student._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
