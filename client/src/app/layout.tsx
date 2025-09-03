import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PingUp Chat",
  description:
    "PingUp Chat is a real-time messaging application for seamless communication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
