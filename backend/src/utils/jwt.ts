
import jwt from "jsonwebtoken";

export const generateToken = (
  userId: string,
  type: "auth" | "reset-password" = "auth",
  resetTokenVersion?: number
): string => {
  const expiresIn = type === "reset-password" ? "10m" : "7d";

  return jwt.sign(
    {
      userId,
      type,
      ...(type === "reset-password" && resetTokenVersion !== undefined
        ? { resetTokenVersion }
        : {}),
    },
    process.env.JWT_SECRET as string,
    { expiresIn }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as {
    userId: string;
    type: "auth" | "reset-password";
    resetTokenVersion?: number;
    iat: number;
    exp: number;
  };
};
