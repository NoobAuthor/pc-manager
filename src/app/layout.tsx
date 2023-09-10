import "./globals.css";
import type { Metadata } from "next";
import Sidenav from "./components/Sidenav/Sidenav";
import Header from "./components/Header/Header";

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
        <Header />
        <Sidenav />
        <main className="ml-64 py-20 px-6">{children}</main>
      </body>
    </html>
  );
}
