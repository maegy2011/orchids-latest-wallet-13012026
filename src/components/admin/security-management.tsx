"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, UserCheck, Lock, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  is_super_admin: boolean;
  account_status: string;
}

export function SecurityManagement() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "admin");

      if (error) throw error;
      setAdmins(data || []);
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل بيانات المسؤولين");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lock className="w-6 h-6 text-primary" />
          الأمان والصلاحيات
        </h2>
        <p className="text-zinc-500 text-sm mt-1">إدارة صلاحيات الوصول وحماية الـ Super Admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-rose-200 dark:border-rose-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">حماية Super Admin</CardTitle>
            <ShieldCheck className="w-5 h-5 text-rose-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-100 dark:border-rose-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
              <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                حسابات الـ <strong>Super Admin</strong> محمية بترميز خاص في قاعدة البيانات. لا يمكن حذفها أو تعطيلها أو سحب صلاحياتها تحت أي ظرف.
              </p>
            </div>
            
            <div className="divide-y">
              {admins.filter(a => a.is_super_admin).map(admin => (
                <div key={admin.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 text-rose-600 p-2 rounded-full">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{admin.name}</div>
                      <div className="text-[10px] text-zinc-500">{admin.email}</div>
                    </div>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">محمي بالكامل</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">إدارة المسؤولين (Admins)</CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y">
              {admins.filter(a => !a.is_super_admin).map(admin => (
                <div key={admin.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-100 text-zinc-600 p-2 rounded-full">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{admin.name}</div>
                      <div className="text-[10px] text-zinc-500">{admin.email}</div>
                    </div>
                  </div>
                  <Badge variant="outline">مسؤول</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">سياسات الأمان الإلزامية</CardTitle>
          <CardDescription>هذه الإعدادات مفعلة تلقائياً ولا يمكن تغييرها لضمان استقرار النظام.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border">
            <div className="space-y-0.5">
              <Label className="text-base font-bold">تشفير AES-256 للنسخ الاحتياطي</Label>
              <p className="text-sm text-zinc-500">يتم تشفير كافة ملفات البيانات قبل التصدير.</p>
            </div>
            <Switch checked disabled />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border">
            <div className="space-y-0.5">
              <Label className="text-base font-bold">سجل مراجعة غير قابل للتعديل (Immutable Audit Log)</Label>
              <p className="text-sm text-zinc-500">حماية كافة سجلات النشاط من الحذف أو التعديل.</p>
            </div>
            <Switch checked disabled />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border">
            <div className="space-y-0.5">
              <Label className="text-base font-bold">فصل تسجيل دخول الإدارة</Label>
              <p className="text-sm text-zinc-500">استخدام بوابة منفصلة تماماً لدخول المسؤولين.</p>
            </div>
            <Switch checked disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
