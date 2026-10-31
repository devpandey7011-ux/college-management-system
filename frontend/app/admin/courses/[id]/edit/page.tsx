"use client";

import { FormEvent, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getAdminCourses,
  updateAdminCourse,
  type UpdateCourseData,
} from "@/services/admin-course.service";

import styles from "./page.module.css";

function EditCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();

  const courseId = params.id as string;

  const [form, setForm] = useState<UpdateCourseData | null>(null);
  const [error, setError] = useState("");

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: getAdminCourses,
  });

  const course = courses.find((item) => item._id === courseId);

  const formData: UpdateCourseData = form ?? {
    name: course?.name ?? "",
    code: course?.code ?? "",
    department: course?.department ?? "",
    totalSemesters: course?.totalSemesters ?? 6,
  };

  const mutation = useMutation({
    mutationFn: (data: UpdateCourseData) =>
      updateAdminCourse(courseId, data),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "courses"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "subjects"],
        }),
      ]);

      router.push("/admin/courses");
    },

    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to update course."
        );
      } else {
        setError("Failed to update course.");
      }
    },
  });

  const updateField = (
    field: keyof UpdateCourseData,
    value: string | number
  ) => {
    setForm((current) => ({
      ...(current ?? formData),
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const name = (formData.name || "").trim();
    const code = (formData.code || "").trim().toUpperCase();
    const department = (formData.department || "").trim();

    if (!name || !code || !department) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isInteger(formData.totalSemesters) ||
      formData.totalSemesters! < 1 ||
      formData.totalSemesters! > 20
    ) {
      setError("Total semesters must be between 1 and 20.");
      return;
    }

    mutation.mutate({
      name,
      code,
      department,
      totalSemesters: formData.totalSemesters,
    });
  };

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.state}>Loading course...</div>
      </main>
    );
  }

  if (isError || !course) {
    return (
      <main className={styles.page}>
        <div className={styles.state}>
          <h2>Course not found</h2>

          <p>The requested course could not be loaded.</p>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push("/admin/courses")}
          >
            ← Back to Courses
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push("/admin/courses")}
        >
          ← Back to Courses
        </button>

        <div className={styles.header}>
          <h1>Edit Course</h1>
          <p>Update the academic course information.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="name">
                Course Name <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                value={formData.name || ""}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="code">
                Course Code <span>*</span>
              </label>

              <input
                id="code"
                type="text"
                value={formData.code || ""}
                onChange={(event) =>
                  updateField(
                    "code",
                    event.target.value.toUpperCase()
                  )
                }
              />

              <small>Course codes must be unique.</small>
            </div>

            <div className={styles.field}>
              <label htmlFor="department">
                Department <span>*</span>
              </label>

              <input
                id="department"
                type="text"
                value={formData.department || ""}
                onChange={(event) =>
                  updateField("department", event.target.value)
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="totalSemesters">
                Total Semesters <span>*</span>
              </label>

              <select
                id="totalSemesters"
                value={formData.totalSemesters}
                onChange={(event) =>
                  updateField(
                    "totalSemesters",
                    Number(event.target.value)
                  )
                }
              >
                {Array.from(
                  { length: 12 },
                  (_, index) => index + 1
                ).map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}{" "}
                    {semester === 1 ? "Semester" : "Semesters"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => router.push("/admin/courses")}
              disabled={mutation.isPending}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function AdminEditCoursePage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <EditCoursePage />
    </ProtectedRoute>
  );
}