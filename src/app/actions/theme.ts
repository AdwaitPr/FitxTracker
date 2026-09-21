"use server";

import { cookies } from "next/headers";

export type Theme = "light" | "dark";

export async function setTheme(theme: Theme): Promise<Theme> {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, {
    path: "/",
    maxAge: 31536000, // 1 year
    sameSite: "lax",
    httpOnly: false,
  });
  return theme;
}
