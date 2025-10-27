import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "eMoney — Bonus Call",
  description: "Get aisle locations & penny alerts near you.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}