import "./globals.css";
import type { Metadata } from "next";
import Sidenav from "@/components/Sidenav/Sidenav";
import Header from "@/components/Header/Header";
import { NextAuthProvider } from "@/components/NextAuthProvider/NextAuthProvides";

export const metadata: Metadata = {
  title: "Project Manager",
  description: "Manage your project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <main className="ml-64 py-20 px-6">
            <Header />
            <Sidenav />
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}
