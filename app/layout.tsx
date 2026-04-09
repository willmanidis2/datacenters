import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Data Center Moratoriums",
  description:
    "Tracking state-level data center legislation across the United States. Interactive map, live news, and AI-powered analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
