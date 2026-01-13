"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  FileJson,
  Calendar,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Backup {
  id: string;
  name: string;
  created_at: string;
  type: 'manual' | 'automatic' | 'scheduled' | 'import';
  metadata: any;
}

interface BackupSettings {
  schedule_enabled?: boolean;
  schedule_time?: string;
  auto_backup_on_critical?: boolean;
}

export function BackupManagement() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [settings, setSettings] = useState<BackupSettings>({
    schedule_enabled: true,
    schedule_time: '03:00',
    auto_backup_on_critical: true
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/admin/backups");
      const data = await res.json();
      setBackups(data);
    } catch (error) {
      toast.error("فشل تحميل النسخ الاحتياطية");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/backups/settings");
      const data = await res.json();
      if (Object.keys(data).length > 0) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchBackups(), fetchSettings()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdateSettings = async (newSettings: BackupSettings) => {
    try {
      const res = await fetch("/api/admin/backups/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      if (!res.ok) throw new Error();
      setSettings(prev => ({ ...prev, ...newSettings }));
      toast.success("تم تحديث الإعدادات");
    } catch (error) {
      toast.error("فشل تحديث الإعدادات");
    }
  };

  const handleCreateBackup = async () => {
    setActionLoading('create');
    try {
      const res = await fetch("/api/admin/backups", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("تم إنشاء النسخة الاحتياطية بنجاح (مشفرة AES-256)");
      fetchBackups();
    } catch (error) {
      toast.error("فشل إنشاء النسخة الاحتياطية");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("هل أنت متأكد؟ سيتم استبدال جميع البيانات الحالية ببيانات النسخة الاحتياطية. هذا الإجراء لا يمكن التراجع عنه.")) return;
    
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/backups/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error();
      toast.success("تم استعادة البيانات بنجاح");
      window.location.reload();
    } catch (error) {
      toast.error("فشل استعادة البيانات");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذه النسخة؟")) return;
    try {
      const res = await fetch(`/api/admin/backups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("تم الحذف");
      setBackups(backups.filter(b => b.id !== id));
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  const handleExport = (id: string) => {
    window.location.href = `/api/admin/backups/export/${id}`;
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setActionLoading('import');
    try {
      const res = await fetch("/api/admin/backups/import", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error();
      toast.success("تم استيراد البيانات بنجاح من الملف المشفر");
      window.location.reload();
    } catch (error) {
      toast.error("فشل استيراد البيانات. تأكد من أن الملف صحيح ومشفر.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            النسخ الاحتياطي والأمان
          </h2>
          <p className="text-sm text-zinc-500">إدارة وحماية بيانات النظام بترميز AES-256</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <label className="cursor-pointer">
              <Upload className="w-4 h-4" />
              استيراد يدوي
              <input type="file" className="hidden" onChange={handleImport} accept=".enc,.bak" />
            </label>
          </Button>
          <Button onClick={handleCreateBackup} disabled={actionLoading === 'create'} className="gap-2">
            <Database className="w-4 h-4" />
            إنشاء نسخة يدوية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              حالة التشفير
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-emerald-700">AES-256 إلزامي</div>
            <p className="text-[10px] text-emerald-600/70">جميع النسخ مشفرة بمفتاح أمان النظام</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              آخر نسخة تلقائية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">
              {backups.find(b => b.type === 'automatic')?.created_at 
                ? format(new Date(backups.find(b => b.type === 'automatic')!.created_at), 'dd/MM HH:mm')
                : 'لا يوجد'}
            </div>
            <p className="text-[10px] text-zinc-500">يتم الحفظ عند (حذف/أرشفة/تغيير باقة)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              الجدولة التلقائية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">{settings.schedule_enabled ? `يومياً الساعة ${settings.schedule_time}` : 'معطلة'}</div>
            <p className="text-[10px] text-zinc-500">تحكم في مواعيد الحفظ التلقائي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            إعدادات النسخ الاحتياطي
          </CardTitle>
          <CardDescription>تكوين الجدولة والأحداث الحرجة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-bold">النسخ الاحتياطي التلقائي عند الأحداث الحرجة</div>
              <div className="text-xs text-zinc-500">حذف، أرشفة، أو تغيير باقة عميل</div>
            </div>
            <Button 
              variant={settings.auto_backup_on_critical ? "default" : "outline"} 
              size="sm"
              onClick={() => handleUpdateSettings({ auto_backup_on_critical: !settings.auto_backup_on_critical })}
            >
              {settings.auto_backup_on_critical ? "مفعل" : "معطل"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-bold">الجدولة اليومية</div>
              <div className="text-xs text-zinc-500">إنشاء نسخة احتياطية تلقائية كل يوم</div>
              {settings.schedule_enabled && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs">وقت التنفيذ:</span>
                  <input 
                    type="time" 
                    value={settings.schedule_time} 
                    onChange={(e) => handleUpdateSettings({ schedule_time: e.target.value })}
                    className="text-xs border rounded p-1"
                  />
                </div>
              )}
            </div>
            <Button 
              variant={settings.schedule_enabled ? "default" : "outline"} 
              size="sm"
              onClick={() => handleUpdateSettings({ schedule_enabled: !settings.schedule_enabled })}
            >
              {settings.schedule_enabled ? "مفعل" : "معطل"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>سجل النسخ الاحتياطية</CardTitle>
          <CardDescription>النسخ المحفوظة على النظام (سحابية ومشفرة)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">جاري التحميل...</div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">لا توجد نسخ حالياً</div>
          ) : (
            <div className="divide-y">
              {backups.map((backup) => (
                <div key={backup.id} className="p-4 flex justify-between items-center hover:bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      backup.type === 'automatic' ? 'bg-amber-100 text-amber-600' : 
                      backup.type === 'manual' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {backup.name}
                        {backup.type === 'automatic' && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">تلقائي</span>}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2">
                        <span>{format(new Date(backup.created_at), 'dd MMMM yyyy HH:mm', { locale: ar })}</span>
                        <span>•</span>
                        <span>{backup.metadata?.table_counts ? `${Object.values(backup.metadata.table_counts).reduce((a: any, b: any) => a + b, 0)} سجل` : 'بيانات مشفرة'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" title="تحميل" onClick={() => handleExport(backup.id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" 
                      title="استعادة" 
                      onClick={() => handleRestore(backup.id)}
                      disabled={actionLoading === backup.id}
                    >
                      <RefreshCw className={`w-4 h-4 ${actionLoading === backup.id ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-rose-600" title="حذف" onClick={() => handleDelete(backup.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-bold">تنبيه أمني هام:</p>
          <p>استعادة نسخة احتياطية سيؤدي إلى مسح البيانات الحالية تماماً. لا يمكن استعادة البيانات بدون صلاحيات أدمن معتمدة ومفاتيح التشفير النشطة.</p>
        </div>
      </div>
    </div>
  );
}
