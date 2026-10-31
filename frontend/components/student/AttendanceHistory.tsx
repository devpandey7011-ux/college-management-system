"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyAttendance } from "@/services/attendance.service";

import styles from "./AttendanceHistory.module.css";

export default function AttendanceHistory() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student", "attendance", "history"],
    queryFn: getMyAttendance,
  });

  if (isLoading) {
    return (
      <section className={styles.container}>
        <h2>Attendance History</h2>
        <p className={styles.muted}>Loading attendance history...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.container}>
        <h2>Attendance History</h2>
        <p className={styles.error}>
          Failed to load attendance history.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Attendance History</h2>
          <p>Detailed record of your attendance</p>
        </div>

        <span className={styles.count}>
          {data?.length ?? 0} Records
        </span>
      </div>

      {!data || data.length === 0 ? (
        <div className={styles.empty}>
          No attendance records found.
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Code</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {data.map((record) => (
                <tr key={record._id}>
                  <td>
                    {new Date(record.date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>

                  <td className={styles.subject}>
                    {record.subject.name}
                  </td>

                  <td>{record.subject.code}</td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[record.status]
                      }`}
                    >
                      {record.status
                        .charAt(0)
                        .toUpperCase() +
                        record.status.slice(1)}
                    </span>
                  </td>

                  <td>
                    {record.remarks || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}