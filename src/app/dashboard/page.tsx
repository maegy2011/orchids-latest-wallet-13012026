import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Banknote, History, Percent, AlertTriangle, CheckCircle2, LayoutGrid, CreditCard, UserCircle } from "lucide-react";
import Link from "next/link";
import { getDashboardStatsAction } from "@/app/transactions/actions";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const stats = await getDashboardStatsAction();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-zinc-500 dark:text-zinc-400">مرحباً بك مجدداً، نظرة عامة على نشاطك اليوم.</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي رصيد النقدية</CardTitle>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.totalCashBalance.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي أرصدة المحافظ</CardTitle>
            <Wallet className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.totalWalletBalances.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">عدد العمليات اليوم</CardTitle>
            <History className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.opsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرسوم المحصلة</CardTitle>
            <Percent className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.totalFeesToday.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              تنبيهات المحافظ والحدود
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.alerts.approachingLimit.length === 0 && stats.alerts.unavailable.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-zinc-500 italic">
                جميع المحافظ تعمل بشكل طبيعي وضمن الحدود
              </div>
            ) : (
              <>
                  {stats.alerts.approachingLimit.map((alert, idx) => (
                    <div key={`${alert.id}-${idx}`} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 rounded-lg border border-amber-100 dark:border-amber-900 shadow-sm">
                    <span className="text-sm font-medium">{alert.name}</span>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">اقتربت من الحد ({alert.percentage}%)</span>
                  </div>
                ))}
                {stats.alerts.unavailable.map((alert, idx) => (
                  <div key={`${alert.id}-${idx}`} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 rounded-lg border border-red-100 dark:border-red-900 shadow-sm">
                    <span className="text-sm font-medium">{alert.name}</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">غير متاحة لـ {alert.reason}</span>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              الفروقات النقدية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.alerts.discrepancies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-zinc-500 italic gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <span>لا توجد فروقات نقدية مسجلة حالياً</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Discrepancies logic here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button
        asChild
        size="lg"
        className="fixed bottom-8 left-8 h-16 w-16 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white z-50 transition-all hover:scale-110 active:scale-95"
      >
        <Link href="/transactions/new" title="إضافة معاملة جديدة">
          <Plus className="h-8 w-8" />
        </Link>
      </Button>
    </div>
  );
}
