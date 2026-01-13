import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#09090b]" dir="rtl">
      <MarketingHeader />
      
      <main className="flex-1 py-12 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-8 hover:underline w-fit">
            <ChevronRight className="h-4 w-4" />
            العودة للرئيسية
          </Link>
          
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">سياسة الخصوصية</h1>
            </div>
            
            <div className="prose dark:prose-invert max-w-none space-y-8 text-zinc-600 dark:text-zinc-400">
              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">1. جمع المعلومات</h2>
                <p className="leading-relaxed">نحن نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب أو استخدام خدماتنا، بما في ذلك الاسم والبريد الإلكتروني والبيانات المالية المتعلقة بإدارة فروعك.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">2. حماية البيانات</h2>
                <p className="leading-relaxed">نحن نستخدم تقنيات تشفير متقدمة (AES-256) لحماية بياناتك. يتم تخزين جميع المعلومات بشكل آمن ويتم عمل نسخ احتياطية دورية مشفرة.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">3. مشاركة المعلومات</h2>
                <p className="leading-relaxed">لا نقوم ببيع أو تأجير بياناتك الشخصية لأطراف ثالثة. يتم استخدام البيانات فقط لتحسين جودة الخدمة وتقديم الدعم الفني اللازم.</p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
