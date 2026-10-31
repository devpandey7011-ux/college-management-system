"use client";

import { useAuth } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AttendanceSummary from "@/components/student/AttendanceSummary";
import AttendanceHistory from "@/components/student/AttendanceHistory";
import ResultsList from "@/components/student/ResultsList";
import AssignmentsList from "@/components/student/AssignmentsList";
import NoticesList from "@/components/teacher/NoticesList";
import styles from "./page.module.css";

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <main className={styles.dashboard}>
        <header className={styles.dashboardHeader}>
          <div>
            <h1>Student Dashboard</h1>

            <p>
              Welcome, {user?.name || "Student"}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
          >
            Logout
          </button>
        </header>

        <section className={styles.welcomeCard}>
          <h2>
            Welcome back, {user?.name || "Student"}!
          </h2>

          <p>
            Here you can view your academic information,
            attendance, results, assignments and notices.
          </p>
        </section>

        <AttendanceSummary />
        <br /><br />
        <AttendanceHistory />
        <br /><br />
        <ResultsList />
        <br /><br />
        <AssignmentsList />
        <br /><br />
        <NoticesList />
      </main>
    </ProtectedRoute>
  );
}