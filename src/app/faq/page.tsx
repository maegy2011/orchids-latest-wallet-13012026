import Link from "next/link";
import { ChevronRight, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

export default function FAQPage() {
  const faqs = [
    {
      question: "كيف يمكنني البدء؟",
      answer: "يمكنك البدء بإنشاء حساب جديد عبر صفحة التسجيل، ثم إضافة فروعك والبدء في إدارة عملياتك المالية."
    },
    {
      question: "هل بياناتي آمنة؟",
      answer: "نعم، نستخدم أعلى معايير التشفير والأمان لضمان حماية بياناتك المالية وبيانات عملائك."
    },
    {
      question: "كيف يمكنني استعادة كلمة المرور؟",
      answer: "يمكنك استخدام رابط 'نسيت كلمة المرور' في صفحة تسجيل الدخول، وسنرسل لك رابطاً لإعادة تعيينها."
    },
    {
      question: "هل يدعم التطبيق تعدد الفروع؟",
      answer: "بالتأكيد، تم تصميم التطبيق ليدعم إدارة عدد غير محدود من الفروع بكل سهولة."
    }
  ];

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
                <HelpCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">الأسئلة الشائعة</h1>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-zinc-100 dark:border-zinc-800 py-2">
                  <AccordionTrigger className="text-right hover:text-indigo-600 transition-colors text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-right text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
