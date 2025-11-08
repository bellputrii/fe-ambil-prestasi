import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";

const fontSans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ambil Prestasi",
  description: "Ambil Prestasi adalah platform manajemen pembelajaran daring untuk mentor dan siswa.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeThemeValues = cookieStore.get("activeTheme")?.value || "default";
  const isScaled = activeThemeValues.endsWith("-scaled");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
          activeThemeValues ? `theme-${activeThemeValues}` : "",
          isScaled ? "theme-scaled" : ""
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <ActiveThemeProvider initialTheme={activeThemeValues}>
            {children}
            <Toaster />
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
