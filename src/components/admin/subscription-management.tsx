"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Calendar, 
  RefreshCw, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowUpCircle,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface SubscriptionData {
  id: string;
  profile_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    cancellation_date: string | null;
    upgrade_log: any[] | null;
    created_at: string;
  profile: {
    name: string;
    email: string;
  };
  package: {
    name: string;
    type: 'free' | 'paid';
    price: number;
    currency: string;
  };
}

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSubscriptions(data);
    } catch (error: any) {
      toast.error("خطأ في تحميل الاشتراكات: " + error.message);
    } finally {
      setLoading(false);
    }
  };

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'trial': return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> تجربة</Badge>;
        case 'active': return <Badge className="gap-1 bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> نشط</Badge>;
        case 'expired': return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> منتهي</Badge>;
        case 'cancelled': return <Badge variant="outline" className="gap-1"><XCircle className="w-3 h-3" /> ملغى</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
      }
    };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          إدارة الاشتراكات
        </h2>
        <p className="text-sm text-zinc-500">متابعة اشتراكات العملاء، فترات التجربة، وحالات التجديد</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-8 text-center">جاري التحميل...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 border rounded-lg bg-white">
            لا توجد اشتراكات مسجلة حالياً
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800 border-b">
                      <th className="p-4 text-sm font-bold">العميل</th>
                      <th className="p-4 text-sm font-bold">الباقة</th>
                      <th className="p-4 text-sm font-bold">الحالة</th>
                      <th className="p-4 text-sm font-bold">الفترة</th>
                      <th className="p-4 text-sm font-bold">التجديد التلقائي</th>
                      <th className="p-4 text-sm font-bold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subscriptions.map(sub => (
                      <tr key={sub.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold">{sub.profile?.name}</div>
                          <div className="text-xs text-zinc-500">{sub.profile?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium">{sub.package?.name}</div>
                          <div className="text-xs text-zinc-500">
                            {sub.package?.price} {sub.package?.currency}
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(sub.status)}
                        </td>
                          <td className="p-4">
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="text-zinc-400">من:</span>
                                <span>{format(new Date(sub.start_date), 'dd/MM/yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-zinc-400">إلى:</span>
                                <span className={new Date(sub.end_date) < new Date() ? 'text-rose-500 font-bold' : ''}>
                                  {format(new Date(sub.end_date), 'dd/MM/yyyy')}
                                </span>
                              </div>
                              {sub.status === 'cancelled' && sub.cancellation_date && (
                                <div className="text-[10px] text-rose-500 font-medium pt-1">
                                  ألغي في: {format(new Date(sub.cancellation_date), 'dd/MM/yyyy')}
                                </div>
                              )}
                            </div>
                          </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {sub.auto_renew ? (
                              <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100">مفعل</Badge>
                            ) : (
                              <Badge variant="outline" className="text-zinc-400">معطل</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <History className="w-4 h-4" />
                            سجل الترقية
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
