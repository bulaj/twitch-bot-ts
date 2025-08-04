import type { Metadata } from "next";
import { Bruno_Ace_SC } from "next/font/google";
import ThemeProvider from "../components/ThemeProvider";
import "./globals.css";
import React from "react";

const brunoAceSc = Bruno_Ace_SC({
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Twitch Bot Dashboard",
  description: "Dashboard dla bota Twitch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={brunoAceSc.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
