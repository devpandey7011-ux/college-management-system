
"use client";

import { FormEvent, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getAdminSubjects,
  updateAdminSubject,
  type UpdateSubjectData,
} from "@/services/admin-subject.service";
import { getAdminCourses } from "@/services/admin-course.service";

import styles from "./page.module.css";

function EditSubjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const subjectId = params.id;

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useQuery({
    queryKey: ["admin", "subjects"],
    queryFn: getAdminSubjects,
  });

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: getAdminCourses,
  });

  const subject = subjects.find(
    (item) => item._id === subjectId
  );

  if (subjectsLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.state}>Loading subject...</div>
      </main>
    );
  }

  if (subjectsError || !subject) {
    return (
      <main className={styles.page}>
        <div className={styles.state}>
          <h2>Subject not found</h2>
          <p>The subject could not be loaded.</p>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push("/admin/subjects")}
          >
            ← Back to Subjects
          </button>
        </div>
      </main>
    );
  }

  return (
    <SubjectEditForm
      key={subject._id}
      subject={subject}
      courses={courses}
      coursesLoading={coursesLoading}
      coursesError={coursesError}
      onCancel={() => router.push("/admin/subjects")}
    />
  );
}

function SubjectEditForm({
  subject,
  courses,
  coursesLoading,
  coursesError,
  onCancel,
}: {
  subject: Awaited<ReturnType<typeof getAdminSubjects>>[number];
  courses: Awaited<ReturnType<typeof getAdminCourses>>;
  coursesLoading: boolean;
  coursesError: boolean;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [form, setForm] = useState<UpdateSubjectData>(() => ({
    name: subject.name,
    code: subject.code,
    courseId: subject.courseId._id,
    semester: subject.semester,
    credits: subject.credits,
  }));

  const [error, setError] = useState("");

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSubjectData) =>
      updateAdminSubject(subject._id, data),

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
          : "Failed to update subject. Please try again."
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

    const name = form.name;
    const code = form.code;
    const courseId = form.courseId;
    const semester = form.semester;
    const credits = form.credits;

    if (typeof name !== "string" || !name.trim()) {
      setError("Subject name is required.");
      return;
    }

    if (typeof code !== "string" || !code.trim()) {
      setError("Subject code is required.");
      return;
    }

    if (typeof courseId !== "string" || !courseId) {
      setError("Please select a course.");
      return;
    }

    if (
      typeof semester !== "number" ||
      !Number.isInteger(semester) ||
      semester < 1
    ) {
      setError("Semester must be a positive whole number.");
      return;
    }

    if (
      typeof credits !== "number" ||
      !Number.isInteger(credits) ||
      credits < 1
    ) {
      setError("Credits must be a positive whole number.");
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      courseId,
      semester,
      credits,
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onCancel}
        >
          ← Back to Subjects
        </button>

        <section className={styles.card}>
          <div className={styles.header}>
            <h1>Edit Subject</h1>
            <p>
              Update the details of{" "}
              <strong>{subject.name}</strong>.
            </p>
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

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="name">Subject Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name ?? ""}
                onChange={handleChange}
                disabled={updateMutation.isPending}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="code">Subject Code</label>
              <input
                id="code"
                name="code"
                type="text"
                value={form.code ?? ""}
                onChange={handleChange}
                disabled={updateMutation.isPending}
              />
              <span className={styles.hint}>
                Subject codes must be unique.
              </span>
            </div>

            <div className={styles.field}>
              <label htmlFor="courseId">Course</label>
              <select
                id="courseId"
                name="courseId"
                value={form.courseId ?? ""}
                onChange={handleChange}
                disabled={
                  updateMutation.isPending ||
                  coursesLoading ||
                  coursesError
                }
              >
                <option value="">
                  {coursesLoading
                    ? "Loading courses..."
                    : "Select a course"}
                </option>

                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
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
                  value={form.semester ?? 1}
                  onChange={handleChange}
                  disabled={updateMutation.isPending}
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
                  value={form.credits ?? 4}
                  onChange={handleChange}
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onCancel}
                disabled={updateMutation.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={
                  updateMutation.isPending ||
                  coursesLoading ||
                  coursesError
                }
              >
                {updateMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function AdminEditSubjectPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <EditSubjectPage />
    </ProtectedRoute>
  );
}
