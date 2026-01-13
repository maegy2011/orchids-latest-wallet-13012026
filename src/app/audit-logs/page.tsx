import { getAuditLogsAction } from "@/app/transactions/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Shield, History, Info, AlertTriangle } from "lucide-react";

export default async function AuditLogsPage() {
  const logs = await getAuditLogsAction();

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "Approved": return <Badge className="bg-green-500">معتمدة</Badge>;
      case "Rejected": return <Badge variant="destructive">مرفوضة</Badge>;
      case "Pending": return <Badge variant="secondary">قيد الانتظار</Badge>;
      case "Draft": return <Badge variant="outline">مسودة</Badge>;
      default: return <Badge variant="outline">{status || "-"}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8 font-sans" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <History className="h-8 w-8 text-indigo-600" />
            سجل المراقبة (Audit Log)
          </h1>
          <p className="text-muted-foreground mt-1">سجل شامل لجميع العمليات المالية والتعديلات غير قابل للحذف.</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg flex items-center gap-2 border border-zinc-200 dark:border-zinc-700">
          <Shield className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-semibold">نظام حماية البيانات نشط</span>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">سجل العمليات</CardTitle>
          <CardDescription>عرض تفصيلي للتحركات المالية وحالات الاعتماد</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead className="text-right">رقم المعاملة</TableHead>
                  <TableHead className="text-right">نوع العملية</TableHead>
                  <TableHead className="text-right">المستخدم / المعتمد</TableHead>
                  <TableHead className="text-right">الفرع</TableHead>
                  <TableHead className="text-right">التاريخ والوقت</TableHead>
                  <TableHead className="text-right">القيمة (قبل / بعد)</TableHead>
                  <TableHead className="text-right">الحالة / السبب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Info className="h-8 w-8 opacity-20" />
                        <span>لا توجد سجلات حالياً</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <TableCell className="font-mono text-xs">{log.transaction_id?.slice(0, 8) || "-"}</TableCell>
                      <TableCell>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{log.operation_type}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{log.user_id || log.action_by || "النظام"}</span>
                          {log.action_by && <span className="text-[10px] text-muted-foreground">(بواسطة المعتمد)</span>}
                        </div>
                      </TableCell>
                      <TableCell>{log.branches?.name || "-"}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {format(new Date(log.created_at), 'PPP - p', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {log.old_value !== null && log.old_value !== undefined && (
                            <span className="text-xs text-rose-500 line-through decoration-rose-300">
                              {Number(log.old_value).toLocaleString()}
                            </span>
                          )}
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {Number(log.new_value).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(log.approval_status)}
                          </div>
                          {(log.edit_reason || log.rejection_reason) && (
                            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs flex items-start gap-2 max-w-[200px]">
                              <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />
                              <span>{log.edit_reason || log.rejection_reason}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-2xl flex items-start gap-4">
        <Shield className="h-6 w-6 text-indigo-600 mt-1 shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-900 dark:text-indigo-100">سياسة المراقبة والأمان</h4>
          <p className="text-sm text-indigo-800/80 dark:text-indigo-200/80 leading-relaxed">
            يتم تسجيل كافة العمليات المالية والتعديلات تلقائياً في هذا السجل. هذا الجدول للقراءة فقط ولا يمكن حذفه أو تعديل بياناته لضمان أعلى معايير الشفافية والمساءلة المالية. يتم تشفير كافة البيانات المخزنة لضمان سلامتها من العبث.
          </p>
        </div>
      </div>
    </div>
  );
}
