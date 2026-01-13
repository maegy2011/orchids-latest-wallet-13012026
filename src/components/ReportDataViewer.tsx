"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";

interface ReportDataViewerProps {
  type: string;
}

export default function ReportDataViewer({ type }: ReportDataViewerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/reports?type=${type}`);
        if (!response.ok) throw new Error("فشل تحميل البيانات");
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Spinner className="h-8 w-8 text-indigo-600" />
        <p className="text-zinc-500">جاري جلب بيانات التقرير...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2 text-red-600">
        <XCircle className="h-10 w-10" />
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm underline mt-2"
        >
          حاول مرة أخرى
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2 text-zinc-400">
        <Info className="h-10 w-10" />
        <p>لا توجد بيانات متاحة لهذا التقرير حالياً.</p>
      </div>
    );
  }

  const renderTable = () => {
    switch (type) {
      case "wallet-balances":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم المحفظة</TableHead>
                <TableHead className="text-right">المزود</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
                <TableHead className="text-right">العملة</TableHead>
                <TableHead className="text-right">رقم SIM</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.provider}</TableCell>
                  <TableCell className="font-bold text-indigo-600">{Number(item.balance).toLocaleString()}</TableCell>
                  <TableCell>{item.currency}</TableCell>
                  <TableCell dir="ltr">{item.sim_number}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status === 'active' ? 'نشط' : item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "daily-cash":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الفرع</TableHead>
                <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الفتح</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.branch_name}</TableCell>
                  <TableCell className="font-bold">{Number(item.opening_balance).toLocaleString()} ر.س</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'active' ? 'default' : 'outline'}>
                      {item.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString('ar-SA')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "earned-fees":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">قيمة الرسوم</TableHead>
                <TableHead className="text-right">التاريخ والوقت</TableHead>
                <TableHead className="text-right">رقم المعاملة المرتبطة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold text-emerald-600">{Number(item.amount).toLocaleString()} ر.س</TableCell>
                  <TableCell>{new Date(item.date_time).toLocaleString('ar-SA')}</TableCell>
                  <TableCell className="text-xs font-mono">{item.parent_transaction_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "rejected-modified":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العملية</TableHead>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">قبل / بعد</TableHead>
                <TableHead className="text-right">السبب</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.operation_type === 'UPDATE' ? 'تعديل' : 'إنشاء'}
                  </TableCell>
                  <TableCell className="text-xs">{item.user_id}</TableCell>
                  <TableCell className="text-xs">
                    {item.old_value} / {item.new_value}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{item.edit_reason || item.rejection_reason}</TableCell>
                  <TableCell>
                    <Badge variant={item.approval_status === 'rejected' ? 'destructive' : 'secondary'}>
                      {item.approval_status === 'rejected' ? 'مرفوض' : item.approval_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(item.created_at).toLocaleString('ar-SA')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "limit-violations":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المحفظة</TableHead>
                <TableHead className="text-right">الرصيد الحالي</TableHead>
                <TableHead className="text-right">الحد اليومي</TableHead>
                <TableHead className="text-right">الحد الشهري</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const isOverDaily = item.daily_limit && Number(item.balance) >= Number(item.daily_limit);
                const isOverMonthly = item.monthly_limit && Number(item.balance) >= Number(item.monthly_limit);
                
                return (
                  <TableRow key={item.id} className={isOverDaily || isOverMonthly ? "bg-red-50 dark:bg-red-950/20" : ""}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-bold">{Number(item.balance).toLocaleString()} ر.س</TableCell>
                    <TableCell>{item.daily_limit ? `${Number(item.daily_limit).toLocaleString()} ر.س` : '-'}</TableCell>
                    <TableCell>{item.monthly_limit ? `${Number(item.monthly_limit).toLocaleString()} ر.س` : '-'}</TableCell>
                    <TableCell>
                      {isOverDaily || isOverMonthly ? (
                        <div className="flex items-center gap-1 text-red-600 font-bold text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          متجاوز للحد
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          قريب من الحد
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );

      default:
        return <div>نوع تقرير غير معروف</div>;
    }
  };

  return <div className="overflow-x-auto">{renderTable()}</div>;
}
