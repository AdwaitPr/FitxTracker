import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitxTracker — Track Your Fitness Journey",
  description:
    "Log workouts, track progress, and crush your fitness goals with FitxTracker.",
};

const themeScript = `
(function() {
  try {
    var theme = document.documentElement.getAttribute('data-theme');
    if (!theme) {
      /* TODO Group 13: restore prefers-color-scheme */
      var resolvedTheme = 'dark';
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.cookie = 'theme=' + resolvedTheme + '; path=/; max-age=31536000; SameSite=Lax';
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  /* TODO Group 13: restore prefers-color-scheme */
  const initialTheme =
    themeCookie === "light" || themeCookie === "dark" ? themeCookie : "dark";

  return (
    <html
      lang="en"
      className={plusJakartaSans.variable}
      data-theme={initialTheme}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}

