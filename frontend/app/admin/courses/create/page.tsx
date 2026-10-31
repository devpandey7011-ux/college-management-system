"use client";

import { FormEvent, useState } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  createAdminCourse,
  type CreateCourseData,
} from "@/services/admin-course.service";

import styles from "./page.module.css";

function CreateCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateCourseData>({
    name: "",
    code: "",
    department: "",
    totalSemesters: 6,
  });

  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createAdminCourse,

    onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: ["admin", "courses"],
  });

  router.push("/admin/courses");
},

    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to create course."
        );
      } else {
        setError("Failed to create course.");
      }
    },
  });

  const updateField = (
    field: keyof CreateCourseData,
    value: string | number
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const department = form.department.trim();

    if (!name || !code || !department) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isInteger(form.totalSemesters) ||
      form.totalSemesters < 1 ||
      form.totalSemesters > 20
    ) {
      setError(
        "Total semesters must be between 1 and 20."
      );
      return;
    }

    mutation.mutate({
      name,
      code,
      department,
      totalSemesters: form.totalSemesters,
    });
  };

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
          <h1>Add Course</h1>

          <p>
            Create a new academic course for the college.
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="name">
                Course Name <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Bachelor of Computer Applications"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="code">
                Course Code <span>*</span>
              </label>

              <input
                id="code"
                type="text"
                value={form.code}
                onChange={(event) =>
                  updateField(
                    "code",
                    event.target.value.toUpperCase()
                  )
                }
                placeholder="BCA"
              />

              <small>
                Use a unique code such as BCA, BBA or MCA.
              </small>
            </div>

            <div className={styles.field}>
              <label htmlFor="department">
                Department <span>*</span>
              </label>

              <input
                id="department"
                type="text"
                value={form.department}
                onChange={(event) =>
                  updateField(
                    "department",
                    event.target.value
                  )
                }
                placeholder="Computer Applications"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="totalSemesters">
                Total Semesters <span>*</span>
              </label>

              <select
                id="totalSemesters"
                value={form.totalSemesters}
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
                  <option
                    key={semester}
                    value={semester}
                  >
                    {semester}{" "}
                    {semester === 1
                      ? "Semester"
                      : "Semesters"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() =>
                router.push("/admin/courses")
              }
              disabled={mutation.isPending}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Creating..."
                : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function AdminCreateCoursePage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <CreateCoursePage />
    </ProtectedRoute>
  );
}