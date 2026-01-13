"use client";

import Link from "next/link";
import { 
  Banknote, 
  Twitter, 
  Instagram, 
  Github
} from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="w-full py-20 bg-white dark:bg-[#09090b] border-t border-zinc-200 dark:border-zinc-800" dir="rtl">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="space-y-8 lg:col-span-2">
            <Link className="flex items-center gap-3 group" href="/">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Banknote className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight">محفظة <span className="text-sm font-medium opacity-70 ml-1">Mahfza</span></span>
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed text-lg">
              نحن هنا لتبسيط عالم المال المعقد. نقدم حلولاً تقنية مبتكرة للأفراد والشركات لإدارة ثرواتهم بذكاء وسهولة تامة.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Twitter className="h-5 w-5" />, href: "#" },
                { icon: <Instagram className="h-5 w-5" />, href: "#" },
                { icon: <Github className="h-5 w-5" />, href: "#" },
              ].map((social, i) => (
                <Link 
                  key={i} 
                  href={social.href} 
                  className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:-translate-y-1"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-600">المنتج</h4>
            <ul className="space-y-4">
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="/#features">المميزات</Link></li>
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="/pricing">الأسعار</Link></li>
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="#">التحديثات</Link></li>
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="#">الأمان</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-600">الشركة</h4>
            <ul className="space-y-4">
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="#">من نحن</Link></li>
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="#">الوظائف</Link></li>
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="/support">اتصل بنا</Link></li>
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="/faq">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-600">قانوني</h4>
            <ul className="space-y-4">
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="/privacy">سياسة الخصوصية</Link></li>
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="/terms">شروط الاستخدام</Link></li>
              <li><Link className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex items-center gap-2" href="#">ملفات الارتباط</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                © {new Date().getFullYear()} محفظة (Mahfza). جميع الحقوق محفوظة.
              </p>
            <p className="text-xs text-zinc-400">نظام إدارة مالية متطور للأعمال والأفراد.</p>
          </div>
          
          <div className="flex items-center gap-8">
             <Link href="/admin/login" className="text-sm text-zinc-400 hover:text-indigo-600 transition-colors font-medium">بوابة الإدارة</Link>
             <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
             <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full">
               <span>صُنع بإتقان</span>
               <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
