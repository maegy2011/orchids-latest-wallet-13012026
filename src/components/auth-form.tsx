"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSparkles, IconCheck, IconPackage } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthForm() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("package_id");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setIsSignUp(searchParams.get("signup") === "true");
  }, [searchParams]);

  useEffect(() => {
    if (packageId) {
      const fetchPackage = async () => {
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .eq("id", packageId)
          .single();
        
        if (data) setSelectedPackage(data);
      };
      fetchPackage();
    }
  }, [packageId]);

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("يرجى إدخال البريد الإلكتروني أولاً");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          
          if (data.user && packageId) {
             // For signup, we might need to wait for session or just try to update
             // but usually signup needs email confirmation. If email confirmation is off:
             await fetch('/api/subscriptions/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: data.user.id, packageId })
             });
          }

          toast.success("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
          setIsSignUp(false);
        } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
          const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              if (packageId) {
                await fetch('/api/subscriptions/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, packageId })
                });
              }
              // Log login activity
              await supabase
                .from("activity_logs")
                .insert([{
                  user_id: user.id,
                  action: 'login',
                  metadata: {
                    email: user.email,
                    ip: 'client-side-login'
                  }
                }]);

              // Check for force password change and update last login
              const { data: profile } = await supabase
                .from("profiles")
                .select("force_password_change")
              .eq("id", user.id)
              .single();

            await supabase
              .from("profiles")
              .update({ last_login_at: new Date().toISOString() })
              .eq("id", user.id);

            if (profile?.force_password_change) {
              const newPassword = prompt("يجب عليك تغيير كلمة المرور عند أول دخول. أدخل كلمة المرور الجديدة:");
              if (newPassword) {
                await supabase.auth.updateUser({ password: newPassword });
                await supabase.from("profiles").update({ force_password_change: false }).eq("id", user.id);
                toast.success("تم تغيير كلمة المرور بنجاح");
              }
            }
          }

            toast.success("تم تسجيل الدخول بنجاح!");
            router.push("/dashboard");
            router.refresh();

      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-right">
        <CardTitle>{isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}</CardTitle>
        <CardDescription>
          {isSignUp ? "ادخل بياناتك للبدء في إدارة محفظتك" : "مرحباً بك مجدداً في محفظة"}
        </CardDescription>
      </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {selectedPackage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                          <IconPackage className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">الباقة المختارة</p>
                          <h4 className="font-bold text-zinc-900 dark:text-white">{selectedPackage.name}</h4>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                          {selectedPackage.price === "0" ? 'مجاني' : `${selectedPackage.price} ج.م`}
                        </span>
                      </div>
                    </div>
                    
                    {selectedPackage.duration_days >= 365 && (
                      <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold">
                        <IconSparkles className="w-4 h-4" />
                        <span>عرض خاص: لقد اخترت الباقة السنوية مع خصم ٣٠٪!</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <IconCheck className="w-3 h-3 text-emerald-500" />
                      <span>سيتم تفعيل الباقة تلقائياً بعد {isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول'}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 text-right">

            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-right"
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
              className="text-right"
              dir="ltr"
            />
          </div>
        </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري التحميل..." : isSignUp ? "إنشاء حساب" : "دخول"}
            </Button>
            
            {!isSignUp && (
              <Button
                type="button"
                variant="link"
                className="text-indigo-600 h-auto p-0"
                onClick={handleForgotPassword}
              >
                نسيت كلمة المرور؟
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "لديك حساب بالفعل؟ سجل دخول" : "ليس لديك حساب؟ أنشئ حساباً"}
            </Button>
          </CardFooter>

      </form>
    </Card>
  );
}
