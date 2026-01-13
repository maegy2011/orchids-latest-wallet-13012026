"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2, Wallet, Hash, Shield, User, MapPin, Calendar, Percent, AlertTriangle } from "lucide-react";
import { createWalletAction, getEmployeesAction, getBranchesAction } from "@/app/wallets/actions";

const WALLET_PROVIDERS = [
  "فودافون كاش",
  "أورانج كاش",
  "اتصالات كاش",
  "وي باي",
  "فوري",
  "أمان",
  "كاشي",
  "أخرى"
];

const WALLET_STATUSES = [
  { value: "active", label: "نشطة" },
  { value: "frozen", label: "مجمدة" },
  { value: "archived", label: "مؤرشفة" },
  { value: "receive_only", label: "استقبال فقط" },
  { value: "send_only", label: "إرسال فقط" }
];

export default function NewWalletPage() {
  const router = useRouter();
  const [walletId] = useState(crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    status: "active",
    simNumber: "",
    ownerName: "",
    nationalId: "",
    openingDate: new Date().toISOString().split('T')[0],
    openingBalance: "0",
    minTransactionAmount: "0",
    maxTransactionAmount: "50000",
    commissionPercentage: "0",
    minCommission: "0",
    maxCommission: "100",
    dailyLimit: "10000",
    monthlyLimit: "300000",
    receiveOnlyThreshold: "0",
    sendOnlyThreshold: "0",
    responsibleEmployeeId: "",
    branchId: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [empData, branchData] = await Promise.all([
          getEmployeesAction(),
          getBranchesAction()
        ]);
        setEmployees(empData);
        setBranches(branchData);
        if (branchData.length > 0) {
          setFormData(prev => ({ ...prev, branchId: branchData[0].id }));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.provider || !formData.branchId) {
      alert("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      await createWalletAction({
        id: walletId,
        name: formData.name,
        provider: formData.provider,
        status: formData.status,
        simNumber: formData.simNumber,
        ownerName: formData.ownerName,
        nationalId: formData.nationalId,
        openingDate: formData.openingDate,
        openingBalance: parseFloat(formData.openingBalance),
        balance: parseFloat(formData.openingBalance),
        minTransactionAmount: parseFloat(formData.minTransactionAmount),
        maxTransactionAmount: parseFloat(formData.maxTransactionAmount),
        commissionPercentage: parseFloat(formData.commissionPercentage),
        minCommission: parseFloat(formData.minCommission),
        maxCommission: parseFloat(formData.maxCommission),
        dailyLimit: parseFloat(formData.dailyLimit),
        monthlyLimit: parseFloat(formData.monthlyLimit),
        receiveOnlyThreshold: parseFloat(formData.receiveOnlyThreshold),
        sendOnlyThreshold: parseFloat(formData.sendOnlyThreshold),
        responsibleEmployeeId: formData.responsibleEmployeeId || null,
        branchId: formData.branchId,
        isActiveSend: formData.status !== "receive_only",
        isActiveReceive: formData.status !== "send_only"
      });
      alert("تم فتح المحفظة بنجاح!");
      router.push("/wallets");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء فتح المحفظة");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans p-4 md:p-8" dir="rtl">
      <header className="mb-8 flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/wallets">
            <ArrowRight className="h-6 w-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">فتح محفظة جديدة</h1>
          <p className="text-zinc-500 dark:text-zinc-400">أدخل جميع بيانات المحفظة الجديدة بدقة.</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Wallet ID Card */}
            <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                  <Hash className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">رقم المحفظة (UUID)</p>
                  <p className="font-mono text-sm font-bold">{walletId}</p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-indigo-600" />
                  البيانات الأساسية
                </CardTitle>
                <CardDescription>معلومات المحفظة الرئيسية</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">اسم المحفظة *</Label>
                  <Input 
                    id="name" 
                    placeholder="مثال: محفظة فودافون - الفرع الرئيسي"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="provider">الشركة المصدرة للمحفظة *</Label>
                  <Select 
                    onValueChange={(v) => setFormData({...formData, provider: v})}
                    value={formData.provider}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="اختر الشركة" />
                    </SelectTrigger>
                    <SelectContent>
                      {WALLET_PROVIDERS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">حالة المحفظة</Label>
                  <Select 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                    value={formData.status}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WALLET_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch">الفرع *</Label>
                  <Select 
                    onValueChange={(v) => setFormData({...formData, branchId: v})}
                    value={formData.branchId}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  بيانات المحفظة
                </CardTitle>
                <CardDescription>معلومات صاحب المحفظة والشريحة</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="simNumber">رقم الشريحة</Label>
                  <Input 
                    id="simNumber" 
                    placeholder="01xxxxxxxxx"
                    value={formData.simNumber}
                    onChange={(e) => setFormData({...formData, simNumber: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ownerName">الاسم</Label>
                  <Input 
                    id="ownerName" 
                    placeholder="اسم صاحب المحفظة"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nationalId">الرقم القومي</Label>
                  <Input 
                    id="nationalId" 
                    placeholder="14 رقم"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openingDate">تاريخ فتح المحفظة</Label>
                  <Input 
                    id="openingDate" 
                    type="date"
                    value={formData.openingDate}
                    onChange={(e) => setFormData({...formData, openingDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openingBalance">الرصيد الافتتاحي</Label>
                  <div className="relative">
                    <Input 
                      id="openingBalance" 
                      type="number"
                      step="0.01"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="responsibleEmployee">الموظف المسئول</Label>
                  <Select 
                    onValueChange={(v) => setFormData({...formData, responsibleEmployeeId: v})}
                    value={formData.responsibleEmployeeId}
                  >
                    <SelectTrigger id="responsibleEmployee">
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون موظف محدد</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  حدود المعاملات
                </CardTitle>
                <CardDescription>الحد الأدنى والأقصى للمعاملات والرصيد</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="minTransactionAmount">الحد الأدنى لقيمة المعاملة</Label>
                  <div className="relative">
                    <Input 
                      id="minTransactionAmount" 
                      type="number"
                      step="0.01"
                      value={formData.minTransactionAmount}
                      onChange={(e) => setFormData({...formData, minTransactionAmount: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxTransactionAmount">الحد الأقصى لقيمة المعاملة</Label>
                  <div className="relative">
                    <Input 
                      id="maxTransactionAmount" 
                      type="number"
                      step="0.01"
                      value={formData.maxTransactionAmount}
                      onChange={(e) => setFormData({...formData, maxTransactionAmount: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dailyLimit">الحد الأقصى لمجموع المعاملات يومياً</Label>
                  <div className="relative">
                    <Input 
                      id="dailyLimit" 
                      type="number"
                      step="0.01"
                      value={formData.dailyLimit}
                      onChange={(e) => setFormData({...formData, dailyLimit: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlyLimit">الحد الأقصى لمجموع المعاملات شهرياً</Label>
                  <div className="relative">
                    <Input 
                      id="monthlyLimit" 
                      type="number"
                      step="0.01"
                      value={formData.monthlyLimit}
                      onChange={(e) => setFormData({...formData, monthlyLimit: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-indigo-600" />
                  إعدادات العمولة
                </CardTitle>
                <CardDescription>نسبة العمولة والحدود</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="commissionPercentage">النسبة المئوية للعمولة</Label>
                  <div className="relative">
                    <Input 
                      id="commissionPercentage" 
                      type="number"
                      step="0.01"
                      value={formData.commissionPercentage}
                      onChange={(e) => setFormData({...formData, commissionPercentage: e.target.value})}
                      className="pl-10"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">%</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minCommission">الحد الأدنى للعمولة</Label>
                  <div className="relative">
                    <Input 
                      id="minCommission" 
                      type="number"
                      step="0.01"
                      value={formData.minCommission}
                      onChange={(e) => setFormData({...formData, minCommission: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxCommission">الحد الأقصى للعمولة</Label>
                  <div className="relative">
                    <Input 
                      id="maxCommission" 
                      type="number"
                      step="0.01"
                      value={formData.maxCommission}
                      onChange={(e) => setFormData({...formData, maxCommission: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto Status Thresholds */}
            <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/20 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  حدود التحويل التلقائي للحالة
                </CardTitle>
                <CardDescription>عند وصول الرصيد لهذه القيم، يتم تغيير حالة المحفظة تلقائياً</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="receiveOnlyThreshold">الحد الأقصى للرصيد للتحويل إلى استقبال فقط</Label>
                  <div className="relative">
                    <Input 
                      id="receiveOnlyThreshold" 
                      type="number"
                      step="0.01"
                      value={formData.receiveOnlyThreshold}
                      onChange={(e) => setFormData({...formData, receiveOnlyThreshold: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                  <p className="text-xs text-zinc-500">إذا كان 0، لن يتم التحويل التلقائي</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sendOnlyThreshold">الحد الأدنى للرصيد للتحويل إلى ارسال فقط</Label>
                  <div className="relative">
                    <Input 
                      id="sendOnlyThreshold" 
                      type="number"
                      step="0.01"
                      value={formData.sendOnlyThreshold}
                      onChange={(e) => setFormData({...formData, sendOnlyThreshold: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">ج.م</span>
                  </div>
                  <p className="text-xs text-zinc-500">إذا كان 0، لن يتم التحويل التلقائي</p>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري فتح المحفظة...
                </>
              ) : "فتح المحفظة الجديدة"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
