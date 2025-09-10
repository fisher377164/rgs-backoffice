import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Sidebar from "@/components/sidebar/Sidebar";
import TopHeader from "@/components/nav/TopHeader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "RGS Back Office",
  description: "RGS Back Office admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <TopHeader />
            <main className="flex-1 overflow-y-auto bg-[var(--background)]">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
