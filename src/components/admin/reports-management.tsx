"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  TrendingUp, 
  AlertCircle, 
  CreditCard, 
  Download,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function ReportsManagement() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [monthly, setMonthly] = useState<Record<string, number>>({});
  const [overdue, setOverdue] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [sumRes, monthRes, overdueRes] = await Promise.all([
        fetch("/api/admin/reports"),
        fetch("/api/admin/reports?type=monthly"),
        fetch("/api/admin/reports?type=overdue")
      ]);

      if (sumRes.ok && monthRes.ok && overdueRes.ok) {
        setSummary(await sumRes.json());
        setMonthly(await monthRes.json());
        setOverdue(await overdueRes.json());
      }
    } catch (error) {
      toast.error("خطأ في تحميل التقارير");
    } finally {
      setLoading(false);
    }
  };

  const sortedMonths = Object.keys(monthly).sort();
  const maxMonthly = Math.max(...Object.values(monthly), 1);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <PieChartIcon className="w-6 h-6 text-primary" />
          تقارير الفواتير والمدفوعات
        </h2>
        <Button variant="outline" className="gap-2" onClick={fetchReports}>
          تحديث البيانات
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-700">إجمالي الإيرادات المسددة</CardDescription>
            <CardTitle className="text-2xl text-emerald-900 flex items-center justify-between">
              {summary?.paid?.toLocaleString() || 0} ج.م
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-rose-700">إجمالي المتأخرات (مستحقة)</CardDescription>
            <CardTitle className="text-2xl text-rose-900 flex items-center justify-between">
              {overdue?.total?.toLocaleString() || 0} ج.م
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700">فواتير قيد الانتظار</CardDescription>
            <CardTitle className="text-2xl text-amber-900 flex items-center justify-between">
              {summary?.pending?.toLocaleString() || 0} ج.م
              <CreditCard className="w-5 h-5 text-amber-500" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              الإيرادات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2 pt-10">
              {sortedMonths.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">لا توجد بيانات كافية</div>
              ) : (
                sortedMonths.map(month => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[10px] py-1 px-2 rounded">
                      {monthly[month].toLocaleString()}
                    </div>
                    <div 
                      className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t-sm border-t border-x border-primary/30"
                      style={{ height: `${(monthly[month] / maxMonthly) * 100}%` }}
                    />
                    <div className="text-[10px] text-zinc-500 rotate-45 mt-2 origin-right">
                      {month}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              أكبر المتأخرات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdue?.invoices?.length === 0 ? (
                <div className="py-8 text-center text-zinc-400">لا توجد متأخرات حالياً</div>
              ) : (
                overdue?.invoices?.slice(0, 5).map((inv: any) => (
                  <div key={inv.id} className="flex justify-between items-center p-3 rounded-lg border bg-zinc-50">
                    <div>
                      <div className="font-bold text-sm">{inv.profiles?.trading_name || inv.profiles?.name}</div>
                      <div className="text-xs text-zinc-500">مستحقة منذ: {format(new Date(inv.due_date), 'dd/MM/yyyy')}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-rose-600 font-bold">{inv.total_amount.toLocaleString()} ج.م</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{inv.invoice_number}</div>
                    </div>
                  </div>
                ))
              )}
              {overdue?.invoices?.length > 5 && (
                <div className="text-center text-xs text-zinc-500">و {overdue.invoices.length - 5} فواتير أخرى...</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ملخص الإيرادات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="p-3 text-right">الشهر</th>
                  <th className="p-3 text-left">إجمالي التحصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedMonths.reverse().map(month => (
                  <tr key={month}>
                    <td className="p-3">{month}</td>
                    <td className="p-3 text-left font-bold">{monthly[month].toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
