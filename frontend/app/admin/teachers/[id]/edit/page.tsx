
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
  getAdminTeachers,
  updateAdminTeacher,
  type UpdateTeacherData,
  type AdminTeacher,
} from "@/services/admin-teacher.service";

import styles from "./page.module.css";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      "Unable to update the teacher. Please check the details and try again."
    );
  }

  return "Unable to update the teacher. Please check the details and try again.";
}

function TeacherEditForm({
  teacher,
  teacherId,
}: {
  teacher: AdminTeacher;
  teacherId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState(teacher.user.name);
  const [email, setEmail] = useState(teacher.user.email);
  const [institutionalTeacherId, setInstitutionalTeacherId] =
    useState(teacher.teacherId);
  const [department, setDepartment] = useState(teacher.department);
  const [designation, setDesignation] = useState(teacher.designation);
  const [phone, setPhone] = useState(teacher.phone ?? "");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: UpdateTeacherData) =>
      updateAdminTeacher(teacherId, data),

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

    if (!institutionalTeacherId.trim()) {
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

    const data: UpdateTeacherData = {
      name: name.trim(),
      email: email.trim(),
      teacherId: institutionalTeacherId.trim(),
      department: department.trim(),
      designation: designation.trim(),
      phone: phone.trim(),
    };

    mutation.mutate(data);
  };

  return (
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
          <span className={styles.eyebrow}>Administration</span>

          <h1>Edit Teacher</h1>

          <p>
            Update the teacher&apos;s account and faculty information.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Account Information</h2>

              <p>Update the teacher&apos;s login identity.</p>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter teacher's full name"
                  autoComplete="name"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="teacher@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Faculty Information</h2>

              <p>
                Update institutional and professional details.
              </p>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="teacherId">Teacher ID</label>

                <input
                  id="teacherId"
                  type="text"
                  value={institutionalTeacherId}
                  onChange={(event) =>
                    setInstitutionalTeacherId(event.target.value)
                  }
                  placeholder="e.g. T004"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="department">Department</label>

                <input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="designation">Designation</label>

                <input
                  id="designation"
                  type="text"
                  value={designation}
                  onChange={(event) => setDesignation(event.target.value)}
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
                  onChange={(event) => setPhone(event.target.value)}
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
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();

  const teacherId = typeof params.id === "string" ? params.id : "";

  const {
    data: teachers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: getAdminTeachers,
    enabled: Boolean(teacherId),
  });

  const teacher = teachers.find(
    (item: AdminTeacher) => item._id === teacherId
  );

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <main className={styles.page}>
          <div className={styles.container}>
            <p className={styles.message}>Loading teacher...</p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (isError || !teacher) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.errorCard}>
              <h1>Unable to load teacher</h1>

              <p>
                The teacher could not be found or the required data
                could not be loaded.
              </p>

              <button
                type="button"
                className={styles.backButton}
                onClick={() => router.push("/admin/teachers")}
              >
                ← Back to Teachers
              </button>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <TeacherEditForm
        key={teacher._id}
        teacher={teacher}
        teacherId={teacherId}
      />
    </ProtectedRoute>
  );
}
