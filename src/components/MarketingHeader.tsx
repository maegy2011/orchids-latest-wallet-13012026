"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
    Banknote, 
    LayoutDashboard, 
    LogOut,
    ArrowLeft,
    Menu,
    X
  } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function MarketingHeader() {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم تسجيل الخروج بنجاح");
      router.refresh();
    }
  };

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "المميزات", href: "/#features" },
    { name: "الأسعار", href: "/pricing" },
    { name: "من نحن", href: "/#about" },
  ];

  return (
    <header className={`px-6 lg:px-12 h-20 flex items-center border-b transition-all duration-300 sticky top-0 z-50 ${
      scrolled 
      ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 shadow-sm" 
      : "bg-transparent border-transparent"
    }`} dir="rtl">
        <Link className="flex items-center justify-center gap-2 group shrink-0" href="/">
          <div className="p-2 bg-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Banknote className="h-6 w-6 text-white" />
          </div>
            <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">محفظة <span className="text-sm font-medium opacity-70 ml-1">Mahfza</span></span>
        </Link>

      {/* Desktop Navigation */}
      <nav className="mr-12 hidden lg:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.href}
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="mr-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" className="rounded-full px-5 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  لوحة التحكم
                </Link>
              </Button>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
              <Button onClick={handleLogout} variant="ghost" className="text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full h-10 w-10 p-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full px-5 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-lg shadow-indigo-600/20">
                <Link href="/login?signup=true">ابدأ مجاناً</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-6 right-6 p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <span className="font-semibold">{link.name}</span>
                  <ArrowLeft className="h-4 w-4 text-zinc-400" />
                </Link>
              ))}
              <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-2" />
              {user ? (
                <Button asChild className="w-full justify-start py-6 rounded-2xl bg-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <LayoutDashboard className="h-5 w-5" />
                    لوحة التحكم
                  </Link>
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="py-6 rounded-2xl" onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/login">دخول</Link>
                  </Button>
                  <Button asChild className="py-6 rounded-2xl bg-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/login?signup=true">ابدأ الآن</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
