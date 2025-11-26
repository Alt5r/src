import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SanBernard | GPX Route Time Estimator",
  description:
    "AI-powered route timing predictions with weather analysis for hiking, running, and alpine adventures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/Widgets/widgets.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
