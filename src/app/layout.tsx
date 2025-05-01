import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrescriptAI-Prescription Companion",
  description: "Your AI powered Prescription Companion ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <main className="min-h-screen flex flex-col bg-white">
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
