"use client";

import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createResult,
  ExamType,
  CreateResultData,
} from "@/services/result.service";

import { getTeacherStudents } from "@/services/teacher.service";
import { getSubjects } from "@/services/subject.service";

import styles from "./UploadResultForm.module.css";

export default function UploadResultForm() {
  const queryClient = useQueryClient();

  const [student, setStudent] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] =
    useState<ExamType>("internal");
  const [marksObtained, setMarksObtained] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [remarks, setRemarks] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    data: students = [],
    isLoading: studentsLoading,
  } = useQuery({
    queryKey: ["teacher", "students"],
    queryFn: getTeacherStudents,
  });

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateResultData) =>
      createResult(data),

    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["student", "results"],
      });

      setMessage(data.message);
      setError("");

      setStudent("");
      setSubject("");
      setExamType("internal");
      setMarksObtained("");
      setMaxMarks("");
      setRemarks("");
    },

    onError: (error: unknown) => {
      setMessage("");

      const errorMessage = isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      setError(
        errorMessage ?? "Failed to upload result."
      );
    },
  });

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const marks = Number(marksObtained);
    const maximum = Number(maxMarks);

    if (!student || !subject) {
      setError(
        "Please select a student and subject."
      );
      return;
    }

    if (maximum <= 0) {
      setError(
        "Maximum marks must be greater than 0."
      );
      return;
    }

    if (marks < 0 || marks > maximum) {
      setError(
        "Marks obtained must be between 0 and maximum marks."
      );
      return;
    }

    mutation.mutate({
      student,
      subject,
      examType,
      marksObtained: marks,
      maxMarks: maximum,
      remarks: remarks.trim() || undefined,
    });
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Upload Result</h2>
          <p>
            Upload examination results for your students.
          </p>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="result-student">
              Student
            </label>

            <select
              id="result-student"
              value={student}
              onChange={(event) =>
                setStudent(event.target.value)
              }
              required
              disabled={studentsLoading}
            >
              <option value="">
                {studentsLoading
                  ? "Loading students..."
                  : "Select student"}
              </option>

              {students.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name} — {item.enrollmentNumber}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="result-subject">
              Subject
            </label>

            <select
              id="result-subject"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              required
              disabled={subjectsLoading}
            >
              <option value="">
                {subjectsLoading
                  ? "Loading subjects..."
                  : "Select subject"}
              </option>

              {subjects.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="result-exam-type">
              Exam Type
            </label>

            <select
              id="result-exam-type"
              value={examType}
              onChange={(event) =>
                setExamType(
                  event.target.value as ExamType
                )
              }
            >
              <option value="internal">Internal</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="result-max-marks">
              Maximum Marks
            </label>

            <input
              id="result-max-marks"
              type="number"
              min="1"
              value={maxMarks}
              onChange={(event) =>
                setMaxMarks(event.target.value)
              }
              placeholder="e.g. 50"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="result-marks">
            Marks Obtained
          </label>

          <input
            id="result-marks"
            type="number"
            min="0"
            value={marksObtained}
            onChange={(event) =>
              setMarksObtained(event.target.value)
            }
            placeholder="e.g. 42"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="result-remarks">
            Remarks
          </label>

          <textarea
            id="result-remarks"
            value={remarks}
            onChange={(event) =>
              setRemarks(event.target.value)
            }
            placeholder="Optional remarks"
            rows={4}
          />
        </div>

        {message && (
          <p className={styles.success}>
            {message}
          </p>
        )}

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? "Uploading..."
            : "Upload Result"}
        </button>
      </form>
    </section>
  );
}
