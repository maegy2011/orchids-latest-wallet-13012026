"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  User, 
  Shield, 
  ArrowRight, 
  Save, 
  Key, 
  LogOut, 
  CreditCard, 
  Settings, 
  MapPin, 
  Phone, 
  Building2,
  AlertTriangle,
  Lock,
  Mail,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [usage, setUsage] = useState({ wallets: 0, branches: 0 });
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        toast.error("خطأ في تحميل بيانات الملف الشخصي");
      } else {
        setProfile(profileData);
      }

      // Fetch active subscription
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*, packages(*)")
        .eq("profile_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setSubscription(subData);

      // Fetch subscription history
      const { data: historyData } = await supabase
        .from("subscriptions")
        .select("*, packages(*)")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      setHistory(historyData || []);

      // Fetch usage counts
      const [walletsCount, branchesCount] = await Promise.all([
        supabase.from("wallets").select("*", { count: "exact", head: true }).eq("profile_id", user.id),
        supabase.from("branches").select("*", { count: "exact", head: true }).eq("profile_id", user.id)
      ]);

      setUsage({
        wallets: walletsCount.count || 0,
        branches: branchesCount.count || 0
      });

      setLoading(false);
    };

    fetchProfileAndSubscription();
  }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);

      try {
        const { data, error, status } = await supabase
          .from("profiles")
          .update({
            name: profile.name,
            mobile: profile.mobile,
            trading_name: profile.trading_name,
            governorate: profile.governorate,
            city: profile.city,
            street: profile.street,
          })
          .eq("id", user.id)
          .select();

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error("لم يتم العثور على الملف الشخصي لتحديثه");
        }

        toast.success("تم تحديث الملف الشخصي بنجاح");
        setProfile(data[0]);
      } catch (error: any) {
        console.error("Update error:", error);
        toast.error(error.message || "فشل تحديث الملف الشخصي");
      } finally {
        setSaving(false);
      }
    };

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-12 w-12"
        >
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8"
      dir="rtl"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
              إدارة الحساب
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">مرحباً، {profile?.name || "المستخدم"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
            {profile?.subscription_plan || "خطة مجانية"}
          </Badge>
          <Button asChild variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </Button>
        </div>
      </header>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList className="bg-zinc-100/50 dark:bg-zinc-900/50 p-1 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <User className="ml-2 h-4 w-4" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <Shield className="ml-2 h-4 w-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="subscription" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <CreditCard className="ml-2 h-4 w-4" />
            الاشتراك
          </TabsTrigger>
        </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent key="profile" value="profile">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-6"
              >
              <Card className="border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-xl">معلومات النشاط التجاري</CardTitle>
                  </div>
                  <CardDescription>هذه البيانات تظهر في تقاريرك وفواتيرك الرسمية.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-bold">الاسم الكامل</Label>
                        <div className="relative">
                          <User className="absolute right-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input
                            id="name"
                            className="pr-10 focus-visible:ring-indigo-500"
                            placeholder="أدخل اسمك الكامل"
                            value={profile?.name || ""}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-bold text-zinc-400">البريد الإلكتروني (أساسي)</Label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                            className="pr-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-70"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trading_name" className="text-sm font-bold">الاسم التجاري / المحل</Label>
                        <div className="relative">
                          <Building2 className="absolute right-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input
                            id="trading_name"
                            className="pr-10 focus-visible:ring-indigo-500"
                            placeholder="اسم علامتك التجارية"
                            value={profile?.trading_name || ""}
                            onChange={(e) => setProfile({ ...profile, trading_name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-bold">رقم التواصل</Label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-3 h-4 w-4 text-zinc-400" />
                          <Input
                            id="mobile"
                            className="pr-10 focus-visible:ring-indigo-500"
                            placeholder="01xxxxxxxxx"
                            value={profile?.mobile || ""}
                            onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                        <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500">تفاصيل العنوان</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="governorate">المحافظة</Label>
                          <Input
                            id="governorate"
                            className="focus-visible:ring-indigo-500"
                            value={profile?.governorate || ""}
                            onChange={(e) => setProfile({ ...profile, governorate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">المدينة</Label>
                          <Input
                            id="city"
                            className="focus-visible:ring-indigo-500"
                            value={profile?.city || ""}
                            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="street">الشارع / العنوان التفصيلي</Label>
                          <Input
                            id="street"
                            className="focus-visible:ring-indigo-500"
                            value={profile?.street || ""}
                            onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl shadow-lg shadow-indigo-600/20">
                        {saving ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Save className="ml-2 h-4 w-4" />
                            حفظ كافة التغييرات
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

            <TabsContent key="security" value="security">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-6"
              >
              <Card className="border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-indigo-600" />
                    <CardTitle>أمان الحساب</CardTitle>
                  </div>
                  <CardDescription>إدارة كلمات المرور ووسائل التحقق.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 gap-4">
                    <div className="space-y-1">
                      <p className="font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        تغيير كلمة المرور
                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-none font-normal">موصى به</Badge>
                      </p>
                      <p className="text-sm text-zinc-500">تأكد من اختيار كلمة مرور قوية وفريدة لحماية بياناتك المالية.</p>
                    </div>
                    <Button onClick={handleChangePassword} variant="outline" className="rounded-xl border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                      <Key className="ml-2 h-4 w-4" />
                      إرسال رابط التغيير
                    </Button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 gap-4 opacity-70">
                    <div className="space-y-1">
                      <p className="font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        التحقق الثنائي (2FA)
                        <Badge variant="outline" className="font-normal text-[10px]">قريباً</Badge>
                      </p>
                      <p className="text-sm text-zinc-500">إضافة طبقة حماية إضافية لحسابك عبر الهاتف.</p>
                    </div>
                    <Button disabled variant="outline" className="rounded-xl">تفعيل الميزة</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10 overflow-hidden shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <CardTitle className="text-red-600">منطقة الخطر</CardTitle>
                  </div>
                  <CardDescription className="text-red-500/80">إجراءات لا يمكن التراجع عنها تخص حسابك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-red-100 dark:border-red-900/20 bg-white/50 dark:bg-black/20">
                    <div className="space-y-1">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">حذف الحساب نهائياً</p>
                      <p className="text-sm text-zinc-500">سيتم مسح كافة البيانات، المحافظ، والسجلات الخاصة بك للأبد.</p>
                    </div>
                    <Button variant="destructive" className="rounded-xl px-6">حذف الحساب</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

            <TabsContent key="subscription" value="subscription">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-6"
              >
              <Card className="border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -z-10 rounded-full" />
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <CardTitle>باقة الاشتراك الحالية</CardTitle>
                  </div>
                  <CardDescription>إدارة خطتك المالية والمدفوعات.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-zinc-900 dark:bg-zinc-800 rounded-[2rem] text-white gap-8 shadow-2xl shadow-indigo-500/10">
                    <div className="space-y-4">
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">الخطة النشطة</p>
                        <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
                          {profile?.subscription_plan || "التجريبية"}
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-4">
                          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
                            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">تاريخ الاشتراك</p>
                            <p className="font-bold">
                              {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString("ar-EG") : "غير متوفر"}
                            </p>
                          </div>
                          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
                            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">تاريخ الانتهاء</p>
                            <p className="font-bold text-indigo-300">
                              {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString("ar-EG") : "غير متوفر"}
                            </p>
                          </div>

                      </div>
                    </div>
                    <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 h-14 text-lg font-bold w-full md:w-auto shadow-xl shadow-indigo-600/30">
                      <Link href="/pricing">ترقية الخطة</Link>
                    </Button>
                  </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { 
                              label: "المحافظ المتاحة", 
                              value: `${usage.wallets} / ${subscription?.packages?.max_wallets === -1 ? "بلا حدود" : (subscription?.packages?.max_wallets || "2")}`, 
                              icon: <Building2 className="w-4 h-4" />,
                              color: "indigo"
                            },
                            { 
                              label: "المقرات المتاحة", 
                              value: `${usage.branches} / ${subscription?.packages?.max_branches === -1 ? "بلا حدود" : (subscription?.packages?.max_branches || "1")}`, 
                              icon: <MapPin className="w-4 h-4" />,
                              color: "blue"
                            }
                          ].map((feature) => (
                          <div key={feature.label} className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl bg-${feature.color}-50 dark:bg-${feature.color}-900/20 flex items-center justify-center text-${feature.color}-600`}>
                              {feature.icon}
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500 font-medium">{feature.label}</p>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{feature.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold">سجل الاشتراكات</h3>
                          <Badge variant="outline">{history.length} سجلات</Badge>
                        </div>
                        <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                          <table className="w-full text-right text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-bold">
                              <tr>
                                <th className="p-4">الباقة</th>
                                <th className="p-4">الفترة</th>
                                <th className="p-4">الحالة</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                              {history.map((item) => (
                                <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                  <td className="p-4 font-bold">{item.packages?.name}</td>
                                  <td className="p-4 text-zinc-500">
                                    {new Date(item.start_date).toLocaleDateString("ar-EG")} - {new Date(item.end_date).toLocaleDateString("ar-EG")}
                                  </td>
                                  <td className="p-4">
                                    <Badge 
                                      variant={item.status === "active" ? "default" : "secondary"}
                                      className={item.status === "active" ? "bg-emerald-500" : ""}
                                    >
                                      {item.status === "active" ? "نشط" : "منتهي"}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                              {history.length === 0 && (
                                <tr>
                                  <td colSpan={3} className="p-8 text-center text-zinc-500 italic">لا يوجد سجل اشتراكات متاح</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}
