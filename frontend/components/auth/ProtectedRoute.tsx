"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/AuthProvider";
import styles from "./ProtectedRoute.module.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("student" | "teacher" | "admin")[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!user.role) {
      console.error(
        "ProtectedRoute: authenticated user has no role",
        user
      );

      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(`/${user.role}`);
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <main className={styles.page}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <p>Redirecting...</p>
      </main>
    );
  }

  if (!user.role) {
    return (
      <main className={styles.page}>
        <p>Invalid user session. Redirecting...</p>
      </main>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}