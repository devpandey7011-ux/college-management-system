
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

const getEmailStatus = () =>
  sessionStorage.getItem("passwordResetEmail") || "missing";

const getServerEmailStatus = () => "checking";

export default function VerifyResetOtpPage() {
  const router = useRouter();

  const emailStatus = useSyncExternalStore(
    subscribe,
    getEmailStatus,
    getServerEmailStatus
  );

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (emailStatus === "missing") {
      router.replace("/forgot-password");
    }
  }, [emailStatus, router]);

  const email = emailStatus === "checking" || emailStatus === "missing"
    ? ""
    : emailStatus;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otp.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "OTP verification failed."
        );
      }

      if (!data.resetToken) {
        throw new Error(
          "The server did not return a reset token. Please try again."
        );
      }

      sessionStorage.setItem("passwordResetToken", data.resetToken);
      router.push("/reset-password");
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

  if (emailStatus === "checking" || emailStatus === "missing") {
    return (
      <main className={styles.page} aria-live="polite">
        Loading...
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link href="/forgot-password" className={styles.backLink}>
          ← Back
        </Link>

        <div className={styles.icon} aria-hidden="true">
          ✉
        </div>

        <h1 className={styles.title}>Verify your email</h1>

        <p className={styles.subtitle}>
          Enter the verification code sent to{" "}
          <strong>{email}</strong>.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="otp">Verification code</label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </div>

          {message && (
            <p className={styles.success} role="status">
              {message}
            </p>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify code"}
          </button>
        </form>

        <p className={styles.footer}>
          Wrong email? <Link href="/forgot-password">Try again</Link>
        </p>
      </section>
    </main>
  );
}
