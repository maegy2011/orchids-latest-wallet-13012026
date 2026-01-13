import { DashboardHeader } from "@/components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <DashboardHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
