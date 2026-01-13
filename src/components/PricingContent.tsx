'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconCheck, IconSparkles, IconShieldCheck, IconArrowRight, IconStar, IconCalendar } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

export function PricingContent({ userId, email }: { userId?: string; email?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    fetchPackages();
    if (userId) {
      fetchCurrentSubscription();
    }
  }, [userId]);

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('status', 'active')
      .order('price', { ascending: true });
    
    if (data) setPackages(data);
  };

  const fetchCurrentSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, packages(*)')
      .eq('profile_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      setCurrentSubscription(data);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSelectPlan = async (pkg: any) => {
    if (!userId) {
      window.location.href = `/login?signup=true&package_id=${pkg.id}`;
      return;
    }

    // If user is already on this plan and it's active
    if (currentSubscription && currentSubscription.package_id === pkg.id) {
      setError('أنت مشترك بالفعل في هذه الباقة');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/subscriptions/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          packageId: pkg.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`تم تغيير الباقة إلى ${pkg.name} بنجاح!`);
        fetchCurrentSubscription();
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard/account';
        }, 2000);
      } else {
        throw new Error(result.error || 'فشل تحديث الاشتراك');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const getPackageUI = (name: string, price: string, duration: number) => {
      if (name.includes('المجانية')) return { badge: null, popular: false, icon: null, savings: null };
      
      // Calculate annual savings if applicable
      let savings = null;
      if (duration >= 365) {
        savings = 'وفر حتى ٣٠٪ سنوياً';
      }

      if (name.includes('الاحترافية')) return { badge: 'الأكثر مرونة', popular: false, icon: null, savings };
      if (name.includes('المؤسسات')) return { badge: 'الأكثر قيمة', popular: true, icon: <IconStar className="w-6 h-6 text-amber-400 fill-amber-400" />, savings };
      
      return { badge: null, popular: false, icon: null, savings };
    };


  return (
    <div className="py-24 px-4 bg-[#fafafa] dark:bg-[#09090b]" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-indigo-100 dark:border-indigo-900/30">
            <IconSparkles className="w-4 h-4" />
            <span>استثمر في مستقبلك المالي</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white mb-6">
            خطط تناسب طموحاتك
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            ابدأ رحلة التنظيم المالي اليوم. اختر الخطة التي تناسب حجم عملك واستمتع بمميزات لا حصر لها.
          </p>
        </motion.div>

        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto mb-16 p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <IconShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">أنت مشترك حالياً في {currentSubscription.packages.name}</h4>
                <p className="text-zinc-500 dark:text-zinc-400">تستفيد حالياً من كافة مميزات الباقة</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <IconCalendar className="w-4 h-4" />
                <span>تاريخ الاشتراك: {formatDate(currentSubscription.start_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                <IconCalendar className="w-4 h-4" />
                <span>تاريخ الانتهاء: {formatDate(currentSubscription.end_date)}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-3 mb-12">
          <IconShieldCheck className="w-6 h-6 text-indigo-600" />
          <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
            ضمان استعادة الأموال خلال 14 يوماً
          </span>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl text-center font-medium shadow-sm"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-12 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-6 py-4 rounded-2xl text-center font-medium shadow-sm"
          >
            {success}
          </motion.div>
        )}

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, idx) => {
              const ui = getPackageUI(pkg.name, pkg.price, pkg.duration_days);
              const isCurrent = currentSubscription?.package_id === pkg.id;
              const isDark = pkg.price > 100; // Enterprise package is dark

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  className={`${
                    isDark 
                      ? 'bg-zinc-900 dark:bg-indigo-950 text-white border-white/5' 
                      : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-100 dark:border-zinc-800'
                  } rounded-[2.5rem] shadow-xl border p-10 relative flex flex-col ${
                    isCurrent ? 'ring-2 ring-indigo-600' : ''
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      باقتك الحالية
                    </div>
                  )}
                  {!isCurrent && ui.badge && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${isDark ? 'bg-amber-500' : 'bg-indigo-600'} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg`}>
                      {ui.badge}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{pkg.name}</h3>
                    {ui.icon}
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-5xl font-extrabold ${isDark ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                      {pkg.price === "0" ? 'مجاني' : pkg.price}
                    </span>
                    {pkg.price !== "0" && <span className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} text-xl font-bold mr-2`}>ج.م</span>}
                    <span className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} text-lg`}>
                      {pkg.duration_days >= 365 ? '/سنة' : pkg.duration_days > 1 ? '/شهر' : '/للأبد'}
                    </span>
                  </div>

                  {ui.savings && (
                    <div className="mb-6 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1">
                      <IconSparkles className="w-4 h-4" />
                      {ui.savings}
                    </div>
                  )}
                  {!ui.savings && <div className="mb-6 h-5" />}


                  <ul className="space-y-5 mb-10 flex-1">
                    <li className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-white/10' : 'bg-indigo-50 dark:bg-indigo-900/30'} flex items-center justify-center flex-shrink-0`}>
                        <IconCheck className={`w-4 h-4 ${isDark ? 'text-white' : 'text-indigo-600'}`} />
                      </div>
                      <span className={`${isDark ? 'text-zinc-200' : 'text-zinc-700 dark:text-zinc-300'} font-medium`}>
                        {pkg.max_wallets === -1 ? 'محافظ بلا حدود' : `${pkg.max_wallets} محافظ كحد أقصى`}
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-white/10' : 'bg-indigo-50 dark:bg-indigo-900/30'} flex items-center justify-center flex-shrink-0`}>
                        <IconCheck className={`w-4 h-4 ${isDark ? 'text-white' : 'text-indigo-600'}`} />
                      </div>
                      <span className={`${isDark ? 'text-zinc-200' : 'text-zinc-700 dark:text-zinc-300'} font-medium`}>
                        {pkg.max_branches === -1 ? 'مقرات بلا حدود' : `${pkg.max_branches} مقرات كحد أقصى`}
                      </span>
                    </li>
                    {pkg.features?.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-white/10' : 'bg-indigo-50 dark:bg-indigo-900/30'} flex items-center justify-center flex-shrink-0`}>
                          <IconCheck className={`w-4 h-4 ${isDark ? 'text-white' : 'text-indigo-600'}`} />
                        </div>
                        <span className={`${isDark ? 'text-zinc-200' : 'text-zinc-700 dark:text-zinc-300'} font-medium`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                <button
                  onClick={() => handleSelectPlan(pkg)}
                  disabled={loading || isCurrent}
                  className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                    isCurrent
                      ? `${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'} shadow-none cursor-default`
                      : isDark
                        ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  {loading ? 'جاري المعالجة...' : isCurrent ? 'مفعلة' : 'اشترك الآن'}
                  {!loading && !isCurrent && <IconArrowRight className="w-5 h-5 rotate-180" />}
                </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800"
        >
          <h4 className="text-xl font-bold mb-4">هل تحتاج إلى حلول مخصصة؟</h4>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">فريقنا جاهز لمساعدتك في تصميم خطة تناسب احتياجاتك الفريدة.</p>
          <a href="/support" className="text-indigo-600 font-bold hover:underline">تحدث مع المبيعات الآن ←</a>
        </motion.div>
      </div>
    </div>
  );
}
