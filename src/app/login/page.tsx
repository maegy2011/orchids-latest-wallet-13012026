import { AuthForm } from "@/components/auth-form";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 relative">
      <div className="absolute top-8 right-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          dir="rtl"
        >
          <ArrowRight className="h-4 w-4" />
          الرجوع للرئيسية
        </Link>
      </div>
      <AuthForm />
    </div>
  );
}
