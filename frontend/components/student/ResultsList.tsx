"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyResults } from "@/services/result.service";

import styles from "./ResultsList.module.css";

const formatExamType = (examType: string) => {
  switch (examType) {
    case "internal":
      return "Internal";
    case "midterm":
      return "Midterm";
    case "final":
      return "Final";
    default:
      return examType;
  }
};

export default function ResultsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student", "results"],
    queryFn: getMyResults,
  });

  if (isLoading) {
    return (
      <section className={styles.container}>
        <h2>My Results</h2>
        <p className={styles.muted}>
          Loading results...
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.container}>
        <h2>My Results</h2>
        <p className={styles.error}>
          Failed to load results.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>My Results</h2>
          <p>
            View your examination results and grades
          </p>
        </div>

        <span className={styles.count}>
          {data?.length ?? 0} Results
        </span>
      </div>

      {!data || data.length === 0 ? (
        <div className={styles.empty}>
          No results have been uploaded yet.
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam</th>
                <th>Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {data.map((result) => {
                const percentage =
                  result.maxMarks === 0
                    ? 0
                    : (
                        (result.marksObtained /
                          result.maxMarks) *
                        100
                      ).toFixed(1);

                return (
                  <tr key={result._id}>
                    <td>
                      <div className={styles.subject}>
                        {result.subject.name}
                      </div>

                      <span className={styles.code}>
                        {result.subject.code}
                      </span>
                    </td>

                    <td>
                      {formatExamType(result.examType)}
                    </td>

                    <td className={styles.marks}>
                      {result.marksObtained}
                      {" / "}
                      {result.maxMarks}
                    </td>

                    <td>{percentage}%</td>

                    <td>
                      <span
                        className={`${styles.grade} ${
                          styles[
                            `grade${result.grade.replace(
                              "+",
                              "Plus"
                            )}`
                          ] || ""
                        }`}
                      >
                        {result.grade}
                      </span>
                    </td>

                    <td>
                      {result.remarks || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}