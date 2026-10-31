"use client";

import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAttendance,
  AttendanceStatus,
} from "@/services/attendance.service";
import { getTeacherStudents } from "@/services/teacher.service";
import { getSubjects } from "@/services/subject.service";

import styles from "./AttendanceForm.module.css";

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AttendanceForm() {
  const queryClient = useQueryClient();

  const [student, setStudent] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(getTodayDate);
  const [status, setStatus] =
    useState<AttendanceStatus>("present");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const studentsQuery = useQuery({
    queryKey: ["teacher", "students"],
    queryFn: getTeacherStudents,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const mutation = useMutation({
    mutationFn: createAttendance,

    onSuccess: async (response) => {
      setMessage(response.message);
      setErrorMessage("");

      setStudent("");
      setSubject("");
      setDate(getTodayDate());
      setStatus("present");
      setRemarks("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["teacher", "attendance"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["student", "attendance"],
        }),
      ]);
    },

    onError: (error: unknown) => {
      setMessage("");

      const errorText = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setErrorMessage(
        errorText || "Failed to record attendance"
      );
    },
  });

  const handleSubmit = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!student || !subject || !date) {
      setErrorMessage(
        "Student, subject and date are required"
      );
      return;
    }

    mutation.mutate({
      student,
      subject,
      date,
      status,
      remarks: remarks.trim() || undefined,
    });
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Record Attendance</h2>
        <p>
          Record attendance for students assigned to your
          subjects.
        </p>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div className={styles.field}>
          <label htmlFor="student">Student</label>

          <select
            id="student"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            disabled={
              studentsQuery.isLoading ||
              mutation.isPending
            }
          >
            <option value="">
              {studentsQuery.isLoading
                ? "Loading students..."
                : "Select student"}
            </option>

            {studentsQuery.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.enrollmentNumber}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="subject">Subject</label>

          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={
              subjectsQuery.isLoading ||
              mutation.isPending
            }
          >
            <option value="">
              {subjectsQuery.isLoading
                ? "Loading subjects..."
                : "Select subject"}
            </option>

            {subjectsQuery.data?.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.name} ({item.code})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="date">Date</label>

          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={mutation.isPending}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="status">Status</label>

          <select
            id="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as AttendanceStatus)
            }
            disabled={mutation.isPending}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="remarks">Remarks</label>

          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional remarks"
            rows={3}
            disabled={mutation.isPending}
          />
        </div>

        {message && (
          <p className={styles.success}>{message}</p>
        )}

        {errorMessage && (
          <p className={styles.error}>{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? "Recording..."
            : "Record Attendance"}
        </button>
      </form>
    </section>
  );
}
