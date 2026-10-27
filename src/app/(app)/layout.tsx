import type { Viewport } from "next";
import { ToastProvider } from "@/components/app/toaster";

// Most app screens are white; Home (dark hero) sets its own.
export const viewport: Viewport = { themeColor: "#ffffff" };

// Signed-in, unlocked app (gated in src/proxy.ts). On wider screens the phone
// column has a fixed height, so this is its scroll container.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ToastProvider>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none]">
        {children}
      </div>
    </ToastProvider>
  );
}
