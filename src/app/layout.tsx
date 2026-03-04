import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MentorBridge",
  description: "DPCDSB peer-to-peer learning platform",
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
