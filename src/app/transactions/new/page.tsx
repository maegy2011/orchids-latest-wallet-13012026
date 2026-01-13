"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, Calendar, MapPin, User, Hash, Info } from "lucide-react";
import { createTransactionAction, getInitialTransactionDataAction, getLatestUsedWalletAction } from "@/app/transactions/actions";
import { TransactionType } from "@/lib/wallet-selector";
import { SmartWalletSelector } from "@/components/SmartWalletSelector";

export default function NewTransactionPage() {
  const router = useRouter();
  const [transactionId] = useState(crypto.randomUUID());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allWallets, setAllWallets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    walletId: "",
    employeeId: "e2222222-2222-2222-2222-222222222222", // Default/Seed employee
    branchId: "",
    branchName: "",
    type: "Cash In" as TransactionType,
    status: "Approved",
    amount: "0",
    feePercentage: "0",
    feeAmount: "0",
    toWalletId: "",
    source: "",
    notes: ""
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      const data = await getInitialTransactionDataAction();
      setAllWallets(data.wallets);
      if (data.branch) {
        setFormData(prev => ({ 
          ...prev, 
          branchId: data.branch.id, 
          branchName: data.branch.name 
        }));
        
        const lastWalletId = await getLatestUsedWalletAction(data.branch.id);
        if (lastWalletId) {
          setFormData(prev => ({ ...prev, walletId: lastWalletId }));
        } else if (data.wallets.length > 0) {
          setFormData(prev => ({ ...prev, walletId: data.wallets[0].id }));
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const calculateFee = (amount: string, percentage: string) => {
    const amt = parseFloat(amount) || 0;
    const pct = parseFloat(percentage) || 0;
    const fee = (amt * pct) / 100;
    return fee.toFixed(2);
  };

  const handleAmountChange = (val: string) => {
    const fee = calculateFee(val, formData.feePercentage);
    setFormData({ ...formData, amount: val, feeAmount: fee });
  };

  const handleFeePercentageChange = (val: string) => {
    const fee = calculateFee(formData.amount, val);
    setFormData({ ...formData, feePercentage: val, feeAmount: fee });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.walletId) {
      alert("الرجاء اختيار المحفظة");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createTransactionAction({
        id: transactionId,
        walletId: formData.walletId,
        employeeId: formData.employeeId,
        branchId: formData.branchId,
        type: formData.type,
        status: formData.status,
        amount: parseFloat(formData.amount),
        feePercentage: parseFloat(formData.feePercentage),
        feeAmount: parseFloat(formData.feeAmount),
        toWalletId: formData.toWalletId || undefined,
        source: formData.source || undefined,
        notes: formData.notes
      });
      alert("تمت إضافة المعاملة بنجاح!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إضافة المعاملة");
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
          <Link href="/dashboard">
            <ArrowRight className="h-6 w-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إضافة معاملة جديدة</h1>
          <p className="text-zinc-500 dark:text-zinc-400">نظام إدارة المعاملات المالية المطور.</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Automatic Information Section */}
            <Card className="bg-white dark:bg-zinc-900 border-indigo-100 dark:border-indigo-900/30">
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">رقم المعاملة:</span>
                  </div>
                  <div className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded truncate">{transactionId}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">التاريخ والوقت الحالي:</span>
                  </div>
                  <div className="font-semibold">{currentTime.toLocaleString("ar-SA")}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">اسم ورقم الفرع:</span>
                  </div>
                  <div className="font-semibold">{formData.branchName} ({formData.branchId.split('-')[0]})</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <User className="h-4 w-4" />
                    <span className="font-medium">رقم الموظف المسؤول:</span>
                  </div>
                  <div className="font-semibold">{formData.employeeId.split('-')[0]}...</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Entry Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>بيانات المعاملة</CardTitle>
                    <CardDescription>أدخل تفاصيل العملية المالية بدقة لضمان صحة القيود.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">نوع المعاملة</Label>
                        <Select 
                          onValueChange={(v: TransactionType) => setFormData({...formData, type: v})}
                          defaultValue={formData.type}
                        >
                          <SelectTrigger id="type" className="h-11">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash Out">سحب (Cash Out)</SelectItem>
                            <SelectItem value="Cash In">إيداع (Cash In)</SelectItem>
                            <SelectItem value="Incoming Transfer">استلام تحويل خارجي (Incoming)</SelectItem>
                            <SelectItem value="Internal Transfer">تحويل داخلي بين المحافظ</SelectItem>
                            <SelectItem value="ATM/Bank Deposit">إيداع نقدية في محفظة (ATM/بنك)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="status">حالة المعاملة</Label>
                        <Select 
                          onValueChange={(v) => setFormData({...formData, status: v})}
                          defaultValue={formData.status}
                        >
                          <SelectTrigger id="status" className="h-11">
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Approved">معتمدة (تأثير مالي فوري)</SelectItem>
                            <SelectItem value="Pending">بانتظار الموافقة</SelectItem>
                            <SelectItem value="Draft">مسودة</SelectItem>
                            <SelectItem value="Rejected">مرفوضة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="grid gap-2 md:col-span-1">
                        <Label htmlFor="amount">قيمة المعاملة</Label>
                        <div className="relative">
                          <Input 
                            id="amount" 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="h-11 text-left pl-10 font-bold" 
                            required
                            value={formData.amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">ر.س</span>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="feePercentage">نسبة الرسوم (%)</Label>
                        <Input 
                          id="feePercentage" 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0" 
                          className="h-11" 
                          value={formData.feePercentage}
                          onChange={(e) => handleFeePercentageChange(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="feeAmount">قيمة الرسوم المكتسبة</Label>
                        <div className="relative">
                          <Input 
                            id="feeAmount" 
                            type="number" 
                            step="0.01" 
                            className="h-11 bg-zinc-50 dark:bg-zinc-800/50 font-semibold" 
                            readOnly
                            value={formData.feeAmount}
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">ر.س</span>
                        </div>
                      </div>
                    </div>

                    {formData.type === "Incoming Transfer" && (
                      <div className="grid gap-2">
                        <Label htmlFor="source">المصدر (اختياري)</Label>
                        <Input 
                          id="source" 
                          placeholder="مثلاً: شركة فلان، أو رقم محفظة خارجية..." 
                          className="h-11"
                          value={formData.source}
                          onChange={(e) => setFormData({...formData, source: e.target.value})}
                        />
                      </div>
                    )}

                    {formData.type === "Internal Transfer" && (
                      <div className="grid gap-2">
                        <Label htmlFor="toWalletId">المحفظة المستقبلة</Label>
                        <Select 
                          onValueChange={(v) => setFormData({...formData, toWalletId: v})}
                          value={formData.toWalletId}
                        >
                          <SelectTrigger id="toWalletId" className="h-11">
                            <SelectValue placeholder="اختر المحفظة المستقبلة" />
                          </SelectTrigger>
                          <SelectContent>
                            {allWallets.filter(w => w.id !== formData.walletId).map(w => (
                              <SelectItem key={w.id} value={w.id}>{w.name} ({w.provider})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="أضف أي تفاصيل إضافية هنا..." 
                        className="min-h-[80px]"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Impact Preview */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex items-start gap-3">
                  <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-indigo-900 dark:text-indigo-300">الأثر المالي المتوقع (عند الاعتماد):</p>
                    <div className="text-indigo-700 dark:text-indigo-400 font-mono text-xs">
                      {formData.type === "Cash Out" && `رصيد المحفظة ↑ | رصيد النقدية ↓ | إيراد الرسوم ↑`}
                      {formData.type === "Cash In" && `رصيد النقدية ↑ | رصيد المحفظة ↓ | إيراد الرسوم ↑`}
                      {formData.type === "Incoming Transfer" && `رصيد المحفظة ↑`}
                      {formData.type === "Internal Transfer" && `رصيد محفظة المرسل ↓ | رصيد محفظة المستقبل ↑ ${parseFloat(formData.feeAmount) > 0 ? '| مصروف رسوم ↑' : ''}`}
                      {formData.type === "ATM/Bank Deposit" && `رصيد النقدية ↓ | رصيد المحفظة ↑ ${parseFloat(formData.feeAmount) > 0 ? '| مصروف رسوم ↑' : ''}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar / Wallet Selection */}
              <div className="space-y-6">
                <Card className="sticky top-24">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">اختيار المحفظة</CardTitle>
                    <CardDescription>المحفظة المستخدمة كطرف في العملية.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SmartWalletSelector 
                      type={formData.type}
                      amount={parseFloat(formData.amount) || 0}
                      branchId={formData.branchId}
                      selectedWalletId={formData.walletId}
                      onSelect={(id: string) => setFormData({...formData, walletId: id})}
                    />

                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <Button 
                        type="submit" 
                        className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : "إتمام العملية"}
                      </Button>
                      <p className="text-[10px] text-center text-zinc-400 mt-3 italic">
                        * سيتم تحديث الأرصدة فوراً عند اختيار الحالة "معتمدة".
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
