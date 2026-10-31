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
  createAdminStudent,
  CreateStudentData,
} from "@/services/admin-student.service";

import { getCourses } from "@/services/course.service";

import styles from "./page.module.css";

export default function CreateStudentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const selectedCourse = courses.find(
    (item) => item.code === course
  );

  const mutation = useMutation({
    mutationFn: (data: CreateStudentData) =>
      createAdminStudent(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "students"],
      });

      router.push("/admin/students");
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
          : "Unable to create the student. Please check the details and try again."
      );
    },
  });

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter the student's name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter the student's email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!enrollmentNumber.trim()) {
      setError("Please enter the enrollment number.");
      return;
    }

    if (!course) {
      setError("Please select a course.");
      return;
    }

    if (!semester) {
      setError("Please select a semester.");
      return;
    }

    const numericSemester = Number(semester);

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

    const data: CreateStudentData = {
      name: name.trim(),
      email: email.trim(),
      password,
      enrollmentNumber: enrollmentNumber.trim(),
      course,
      semester: numericSemester,
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(dateOfBirth ? { dateOfBirth } : {}),
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
            onClick={() => router.push("/admin/students")}
          >
            ← Student Management
          </button>

          <header className={styles.header}>
            <span className={styles.eyebrow}>
              Administration
            </span>

            <h1>Add Student</h1>

            <p>
              Create a student account and academic profile.
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
                  These details are used for student login.
                </p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="name">Full Name</label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter student's full name"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">Email Address</label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="student@example.com"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="password">
                    Initial Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Academic Information</h2>

                <p>
                  Assign the student to a course and semester.
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
                    value={enrollmentNumber}
                    onChange={(event) =>
                      setEnrollmentNumber(event.target.value)
                    }
                    placeholder="Enter enrollment number"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="course">Course</label>

                  <select
                    id="course"
                    value={course}
                    onChange={(event) => {
                      setCourse(event.target.value);
                      setSemester("");
                    }}
                    disabled={coursesLoading}
                  >
                    <option value="">
                      {coursesLoading
                        ? "Loading courses..."
                        : "Select a course"}
                    </option>

                    {courses.map((item) => (
                      <option
                        key={item._id}
                        value={item.code}
                      >
                        {item.code} — {item.name}
                      </option>
                    ))}
                  </select>

                  {coursesError && (
                    <small className={styles.fieldError}>
                      Unable to load courses.
                    </small>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="semester">Semester</label>

                  <select
                    id="semester"
                    value={
                      selectedCourse &&
                      Number(semester) >
                        selectedCourse.totalSemesters
                        ? ""
                        : semester
                    }
                    onChange={(event) =>
                      setSemester(event.target.value)
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
                        {
                          length:
                            selectedCourse.totalSemesters,
                        },
                        (_, index) => index + 1
                      ).map((value) => (
                        <option
                          key={value}
                          value={value}
                        >
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
                  Optional contact and personal details.
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
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
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
                    value={dateOfBirth}
                    onChange={(event) =>
                      setDateOfBirth(event.target.value)
                    }
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
                onClick={() => router.push("/admin/students")}
                disabled={mutation.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={
                  mutation.isPending ||
                  coursesLoading ||
                  coursesError
                }
              >
                {mutation.isPending
                  ? "Creating..."
                  : "Create Student"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
