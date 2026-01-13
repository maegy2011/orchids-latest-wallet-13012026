import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Wallet, Banknote, Percent, ShieldAlert, AlertTriangle } from "lucide-react";
import ReportDataViewer from "@/components/ReportDataViewer";

export default function ReportsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans p-4 md:p-8" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">التقارير المالية</h1>
        <p className="text-zinc-500 dark:text-zinc-400">نظرة شاملة ومفصلة على كافة الأنشطة المالية والعمليات.</p>
      </header>

      <Tabs defaultValue="wallet-balances" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto mb-8 bg-zinc-100 dark:bg-zinc-900 p-1">
          <TabsTrigger value="wallet-balances" className="py-3 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            أرصدة المحافظ
          </TabsTrigger>
          <TabsTrigger value="daily-cash" className="py-3 flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            النقدية اليومي
          </TabsTrigger>
          <TabsTrigger value="earned-fees" className="py-3 flex items-center gap-2">
            <Percent className="h-4 w-4" />
            الرسوم المحصلة
          </TabsTrigger>
          <TabsTrigger value="rejected-modified" className="py-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            المرفوضة والمعدلة
          </TabsTrigger>
          <TabsTrigger value="limit-violations" className="py-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            تجاوز الحدود
          </TabsTrigger>
        </TabsList>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              عرض بيانات التقرير
            </CardTitle>
            <CardDescription>
              يتم تحديث هذه البيانات تلقائياً بناءً على العمليات المسجلة في النظام.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 flex items-center justify-center">جاري تحميل التقرير...</div>}>
              <TabsContent value="wallet-balances">
                <ReportDataViewer type="wallet-balances" />
              </TabsContent>
              <TabsContent value="daily-cash">
                <ReportDataViewer type="daily-cash" />
              </TabsContent>
              <TabsContent value="earned-fees">
                <ReportDataViewer type="earned-fees" />
              </TabsContent>
              <TabsContent value="rejected-modified">
                <ReportDataViewer type="rejected-modified" />
              </TabsContent>
              <TabsContent value="limit-violations">
                <ReportDataViewer type="limit-violations" />
              </TabsContent>
            </Suspense>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
