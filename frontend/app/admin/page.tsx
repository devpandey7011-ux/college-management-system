"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NoticeForm from "@/components/admin/NoticeForm";

import {
  AdminNotice,
  deleteNotice,
  getAdminNotices,
} from "@/services/admin-notice.service";

import styles from "./page.module.css";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAudienceLabel(
  audience: AdminNotice["audience"]
) {
  switch (audience) {
    case "students":
      return "Students";

    case "teachers":
      return "Teachers";

    default:
      return "Everyone";
  }
}

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editingNotice, setEditingNotice] =
    useState<AdminNotice | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const {
    data: notices = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "notices"],
    queryFn: getAdminNotices,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "notices"],
      });

      setDeleteError("");
    },

    onError: () => {
      setDeleteError(
        "Unable to delete the notice. Please try again."
      );
    },
  });

  const handleDelete = (notice: AdminNotice) => {
    const confirmed = window.confirm(
      `Delete "${notice.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    deleteMutation.mutate(notice._id);
  };

  const handleCreate = () => {
    setEditingNotice(null);
    setShowForm(true);
  };

  const handleEdit = (notice: AdminNotice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNotice(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNotice(null);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>
                Administration
              </span>

              <h1>Admin Dashboard</h1>

              <p>
                Manage college announcements and
                important notices.
              </p>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/admin/teachers")}
              >
                Manage Teachers
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/admin/students")}
              >
                Manage Students
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/admin/courses")}
              >
                Manage Courses
              </button>

              <button
                type="button"
                className={styles.createButton}
                onClick={handleCreate}
              >
                + Create Notice
              </button>
            </div>
          </header>

          {showForm && (
            <section className={styles.formSection}>
              <NoticeForm
                notice={editingNotice}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
              />
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Notice Management</h2>

                <p>
                  Create, edit, and remove college
                  announcements.
                </p>
              </div>

              <span className={styles.count}>
                {notices.length}{" "}
                {notices.length === 1
                  ? "notice"
                  : "notices"}
              </span>
            </div>

            {deleteError && (
              <div className={styles.error}>
                {deleteError}
              </div>
            )}

            {isLoading ? (
              <div className={styles.message}>
                Loading notices...
              </div>
            ) : isError ? (
              <div className={styles.error}>
                Unable to load notices.
              </div>
            ) : notices.length === 0 ? (
              <div className={styles.empty}>
                <h3>No notices yet</h3>

                <p>
                  Create your first announcement using
                  the button above.
                </p>
              </div>
            ) : (
              <div className={styles.list}>
                {notices.map((notice) => (
                  <article
                    key={notice._id}
                    className={styles.card}
                  >
                    <div className={styles.cardHeader}>
                      <div>
                        <h3>{notice.title}</h3>

                        <p className={styles.date}>
                          Created{" "}
                          {formatDate(notice.createdAt)}
                        </p>
                      </div>

                      <span className={styles.audience}>
                        {getAudienceLabel(notice.audience)}
                      </span>
                    </div>

                    <p className={styles.content}>
                      {notice.content}
                    </p>

                    <div className={styles.meta}>
                      <span>
                        Posted by{" "}
                        <strong>
                          {notice.createdBy.name}
                        </strong>
                      </span>

                      {notice.course && (
                        <span>
                          Course:{" "}
                          <strong>
                            {notice.course.code}
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => handleEdit(notice)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(notice)}
                        disabled={
                          deleteMutation.isPending &&
                          deleteMutation.variables === notice._id
                        }
                      >
                        {deleteMutation.isPending &&
                        deleteMutation.variables === notice._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
