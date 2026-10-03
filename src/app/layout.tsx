import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spark Pixel Board",
  description: "Create a pixel design and send it to the Spark Studios light board.",
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

