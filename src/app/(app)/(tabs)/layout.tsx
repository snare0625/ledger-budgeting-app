import { BottomNav } from "@/components/app/bottom-nav";

// The five main screens share the floating bottom nav.
export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
