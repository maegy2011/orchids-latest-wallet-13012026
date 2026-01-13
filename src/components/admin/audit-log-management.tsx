"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Search, 
  ShieldCheck, 
  User, 
  Calendar, 
  Activity,
  Lock,
  Filter,
  ArrowRightLeft,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function AuditLogManagement() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          branches (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل سجلات المراجعة");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.operation_type.toLowerCase().includes(search.toLowerCase()) ||
      log.transaction_id?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "all" || log.operation_type.includes(filterType);
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "Approved": return <Badge className="bg-green-500">معتمدة</Badge>;
      case "Rejected": return <Badge variant="destructive">مرفوضة</Badge>;
      case "Pending": return <Badge variant="secondary">قيد الانتظار</Badge>;
      default: return <Badge variant="outline">{status || "-"}</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            سجل المراقبة والتدقيق (Audit Log)
          </h2>
          <p className="text-zinc-500 text-sm mt-1">تتبع كامل لكل العمليات المالية والتعديلات وحالات الاعتماد.</p>
        </div>
        <Link href="/audit-logs" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm font-bold">
          عرض الصفحة الكاملة
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="بحث في العمليات، رقم المعاملة..."
            className="pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">جميع العمليات</option>
            <option value="إنشاء">إنشاء معاملات</option>
            <option value="تعديل">تعديل معاملات</option>
            <option value="اعتماد">اعتماد معاملات</option>
            <option value="رفض">رفض معاملات</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-zinc-500">جاري تحميل السجلات...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">لا توجد سجلات مطابقة للبحث</div>
          ) : (
            <div className="divide-y overflow-hidden">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg mt-1 ${log.operation_type.includes('تعديل') ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{log.operation_type}</span>
                        <span className="text-zinc-400 text-xs">•</span>
                        <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">#{log.transaction_id?.slice(0, 8)}</span>
                        {getStatusBadge(log.approval_status)}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user_id || log.action_by || "النظام"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(log.created_at), 'PPP - p', { locale: ar })}
                        </span>
                        <span className="font-medium text-indigo-600">{log.branches?.name}</span>
                      </div>
                      {(log.edit_reason || log.rejection_reason) && (
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded text-[11px] text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800 flex items-start gap-2 max-w-md">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{log.edit_reason || log.rejection_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {log.old_value !== null && (
                      <span className="text-[10px] text-rose-500 line-through">
                        {Number(log.old_value).toLocaleString()} ج.م
                      </span>
                    )}
                    <div className="text-sm font-bold flex items-center gap-1">
                      {log.old_value !== null && <ArrowRightLeft className="w-3 h-3 text-zinc-400" />}
                      <span className="text-green-600">{Number(log.new_value).toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
        <div className="text-sm text-emerald-800 dark:text-emerald-200">
          <p className="font-bold mb-1">الشفافية المالية:</p>
          يتم ربط كل سجل مراجعة برقم معاملة فريد وموظف مسؤول. التغييرات في القيم (قبل وبعد التعديل) تظهر بوضوح لضمان دقة التقارير المالية ومنع التلاعب.
        </div>
      </div>
    </div>
  );
}
