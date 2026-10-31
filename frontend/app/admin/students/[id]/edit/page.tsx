"use client";

import { FormEvent, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  getAdminStudents,
  updateAdminStudent,
  type UpdateStudentData,
} from "@/services/admin-student.service";

import { getCourses } from "@/services/course.service";

import styles from "./page.module.css";

export default function EditStudentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();

  const studentId =
    typeof params.id === "string" ? params.id : "";

  const [form, setForm] = useState<{
    name: string;
    email: string;
    enrollmentNumber: string;
    course: string;
    semester: string;
    phone: string;
    dateOfBirth: string;
  } | null>(null);

  const [error, setError] = useState("");

  const {
    data: students = [],
    isLoading: studentsLoading,
    isError: studentsError,
  } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: getAdminStudents,
    enabled: Boolean(studentId),
  });

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const student = students.find(
    (item) => item._id === studentId
  );

  const formData = form ?? {
    name: student?.userId.name ?? "",
    email: student?.userId.email ?? "",
    enrollmentNumber: student?.enrollmentNumber ?? "",
    course: student?.course ?? "",
    semester: student ? String(student.semester) : "",
    phone: student?.phone ?? "",
    dateOfBirth: student?.dateOfBirth
      ? student.dateOfBirth.slice(0, 10)
      : "",
  };

  const selectedCourse = courses.find(
    (item) => item.code === formData.course
  );

  const mutation = useMutation({
    mutationFn: (data: UpdateStudentData) =>
      updateAdminStudent(studentId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "students"],
      });

      router.push("/admin/students");
    },

    onError: (mutationError: unknown) => {
      let message =
        "Unable to update the student. Please check the details and try again.";

      if (axios.isAxiosError(mutationError)) {
        const responseMessage: unknown =
          mutationError.response?.data?.message;

        if (
          typeof responseMessage === "string" &&
          responseMessage.trim()
        ) {
          message = responseMessage;
        }
      }

      setError(message);
    },
  });

  const updateField = (
    field: keyof NonNullable<typeof form>,
    value: string
  ) => {
    setForm((current) => ({
      ...(current ?? formData),
      [field]: value,
    }));
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter the student's name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter the student's email.");
      return;
    }

    if (!formData.enrollmentNumber.trim()) {
      setError("Please enter the enrollment number.");
      return;
    }

    if (!formData.course) {
      setError("Please select a course.");
      return;
    }

    if (!formData.semester) {
      setError("Please select a semester.");
      return;
    }

    const numericSemester = Number(formData.semester);

    if (
      !selectedCourse ||
      numericSemester < 1 ||
      numericSemester > selectedCourse.totalSemesters
    ) {
      setError(
        `Semester must be between 1 and ${
          selectedCourse?.totalSemesters ?? 1
        }.`
      );
      return;
    }

    const data: UpdateStudentData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      enrollmentNumber: formData.enrollmentNumber.trim(),
      course: formData.course,
      semester: numericSemester,
      phone: formData.phone.trim(),
      dateOfBirth: formData.dateOfBirth || undefined,
    };

    mutation.mutate(data);
  };

  if (studentsLoading || coursesLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <main className={styles.page}>
          <div className={styles.container}>
            <p className={styles.message}>
              Loading student...
            </p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (studentsError || coursesError || !student) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.errorCard}>
              <h1>Unable to load student</h1>

              <p>
                The student could not be found or the required
                data could not be loaded.
              </p>

              <button
                type="button"
                className={styles.backButton}
                onClick={() => router.push("/admin/students")}
              >
                ← Back to Students
              </button>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <main className={styles.page}>
        <div className={styles.container}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push("/admin/students")}
          >
            ← Student Management
          </button>

          <header className={styles.header}>
            <span className={styles.eyebrow}>
              Administration
            </span>

            <h1>Edit Student</h1>

            <p>
              Update the student&apos;s account and academic
              information.
            </p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Account Information</h2>
                <p>Update the student&apos;s login identity.</p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="name">Full Name</label>

                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Enter student's full name"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">Email Address</label>

                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="student@example.com"
                  />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Academic Information</h2>
                <p>
                  Update the student&apos;s course, semester and
                  enrollment.
                </p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="enrollmentNumber">
                    Enrollment Number
                  </label>

                  <input
                    id="enrollmentNumber"
                    type="text"
                    value={formData.enrollmentNumber}
                    onChange={(event) =>
                      updateField(
                        "enrollmentNumber",
                        event.target.value
                      )
                    }
                    placeholder="Enter enrollment number"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="course">Course</label>

                  <select
                    id="course"
                    value={formData.course}
                    onChange={(event) => {
                      const newCourse = event.target.value;

                      setForm((current) => ({
                        ...(current ?? formData),
                        course: newCourse,
                        semester: "",
                      }));
                    }}
                  >
                    <option value="">Select a course</option>

                    {courses.map((item) => (
                      <option key={item._id} value={item.code}>
                        {item.code} — {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="semester">Semester</label>

                  <select
                    id="semester"
                    value={formData.semester}
                    onChange={(event) =>
                      updateField("semester", event.target.value)
                    }
                    disabled={!selectedCourse}
                  >
                    <option value="">
                      {!selectedCourse
                        ? "Select a course first"
                        : "Select semester"}
                    </option>

                    {selectedCourse &&
                      Array.from(
                        { length: selectedCourse.totalSemesters },
                        (_, index) => index + 1
                      ).map((value) => (
                        <option key={value} value={value}>
                          Semester {value}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Additional Information</h2>
                <p>
                  Update optional contact and personal details.
                </p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="phone">
                    Phone <span>(optional)</span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="dateOfBirth">
                    Date of Birth <span>(optional)</span>
                  </label>

                  <input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(event) =>
                      updateField("dateOfBirth", event.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            {error && (
              <div className={styles.error}>{error}</div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => router.push("/admin/students")}
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
    </ProtectedRoute>
  );
}