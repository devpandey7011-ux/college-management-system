"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  AdminTeacher,
  deleteAdminTeacher,
  getAdminTeachers,
} from "@/services/admin-teacher.service";

import styles from "./page.module.css";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const {
    data: teachers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: getAdminTeachers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminTeacher,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "teachers"],
      });

      setDeleteError("");
    },

    onError: () => {
      setDeleteError(
        "Unable to delete the teacher. Please try again."
      );
    },
  });

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return teachers;
    }

    return teachers.filter((teacher: AdminTeacher) => {
      return (
        teacher.user.name
          .toLowerCase()
          .includes(query) ||
        teacher.user.email
          .toLowerCase()
          .includes(query) ||
        teacher.teacherId
          .toLowerCase()
          .includes(query) ||
        teacher.department
          .toLowerCase()
          .includes(query) ||
        teacher.designation
          .toLowerCase()
          .includes(query)
      );
    });
  }, [teachers, search]);

  const handleDelete = (teacher: AdminTeacher) => {
    const confirmed = window.confirm(
      `Delete "${teacher.user.name}"?\n\nThis will also remove the teacher's login account. This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    deleteMutation.mutate(teacher._id);
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
                onClick={() =>
                  router.push("/admin")
                }
              >
                ← Admin Dashboard
              </button>

              <span className={styles.eyebrow}>
                Administration
              </span>

              <h1>Teacher Management</h1>

              <p>
                Manage teacher accounts and faculty
                information.
              </p>
            </div>

            <button
              type="button"
              className={styles.createButton}
              onClick={() =>
                router.push(
                  "/admin/teachers/create"
                )
              }
            >
              + Add Teacher
            </button>
          </header>

          <section className={styles.toolbar}>
            <div className={styles.searchWrapper}>
              <label htmlFor="teacher-search">
                Search teachers
              </label>

              <input
                id="teacher-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Name, email, teacher ID, department..."
              />
            </div>

            <div className={styles.count}>
              {filteredTeachers.length}
              {" "}
              {filteredTeachers.length === 1
                ? "teacher"
                : "teachers"}
            </div>
          </section>

          {deleteError && (
            <div className={styles.error}>
              {deleteError}
            </div>
          )}

          {isLoading ? (
            <div className={styles.message}>
              Loading teachers...
            </div>
          ) : isError ? (
            <div className={styles.error}>
              Unable to load teachers.
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className={styles.empty}>
              <h2>
                {search
                  ? "No teachers found"
                  : "No teachers yet"}
              </h2>

              <p>
                {search
                  ? "Try changing your search."
                  : "Add your first teacher using the button above."}
              </p>
            </div>
          ) : (
            <section className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table>
                  <thead>
                    <tr>
                      <th>Teacher</th>
                      <th>Teacher ID</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Phone</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTeachers.map(
                      (teacher) => (
                        <tr key={teacher._id}>
                          <td>
                            <div
                              className={
                                styles.teacherInfo
                              }
                            >
                              <strong>
                                {teacher.user.name}
                              </strong>

                              <span>
                                {teacher.user.email}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                styles.teacherId
                              }
                            >
                              {teacher.teacherId}
                            </span>
                          </td>

                          <td>
                            {teacher.department}
                          </td>

                          <td>
                            {teacher.designation}
                          </td>

                          <td>
                            {teacher.phone || "—"}
                          </td>

                          <td>
                            {formatDate(
                              teacher.createdAt
                            )}
                          </td>

                          <td>
                            <div
                              className={
                                styles.actions
                              }
                            >
                              <button
                                type="button"
                                className={
                                  styles.editButton
                                }
                                onClick={() =>
                                  router.push(
                                    `/admin/teachers/${teacher._id}/edit`
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className={
                                  styles.deleteButton
                                }
                                onClick={() =>
                                  handleDelete(
                                    teacher
                                  )
                                }
                                disabled={
                                  deleteMutation.isPending &&
                                  deleteMutation.variables ===
                                    teacher._id
                                }
                              >
                                {deleteMutation.isPending &&
                                deleteMutation.variables ===
                                  teacher._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}