import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ledger",
  description: "Zero-based budgeting, one cycle at a time.",
};

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      {/* Mobile: full screen. Wider screens: a 390×844 phone column, as in the design. */}
      <body className="min-h-dvh bg-frame sm:flex sm:items-center sm:justify-center sm:p-8">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-sheet sm:h-[844px] sm:min-h-0 sm:rounded-[52px] sm:shadow-device">
          {children}
        </div>
      </body>
    </html>
  );
}
