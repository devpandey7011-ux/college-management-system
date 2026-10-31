"use client";

import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  deleteAdminSubject,
  getAdminSubjects,
  type AdminSubject,
} from "@/services/admin-subject.service";

import styles from "./page.module.css";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SubjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const {
    data: subjects = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "subjects"],
    queryFn: getAdminSubjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminSubject,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "subjects"],
      });
    },
  });

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return subjects;
    }

    return subjects.filter((subject: AdminSubject) => {
      return (
        subject.name.toLowerCase().includes(query) ||
        subject.code.toLowerCase().includes(query) ||
        subject.courseId.name.toLowerCase().includes(query) ||
        subject.courseId.code.toLowerCase().includes(query)
      );
    });
  }, [subjects, search]);

  const handleDelete = (subject: AdminSubject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}" (${subject.code})?`
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(subject._id);
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

            <h1>Subject Management</h1>

            <p>
              Manage subjects offered across college courses.
            </p>
          </div>

          <button
            type="button"
            className={styles.createButton}
            onClick={() =>
              router.push("/admin/subjects/create")
            }
          >
            + Add Subject
          </button>
        </header>

        <section className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search by subject, code or course..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className={styles.searchInput}
            />
          </div>

          <div className={styles.count}>
            {filteredSubjects.length}{" "}
            {filteredSubjects.length === 1
              ? "subject"
              : "subjects"}
          </div>
        </section>

        {isLoading && (
          <div className={styles.state}>
            Loading subjects...
          </div>
        )}

        {isError && (
          <div className={styles.error}>
            Failed to load subjects. Please try again.
          </div>
        )}

        {!isLoading &&
          !isError &&
          filteredSubjects.length === 0 && (
            <div className={styles.empty}>
              <h2>No subjects found</h2>

              <p>
                {search
                  ? "Try a different search."
                  : "Create your first subject to get started."}
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          filteredSubjects.length > 0 && (
            <section className={styles.card}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Code</th>
                      <th>Course</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubjects.map((subject) => (
                      <tr key={subject._id}>
                        <td>
                          <div className={styles.subjectName}>
                            {subject.name}
                          </div>
                        </td>

                        <td>
                          <span className={styles.code}>
                            {subject.code}
                          </span>
                        </td>

                        <td>
                          <div className={styles.courseName}>
                            {subject.courseId.name}
                          </div>

                          <span className={styles.courseCode}>
                            {subject.courseId.code}
                          </span>
                        </td>

                        <td>{subject.semester}</td>

                        <td>{subject.credits}</td>

                        <td>
                          {formatDate(subject.createdAt)}
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.editButton}
                              onClick={() =>
                                router.push(
                                  `/admin/subjects/${subject._id}/edit`
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className={styles.deleteButton}
                              onClick={() =>
                                handleDelete(subject)
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

export default function AdminSubjectsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <SubjectsPage />
    </ProtectedRoute>
  );
}