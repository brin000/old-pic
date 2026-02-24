"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieValue,
  isAccessKeyConfigured,
} from "@/lib/auth";

export async function verifyAccessKey(formData: FormData) {
  if (!isAccessKeyConfigured()) {
    redirect("/");
  }

  const key = formData.get("key");
  const input = typeof key === "string" ? key.trim() : "";
  const expected = process.env.ACCESS_KEY?.trim();

  if (!input) {
    redirect("/auth?error=empty");
  }
  if (input !== expected) {
    redirect("/auth?error=invalid");
  }

  const cookieValue = await getAuthCookieValue();
  if (cookieValue) {
    (await cookies()).set(AUTH_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  redirect("/");
}
