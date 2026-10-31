
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "FRONTEND_URL"] as const;

export const validateEnv = (): void => {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const frontendUrl = process.env.FRONTEND_URL!;

  try {
    const parsedUrl = new URL(frontendUrl);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error("FRONTEND_URL must be a valid HTTP or HTTPS URL");
  }

  if (process.env.NODE_ENV === "production") {
    if (process.env.JWT_SECRET!.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters in production");
    }

    if (frontendUrl.startsWith("http://")) {
      throw new Error("FRONTEND_URL must use HTTPS in production");
    }
  }
};
