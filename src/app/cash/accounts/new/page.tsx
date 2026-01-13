"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2, Wallet, Calendar, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCashAccountAction, getInitialCashDataAction } from "@/app/cash/actions";

export default function NewCashAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    status: "active",
    openingBalance: "0",
    branchId: "",
    branchName: "",
    employeeId: "e2222222-2222-2222-2222-222222222222", // Default/Seed employee
  });

  useEffect(() => {
    async function loadData() {
      const data = await getInitialCashDataAction();
      if (data.branch) {
        setFormData(prev => ({ 
          ...prev, 
          branchId: data.branch.id, 
          branchName: data.branch.name 
        }));
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createCashAccountAction({
        status: formData.status,
        openingBalance: parseFloat(formData.openingBalance),
        branchName: formData.branchName,
        branchId: formData.branchId,
        employeeId: formData.employeeId,
      });
      alert("تم فتح حساب النقدية بنجاح!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء فتح الحساب");
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
          <h1 className="text-3xl font-bold tracking-tight">فتح حساب نقدية جديد</h1>
          <p className="text-zinc-500 dark:text-zinc-400">إدارة حسابات النقدية للفروع.</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>بيانات الحساب الجديد</CardTitle>
              <CardDescription>أدخل البيانات الأساسية لفتح حساب نقدية جديد للفرع.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">حالة الحساب</Label>
                  <Select 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                    defaultValue={formData.status}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="frozen">مجمد</SelectItem>
                      <SelectItem value="archived">مؤرشف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openingBalance">الرصيد الافتتاحي</Label>
                  <div className="relative">
                    <Input 
                      id="openingBalance" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="text-left pl-10"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">ر.س</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-sm">
                <div className="flex items-center gap-2 text-zinc-500">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">الفرع:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formData.branchName}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <User className="h-4 w-4" />
                  <span className="font-medium">الموظف:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formData.employeeId.split('-')[0]}...</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">تاريخ الفتح:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{new Date().toLocaleDateString("ar-SA")}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : "فتح الحساب"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
