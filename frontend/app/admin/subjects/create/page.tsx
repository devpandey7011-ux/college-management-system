"use client";

import { FormEvent, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  createAdminSubject,
  type CreateSubjectData,
} from "@/services/admin-subject.service";
import { getAdminCourses } from "@/services/admin-course.service";

import styles from "./page.module.css";

function CreateSubjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateSubjectData>({
    name: "",
    code: "",
    courseId: "",
    semester: 1,
    credits: 4,
  });

  const [error, setError] = useState("");

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: getAdminCourses,
  });

  const createMutation = useMutation({
    mutationFn: createAdminSubject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "subjects"],
      });

      router.push("/admin/subjects");
    },

    onError: (mutationError: unknown) => {
      const responseMessage = axios.isAxiosError<{
        message?: string;
      }>(mutationError)
        ? mutationError.response?.data?.message
        : undefined;

      setError(
        typeof responseMessage === "string"
          ? responseMessage
          : "Failed to create subject. Please try again."
      );
    },
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "semester" || name === "credits"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Subject code is required.");
      return;
    }

    if (!form.courseId) {
      setError("Please select a course.");
      return;
    }

    if (!Number.isInteger(form.semester) || form.semester < 1) {
      setError("Semester must be a positive whole number.");
      return;
    }

    if (!Number.isInteger(form.credits) || form.credits < 1) {
      setError("Credits must be a positive whole number.");
      return;
    }

    createMutation.mutate({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push("/admin/subjects")}
        >
          ← Back to Subjects
        </button>

        <section className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1>Create Subject</h1>
              <p>
                Add a new subject to an existing college course.
              </p>
            </div>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          {coursesError && (
            <div className={styles.error} role="alert">
              Failed to load courses. Please refresh the page.
            </div>
          )}

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <div className={styles.field}>
              <label htmlFor="name">Subject Name</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Database Management Systems"
                value={form.name}
                onChange={handleChange}
                disabled={createMutation.isPending}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="code">Subject Code</label>

              <input
                id="code"
                name="code"
                type="text"
                placeholder="e.g. DBMS101"
                value={form.code}
                onChange={handleChange}
                disabled={createMutation.isPending}
              />

              <span className={styles.hint}>
                The subject code must be unique.
              </span>
            </div>

            <div className={styles.field}>
              <label htmlFor="courseId">Course</label>

              <select
                id="courseId"
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                disabled={
                  createMutation.isPending || coursesLoading
                }
              >
                <option value="">
                  {coursesLoading
                    ? "Loading courses..."
                    : "Select a course"}
                </option>

                {courses.map((course) => (
                  <option
                    key={course._id}
                    value={course._id}
                  >
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="semester">Semester</label>

                <input
                  id="semester"
                  name="semester"
                  type="number"
                  min="1"
                  step="1"
                  value={form.semester}
                  onChange={handleChange}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="credits">Credits</label>

                <input
                  id="credits"
                  name="credits"
                  type="number"
                  min="1"
                  step="1"
                  value={form.credits}
                  onChange={handleChange}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => router.push("/admin/subjects")}
                disabled={createMutation.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.createButton}
                disabled={
                  createMutation.isPending ||
                  coursesLoading ||
                  coursesError ||
                  courses.length === 0
                }
              >
                {createMutation.isPending
                  ? "Creating..."
                  : "Create Subject"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function AdminCreateSubjectPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <CreateSubjectPage />
    </ProtectedRoute>
  );
}
