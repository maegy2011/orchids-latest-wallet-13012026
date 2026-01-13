"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, Calendar, MapPin, User, Wallet, Hash, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCashTransactionAction, getInitialCashDataAction, CashTransactionType } from "@/app/cash/actions";
export default function NewCashTransactionPage() {
  const router = useRouter();
  const [transactionId] = useState(crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<{
    branch: any;
    wallets: any[];
    cashAccounts: any[];
  }>({
    branch: null,
    wallets: [],
    cashAccounts: []
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "Others" as CashTransactionType,
    fundingSource: "Cash" as "Wallet" | "Cash",
    walletId: "",
    cashAccountId: "",
    amount: "0",
    notes: ""
  });

  useEffect(() => {
    async function loadData() {
      const initialData = await getInitialCashDataAction();
      setData(initialData);
      if (initialData.cashAccounts.length > 0) {
        setFormData(prev => ({ ...prev, cashAccountId: initialData.cashAccounts[0].id }));
      }
      if (initialData.wallets.length > 0) {
        setFormData(prev => ({ ...prev, walletId: initialData.wallets[0].id }));
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cashAccountId) {
      alert("الرجاء اختيار حساب النقدية");
      return;
    }
    if (formData.fundingSource === "Wallet" && !formData.walletId) {
      alert("الرجاء اختيار المحفظة");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCashTransactionAction({
        walletId: formData.fundingSource === "Wallet" ? formData.walletId : undefined,
        cashAccountId: formData.cashAccountId,
        employeeId: "e2222222-2222-2222-2222-222222222222",
        branchName: data.branch?.name || "",
        branchId: data.branch?.id || "",
        type: formData.type,
        fundingSource: formData.fundingSource,
        amount: parseFloat(formData.amount),
        notes: formData.notes
      });
      alert("تم تسجيل المعاملة بنجاح!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تسجيل المعاملة");
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
          <h1 className="text-3xl font-bold tracking-tight">تسجيل معاملة نقدية</h1>
          <p className="text-zinc-500 dark:text-zinc-400">نموذج تسجيل المصروفات والتحويلات النقدية.</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Hidden/Automatic Data Section */}
            <Card className="bg-zinc-100/50 dark:bg-zinc-900/50 border-dashed">
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[10px] text-zinc-500 uppercase tracking-widest">
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span>ID: {transactionId.split('-')[0]}...</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>Branch: {data.branch?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Employee ID: e2222222...</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Date: {formData.date}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>تفاصيل المعاملة</CardTitle>
                    <CardDescription>بيانات مالية لا تظهر مباشرة للموظف العادي.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">نوع المعاملة</Label>
                        <Select 
                          onValueChange={(v: CashTransactionType) => setFormData({...formData, type: v})}
                          defaultValue={formData.type}
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Transfer Between Accounts">تحويل بين الحسابات النقدية</SelectItem>
                            <SelectItem value="Transfer to Wallet">تحويل لمحفظة</SelectItem>
                            <SelectItem value="Purchases">مشتريات بضاعة</SelectItem>
                            <SelectItem value="Bills">دفع فواتير</SelectItem>
                            <SelectItem value="Rent">إيجار</SelectItem>
                            <SelectItem value="Petty Cash">مصروفات نثرية</SelectItem>
                            <SelectItem value="Hospitality">ضيافة</SelectItem>
                            <SelectItem value="Others">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fundingSource">مصدر التمويل</Label>
                        <Select 
                          onValueChange={(v: "Wallet" | "Cash") => setFormData({...formData, fundingSource: v})}
                          defaultValue={formData.fundingSource}
                        >
                          <SelectTrigger id="fundingSource">
                            <SelectValue placeholder="اختر المصدر" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">النقدية</SelectItem>
                            <SelectItem value="Wallet">محفظة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cashAccount">حساب النقدية</Label>
                        <Select 
                          onValueChange={(v) => setFormData({...formData, cashAccountId: v})}
                          value={formData.cashAccountId}
                        >
                          <SelectTrigger id="cashAccount">
                            <SelectValue placeholder="اختر الحساب" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.cashAccounts.map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>حساب {acc.id.split('-')[0]} (الرصيد: {acc.opening_balance})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.fundingSource === "Wallet" && (
                        <div className="space-y-2">
                          <Label htmlFor="wallet">المحفظة</Label>
                          <Select 
                            onValueChange={(v) => setFormData({...formData, walletId: v})}
                            value={formData.walletId}
                          >
                            <SelectTrigger id="wallet">
                              <SelectValue placeholder="اختر المحفظة" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.wallets.map(w => (
                                <SelectItem key={w.id} value={w.id}>{w.name} ({w.provider})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="amount">قيمة المعاملة</Label>
                      <div className="relative">
                        <Input 
                          id="amount" 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          className="h-12 text-left pl-10 font-bold text-lg" 
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          required
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">ر.س</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="أضف أي تفاصيل إضافية هنا..." 
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-indigo-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      تأكيد المعاملة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-indigo-100 text-xs">القيمة الإجمالية</p>
                      <p className="text-2xl font-bold">{parseFloat(formData.amount).toLocaleString()} ر.س</p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold h-12"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : "حفظ المعاملة"}
                    </Button>
                  </CardContent>
                </Card>

                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">الأثر المالي:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">رصيد النقدية:</span>
                      <span className="text-red-500 font-bold">-{formData.amount} ر.س</span>
                    </div>
                    {formData.fundingSource === "Wallet" && (
                      <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2">
                        <span className="text-zinc-500">رصيد المحفظة:</span>
                        <span className="text-red-500 font-bold">-{formData.amount} ر.س</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
