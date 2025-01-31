import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import Loading from "./loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<Loading />}>
          {children}
          <Toaster position="top-right" richColors visibleToasts={1} />
        </Suspense>
      </body>
    </html>
  );
}
