import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import ThemeProvider from "../components/ThemeProvider";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

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
      <body className={orbitron.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
