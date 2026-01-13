import Link from "next/link";
import { ChevronRight, Mail, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

export default function SupportPage() {
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
                <Mail className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">تواصل مع الدعم</h1>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                <Phone className="h-6 w-6 text-indigo-600 mb-3" />
                <h3 className="font-bold text-lg mb-1">اتصل بنا</h3>
                <p className="text-zinc-500 dark:text-zinc-400">966-XXX-XXX-XXX+</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                <MessageSquare className="h-6 w-6 text-indigo-600 mb-3" />
                <h3 className="font-bold text-lg mb-1">الدردشة الحية</h3>
                <p className="text-zinc-500 dark:text-zinc-400">متوفرون على مدار الساعة</p>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">الاسم</Label>
                  <Input id="name" placeholder="أدخل اسمك الكامل" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">البريد الإلكتروني</Label>
                  <Input id="email" type="email" placeholder="email@example.com" className="rounded-xl h-12" dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-semibold">رسالتك</Label>
                <Textarea id="message" placeholder="كيف يمكننا مساعدتك؟" className="rounded-xl min-h-[150px] resize-none" />
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-7 rounded-xl text-lg font-bold shadow-lg shadow-indigo-600/20">
                إرسال الرسالة
              </Button>
            </form>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
