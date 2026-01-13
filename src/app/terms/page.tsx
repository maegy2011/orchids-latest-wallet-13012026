import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

export default function TermsPage() {
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
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">شروط الاستخدام</h1>
            </div>
            
            <div className="prose dark:prose-invert max-w-none space-y-8 text-zinc-600 dark:text-zinc-400">
              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">1. قبول الشروط</h2>
                <p className="leading-relaxed">باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يحق لك استخدام الخدمة.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">2. حسابات المستخدمين</h2>
                <p className="leading-relaxed">أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. كما تتحمل المسؤولية الكاملة عن جميع الأنشطة التي تحدث تحت حسابك.</p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">3. الاستخدام المقبول</h2>
                <p className="leading-relaxed">يمنع استخدام التطبيق في أي أغراض غير قانونية أو انتهاك حقوق الملكية الفكرية للآخرين.</p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
