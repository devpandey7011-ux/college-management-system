"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyAttendanceSummary } from "@/services/attendance.service";

import styles from "./AttendanceSummary.module.css";

export default function AttendanceSummary() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student", "attendance", "summary"],
    queryFn: getMyAttendanceSummary,
  });

  if (isLoading) {
    return (
      <section className={styles.container}>
        <h2>Attendance Summary</h2>
        <p>Loading attendance...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.container}>
        <h2>Attendance Summary</h2>
        <p className={styles.error}>
          Failed to load attendance summary.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Attendance Summary</h2>
          <p>Your subject-wise attendance</p>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <p className={styles.empty}>
          No attendance records found.
        </p>
      ) : (
        <div className={styles.grid}>
          {data.map((item) => (
            <div
              key={item.subjectId}
              className={styles.card}
            >
              <div className={styles.subjectHeader}>
                <div>
                  <h3>{item.subjectName}</h3>
                  <span>{item.subjectCode}</span>
                </div>

                <strong>
                  {item.attendancePercentage}%
                </strong>
              </div>

              <div className={styles.stats}>
                <div>
                  <span>Present</span>
                  <strong>{item.present}</strong>
                </div>

                <div>
                  <span>Absent</span>
                  <strong>{item.absent}</strong>
                </div>

                <div>
                  <span>Late</span>
                  <strong>{item.late}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>{item.total}</strong>
                </div>
              </div>

              <div className={styles.progress}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${Math.min(
                      item.attendancePercentage,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}