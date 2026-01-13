import { AdminAuthForm } from "@/components/admin/admin-auth-form";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-900 relative">
      <div className="absolute top-8 right-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-medium"
          dir="rtl"
        >
          <ArrowRight className="h-4 w-4" />
          الرجوع للرئيسية
        </Link>
      </div>
      <AdminAuthForm />
    </div>
  );
}
