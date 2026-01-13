"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Percent,
  Calendar,
  DollarSign,
  Wallet,
  Building2,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PackageData {
  id: string;
  name: string;
  type: 'free' | 'paid';
  price: number;
  duration_days: number;
  includes_tax: boolean;
  tax_type: string;
  tax_rate: number;
  renewal_policy: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  trial_period_days: number;
  currency: string;
  status: 'active' | 'suspended';
  max_wallets: number;
  max_branches: number;
  features: string[];
}

export function PackageManagement() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [newFeature, setNewFeature] = useState("");

  const [formData, setFormData] = useState<Partial<PackageData>>({
    name: "",
    type: "paid",
    price: 0,
    duration_days: 30,
    includes_tax: true,
    tax_type: "VAT",
    tax_rate: 14,
    renewal_policy: "monthly",
    trial_period_days: 7,
    currency: "EGP",
    status: "active",
    max_wallets: -1,
    max_branches: -1,
    features: []
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/admin/packages?status=active");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPackages(data);
    } catch (error: any) {
      toast.error("خطأ في تحميل الباقات: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPackage ? `/api/admin/packages/${editingPackage.id}` : "/api/admin/packages";
      const method = editingPackage ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
        toast.success(editingPackage ? "تم تحديث الباقة بنجاح" : "تم إنشاء الباقة بنجاح");
        setIsDialogOpen(false);
        setEditingPackage(null);
        setFormData({
          name: "", type: "paid", price: 0, duration_days: 30,
          includes_tax: true, tax_type: "VAT", tax_rate: 14,
          renewal_policy: "monthly", trial_period_days: 7,
          currency: "EGP", status: "active",
          max_wallets: -1, max_branches: -1, features: []
        });
        fetchPackages();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setFormData(pkg);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("تم حذف الباقة");
      fetchPackages();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            إدارة الباقات
          </h2>
          <p className="text-sm text-zinc-500">تعريف باقات الاشتراك، الأسعار، وقواعد التجديد</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPackage(null);
            setFormData({
              name: "", type: "paid", price: 0, duration_days: 30,
              includes_tax: true, tax_type: "VAT", tax_rate: 14,
              renewal_policy: "monthly", trial_period_days: 7,
              currency: "EGP", status: "active",
              max_wallets: -1, max_branches: -1, features: []
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "تعديل باقة" : "إضافة باقة جديدة"}</DialogTitle>
              <DialogDescription>أدخل تفاصيل الباقة وقواعد التسعير والاشتراك.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الباقة</Label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: الباقة الاحترافية"
                  />
                </div>
                <div className="space-y-2">
                  <Label>نوع الباقة</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={v => setFormData({...formData, type: v as 'free' | 'paid', price: v === 'free' ? 0 : formData.price})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">مجانية</SelectItem>
                      <SelectItem value="paid">مدفوعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>السعر</Label>
                  <Input 
                    type="number"
                    disabled={formData.type === 'free'}
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المدة (بالأيام)</Label>
                  <Input 
                    type="number"
                    value={formData.duration_days}
                    onChange={e => setFormData({...formData, duration_days: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>سياسة التجديد</Label>
                  <Select 
                    value={formData.renewal_policy}
                    onValueChange={v => setFormData({...formData, renewal_policy: v as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">شهري</SelectItem>
                      <SelectItem value="quarterly">ربع سنوي</SelectItem>
                      <SelectItem value="semi-annually">نصف سنوي</SelectItem>
                      <SelectItem value="annually">سنوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  <div className="space-y-2">
                    <Label>فترة التجربة (أيام)</Label>
                    <Input 
                      type="number"
                      value={formData.trial_period_days}
                      onChange={e => setFormData({...formData, trial_period_days: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>أقصى عدد محافظ (-1 غير محدود)</Label>
                    <Input 
                      type="number"
                      value={formData.max_wallets}
                      onChange={e => setFormData({...formData, max_wallets: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>أقصى عدد فروع (-1 غير محدود)</Label>
                    <Input 
                      type="number"
                      value={formData.max_branches}
                      onChange={e => setFormData({...formData, max_branches: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <Label>المميزات</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={newFeature}
                      onChange={e => setNewFeature(e.target.value)}
                      placeholder="أدخل ميزة جديدة..."
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newFeature.trim()) {
                            setFormData({
                              ...formData,
                              features: [...(formData.features || []), newFeature.trim()]
                            });
                            setNewFeature("");
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        if (newFeature.trim()) {
                          setFormData({
                            ...formData,
                            features: [...(formData.features || []), newFeature.trim()]
                          });
                          setNewFeature("");
                        }
                      }}
                    >
                      إضافة
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features?.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 py-1 px-2">
                        {feature}
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              features: formData.features?.filter((_, i) => i !== idx)
                            });
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end border-t pt-4">
                <div className="flex items-center space-x-reverse space-x-2">
                  <Switch 
                    checked={formData.includes_tax}
                    onCheckedChange={v => setFormData({...formData, includes_tax: v})}
                  />
                  <Label>هل تشمل الضريبة؟</Label>
                </div>
                {formData.includes_tax && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">نوع الضريبة</Label>
                      <Input 
                        value={formData.tax_type}
                        onChange={e => setFormData({...formData, tax_type: e.target.value})}
                        placeholder="VAT"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">النسبة (%)</Label>
                      <Input 
                        type="number"
                        value={formData.tax_rate}
                        onChange={e => setFormData({...formData, tax_rate: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                )}
              </div>

                <div className="space-y-2 border-t pt-4">
                  <Label>حالة الباقة</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={v => setFormData({...formData, status: v as 'active' | 'suspended'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشطة</SelectItem>
                      <SelectItem value="suspended">موقوفة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full">
                  {editingPackage ? "تحديث الباقة" : "حفظ الباقة"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center">جاري التحميل...</div>
        ) : packages.length === 0 ? (
          <div className="col-span-full p-8 text-center text-zinc-500 border rounded-lg bg-white">
            لا توجد باقات معرفة حالياً
          </div>
        ) : (
            packages.map(pkg => (
              <Card key={pkg.id} className={`${pkg.status === 'suspended' ? 'opacity-60 bg-zinc-50' : 'bg-white'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant={pkg.type === 'free' ? 'secondary' : 'default'}>
                          {pkg.type === 'free' ? 'مجانية' : 'مدفوعة'}
                        </Badge>
                        <div className="text-[10px] text-zinc-400 mt-1 font-mono">{pkg.id}</div>
                      </div>
                      <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(pkg)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(pkg.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="mt-2">{pkg.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    كل {pkg.duration_days} يوم • تجربة {pkg.trial_period_days} أيام
                  </CardDescription>
                </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="text-3xl font-bold flex items-baseline gap-1">
                        {pkg.price}
                        <span className="text-sm font-normal text-zinc-500">{pkg.currency}</span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        كل {pkg.duration_days} يوم
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Wallet className="w-3 h-3" />
                          المحافظ
                        </div>
                        <div className="font-bold">{pkg.max_wallets === -1 ? 'بلا حدود' : pkg.max_wallets}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Building2 className="w-3 h-3" />
                          الفروع
                        </div>
                        <div className="font-bold">{pkg.max_branches === -1 ? 'بلا حدود' : pkg.max_branches}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold flex items-center gap-2">
                        <ListChecks className="w-3 h-3 text-primary" />
                        المميزات:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pkg.features?.map((f, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs text-zinc-600 border-t pt-4">
                      <div className="flex justify-between">
                        <span>التجديد:</span>
                        <span className="font-medium">
                          {pkg.renewal_policy === 'monthly' ? 'شهري' : 
                           pkg.renewal_policy === 'quarterly' ? 'ربع سنوي' :
                           pkg.renewal_policy === 'semi-annually' ? 'نصف سنوي' : 'سنوي'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>الضريبة:</span>
                        <span>{pkg.includes_tax ? `${pkg.tax_rate}% (${pkg.tax_type})` : 'لا تشمل'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span>الحالة:</span>
                        <Badge className={`text-[10px] h-5 ${pkg.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'}`}>
                          {pkg.status === 'active' ? 'نشطة' : 'موقوفة'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
