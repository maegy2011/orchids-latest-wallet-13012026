"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export function AdminAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("لم يتم العثور على المستخدم");

      // Check if user is an admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_super_admin")
        .eq("id", user.id)
        .single();

      if (profileError || (profile?.role !== 'admin' && !profile?.is_super_admin)) {
        // Not an admin, sign out immediately
        await supabase.auth.signOut();
        throw new Error("عذراً، هذا الحساب لا يملك صلاحيات وصول لوحة الإدارة");
      }

      // Log admin login
      await supabase.from("activity_logs").insert([{
        user_id: user.id,
        action: 'admin_login',
        metadata: {
          email: user.email,
          role: profile.role,
          is_super_admin: profile.is_super_admin
        }
      }]);

      toast.success("تم تسجيل دخول الأدمن بنجاح!");
      router.push("/admin");
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || "حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-red-200 dark:border-red-900 shadow-xl">
      <CardHeader className="text-right space-y-2">
        <div className="flex justify-end">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
            <ShieldCheck className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">تسجيل دخول الإدارة</CardTitle>
        <CardDescription>
          خاص بالأدمن فقط. الوصول غير المصرح به مراقب ومسجل.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleAdminLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-right">
            <Label htmlFor="email">البريد الإلكتروني للأدمن</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@system.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-right focus:ring-red-500"
              dir="ltr"
            />
          </div>
          <div className="space-y-2 text-right">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-right focus:ring-red-500"
              dir="ltr"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
            {loading ? "جاري التحقق..." : "تسجيل دخول آمن"}
          </Button>
          <p className="text-xs text-center text-zinc-500">
            يتم تسجيل كافة العمليات في سجل النشاط (Audit Log)
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
