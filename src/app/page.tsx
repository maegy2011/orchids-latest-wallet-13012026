"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Zap, 
  Mail, 
  ArrowLeft,
  PieChart,
  Wallet,
  Globe,
  Star,
  Layers,
  TrendingUp,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";
import { PricingContent } from "@/components/PricingContent";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-16 w-16"
        >
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/30 dark:selection:text-indigo-200" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[25%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute -bottom-[25%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <MarketingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-20 pb-12 md:pt-32 md:pb-24 lg:pt-48 lg:pb-32 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center space-y-10 text-center"
            >
              <div className="space-y-6 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 backdrop-blur-sm"
                >
                  <Star className="ml-2 h-4 w-4 fill-indigo-600" />
                  المنصة الأكثر تكاملاً لإدارة الأعمال الصغيرة والمتوسطة
                </motion.div>
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-600 py-2">
                  حول إدارة ماليتك <br />
                  <span className="text-indigo-600">إلى ميزة تنافسية</span>
                </h1>
                <p className="mx-auto max-w-[800px] text-zinc-500 text-lg md:text-xl xl:text-2xl dark:text-zinc-400 leading-relaxed">
                  وداعاً للفوضى المالية. "محفظة" يمنحك السيطرة الكاملة على تدفقاتك النقدية، اشتراكاتك، وفروعك في مكان واحد، مع تحليلات ذكية تدفعك نحو النمو.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {user ? (
                  <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 py-7 text-lg shadow-2xl shadow-indigo-600/40 group">
                    <Link href="/dashboard" className="flex items-center gap-3">
                      الانتقال للوحة التحكم
                      <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 py-7 text-lg shadow-2xl shadow-indigo-600/40 group">
                      <Link href="/login?signup=true" className="flex items-center gap-3">
                        ابدأ رحلتك المجانية الآن
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-7 text-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <Link href="/login">تسجيل الدخول</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Stats/Social Proof */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-80"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold text-indigo-600">100%</span>
                  <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500">وضوح مالي</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold text-indigo-600">0%</span>
                  <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500">مخاطر أمنية</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold text-indigo-600">24/7</span>
                  <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500">مراقبة ذكية</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold text-indigo-600">SEC</span>
                  <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500">أمان فائق</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="w-full py-24 bg-white dark:bg-zinc-900/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">لماذا يختار المحترفون "محفظة"؟</h2>
                <div className="space-y-4">
                  {[
                    { title: "تنظيم فوري", desc: "حول بياناتك المشتتة إلى رؤى واضحة في ثوانٍ معدودة.", icon: <Layers className="w-5 h-5 text-indigo-600" /> },
                    { title: "توفير الوقت", desc: "أتمتة المهام المتكررة لتتفرغ لما يهم حقاً: نمو عملك.", icon: <Clock className="w-5 h-5 text-indigo-600" /> },
                    { title: "قرارات مدروسة", desc: "بيانات حقيقية تدعم كل قرار تتخذه، لا مكان للتخمين بعد اليوم.", icon: <TrendingUp className="w-5 h-5 text-indigo-600" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      <div className="mt-1">{item.icon}</div>
                      <div>
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square md:aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <div className="text-indigo-600/20 animate-pulse">
                  <PieChart className="w-48 h-48" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto relative">
            <div className="flex flex-col items-center text-center mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-sm">القوة في البساطة</h2>
              <h3 className="text-4xl md:text-5xl font-bold">أدوات متطورة لنتائج استثنائية</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">صممنا كل ميزة بدقة لتلبي احتياجات طموحك.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "أداء فائق السرعة",
                  desc: "تجربة مستخدم فورية تضمن لك الوصول لبياناتك وتحديثها دون أي تأخير."
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: "خصوصية مطلقة",
                  desc: "نحن نستخدم تشفيراً من طرف إلى طرف لضمان أن بياناتك ملك لك وحدك."
                },
                {
                  icon: <PieChart className="h-6 w-6" />,
                  title: "تقارير تحليلية",
                  desc: "افهم اتجاهات مصروفاتك ودخلك من خلال رسوم بيانية تفاعلية وسهلة الفهم."
                },
                {
                  icon: <Wallet className="h-6 w-6" />,
                  title: "إدارة الفروع والمحافظ",
                  desc: "تحكم في ميزانية فروعك ووزع الموارد المالية بذكاء عبر نظام مركزي موحد."
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "مزامنة سحابية",
                  desc: "ابدأ على هاتفك، أكمل على حاسوبك. بياناتك دائماً معك وفي أحدث حالاتها."
                },
                {
                  icon: <Mail className="h-6 w-6" />,
                  title: "نظام تنبيهات ذكي",
                  desc: "لا تفوت موعد سداد أو انتهاء اشتراك بفضل نظام التنبيهات المؤتمت."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="group relative h-full overflow-hidden border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-1 h-0 bg-indigo-600 group-hover:h-full transition-all duration-300" />
                    <CardHeader className="pb-2">
                      <div className="mb-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full">
          <PricingContent userId={user?.id} email={user?.email} />
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 px-4">
          <div className="container mx-auto">
            <div className="relative rounded-[3rem] overflow-hidden bg-zinc-900 dark:bg-indigo-950 p-12 md:p-24 text-center border border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(79,70,229,0.3),transparent)]" />
              <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  هل أنت مستعد لقيادة مستقبلك المالي؟
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl">
                  انضم إلى النخبة من رواد الأعمال الذين قرروا استعادة السيطرة. ابدأ الآن مجاناً وخلال دقائق ستشعر بالفرق.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-full px-12 py-7 text-lg font-bold shadow-xl shadow-white/10">
                    <Link href="/login?signup=true">ابدأ رحلتك مجاناً</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/10 rounded-full px-12 py-7 text-lg backdrop-blur-sm">
                    <Link href="/pricing">اكتشف خطط الأسعار</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
