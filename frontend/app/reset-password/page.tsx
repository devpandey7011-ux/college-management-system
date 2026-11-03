
"use client";

import {
  FormEvent,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const subscribe = () => () => {};

const getTokenStatus = () =>
  sessionStorage.getItem("passwordResetToken") ? "valid" : "missing";

const getServerTokenStatus = () => "checking";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const tokenStatus = useSyncExternalStore(
    subscribe,
    getTokenStatus,
    getServerTokenStatus
  );

  useEffect(() => {
    if (tokenStatus === "missing") {
      router.replace("/forgot-password");
    }
  }, [tokenStatus, router]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const resetToken = sessionStorage.getItem("passwordResetToken");

    if (!resetToken) {
      setError(
        "Your reset session has expired. Please request a new code."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset your password."
        );
      }

      sessionStorage.removeItem("passwordResetToken");
      sessionStorage.removeItem("passwordResetEmail");

      setMessage(
        data.message ||
          "Password reset successfully. You can now log in."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenStatus !== "valid") {
    return (
      <main className={styles.page} aria-live="polite">
        Loading...
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link href="/login" className={styles.backLink}>
          ← Back to login
        </Link>

        <div className={styles.icon} aria-hidden="true">
          🔒
        </div>

        <h1 className={styles.title}>Reset your password</h1>

        <p className={styles.subtitle}>
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="password">New password</label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={8}
              required
              disabled={isLoading || !!message}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength={8}
              required
              disabled={isLoading || !!message}
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className={styles.success} role="status">
              {message}
            </p>
          )}

          {!message && (
            <button type="submit" disabled={isLoading}>
              {isLoading
                ? "Resetting password..."
                : "Reset password"}
            </button>
          )}

          {message && (
            <Link href="/login" className={styles.loginButton}>
              Go to login
            </Link>
          )}
        </form>
      </section>
    </main>
  );
}
