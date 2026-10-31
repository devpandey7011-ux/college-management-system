
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
  createAdminTeacher,
  type CreateTeacherData,
} from "@/services/admin-teacher.service";

import styles from "./page.module.css";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      "Unable to create the teacher. Please check the details and try again."
    );
  }

  return "Unable to create the teacher. Please check the details and try again.";
}

export default function CreateTeacherPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: CreateTeacherData) =>
      createAdminTeacher(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "teachers"],
      });

      router.push("/admin/teachers");
    },

    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError));
    },
  });

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter the teacher's name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter the teacher's email.");
      return;
    }

    if (!password) {
      setError("Please enter a temporary password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!teacherId.trim()) {
      setError("Please enter the teacher ID.");
      return;
    }

    if (!department.trim()) {
      setError("Please enter the department.");
      return;
    }

    if (!designation.trim()) {
      setError("Please enter the designation.");
      return;
    }

    const data: CreateTeacherData = {
      name: name.trim(),
      email: email.trim(),
      password,
      teacherId: teacherId.trim(),
      department: department.trim(),
      designation: designation.trim(),
      phone: phone.trim() || undefined,
    };

    mutation.mutate(data);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <main className={styles.page}>
        <div className={styles.container}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push("/admin/teachers")}
          >
            ← Teacher Management
          </button>

          <header className={styles.header}>
            <span className={styles.eyebrow}>
              Administration
            </span>

            <h1>Add Teacher</h1>

            <p>
              Create a new teacher account and faculty
              profile.
            </p>
          </header>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Account Information</h2>

                <p>
                  These details will be used for the
                  teacher&apos;s login.
                </p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="name">
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter teacher's full name"
                    autoComplete="name"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="teacher@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="password">
                    Temporary Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                  />

                  <small>
                    The teacher can use this password
                    to log in.
                  </small>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Faculty Information</h2>

                <p>
                  Enter the teacher&apos;s institutional
                  details.
                </p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="teacherId">
                    Teacher ID
                  </label>

                  <input
                    id="teacherId"
                    type="text"
                    value={teacherId}
                    onChange={(event) =>
                      setTeacherId(event.target.value)
                    }
                    placeholder="e.g. T004"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="department">
                    Department
                  </label>

                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(event) =>
                      setDepartment(event.target.value)
                    }
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="designation">
                    Designation
                  </label>

                  <input
                    id="designation"
                    type="text"
                    value={designation}
                    onChange={(event) =>
                      setDesignation(event.target.value)
                    }
                    placeholder="e.g. Assistant Professor"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="phone">
                    Phone <span>(optional)</span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="Enter phone number"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </section>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => router.push("/admin/teachers")}
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
                  : "Create Teacher"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
