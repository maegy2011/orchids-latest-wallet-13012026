"use client";

import Link from "next/link";
import { 
  Banknote, 
  Search, 
  Bell, 
  Plus, 
  Wallet,
  Settings,
  User,
  History,
  CreditCard,
  ChevronDown,
  LayoutDashboard,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "./LogoutButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function DashboardHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-zinc-200 dark:border-zinc-800" dir="rtl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        {/* Branding & Nav */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
              <Banknote className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 hidden sm:inline-block">
              محفظة
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
             <Button asChild variant="ghost" className="h-9 px-4 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <Link href="/dashboard">نظرة عامة</Link>
             </Button>
             <Button asChild variant="ghost" className="h-9 px-4 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <Link href="/wallets">المحافظ</Link>
             </Button>
             <Button asChild variant="ghost" className="h-9 px-4 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <Link href="/reports">التقارير</Link>
             </Button>
          </nav>
        </div>

        {/* Search - Desktop */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-8 relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="البحث عن معاملات، محافظ..." 
            className="w-full h-10 pr-10 pl-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm outline-none"
          />
        </div>

        {/* End Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Quick Add Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full gap-2 px-4 shadow-lg shadow-indigo-600/20 h-9 hidden sm:flex">
                <Plus className="h-4 w-4" />
                <span>إضافة</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2" dir="rtl">
              <DropdownMenuLabel className="px-3 pb-2 pt-1 font-bold">عمليات سريعة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-emerald-50 dark:focus:bg-emerald-950/30">
                <Link href="/transactions/new" className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">معاملة جديدة</span>
                    <span className="text-xs text-zinc-500">إيداع أو سحب من محفظة</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-amber-50 dark:focus:bg-amber-950/30">
                <Link href="/cash/transactions/new" className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">مصروفات نقدية</span>
                    <span className="text-xs text-zinc-500">تسجيل مصروفات من النقدية</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl p-3">
                <Link href="/wallets/new" className="flex items-center gap-3 w-full text-zinc-600 dark:text-zinc-400">
                   <Plus className="h-4 w-4" />
                   <span>إنشاء محفظة جديدة</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950" />
          </Button>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 pl-2 pr-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-200 dark:border-indigo-800 transition-colors group-hover:border-indigo-400">
                  {user?.email?.[0].toUpperCase() ?? <User className="h-4 w-4" />}
                </div>
                <div className="hidden md:flex flex-col items-start text-right">
                  <span className="text-xs font-bold leading-none">{user?.email?.split('@')[0] || "المستخدم"}</span>
                  <span className="text-[10px] text-zinc-500">مدير النظام</span>
                </div>
                <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2" dir="rtl">
              <div className="flex items-center gap-3 p-3">
                 <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl text-indigo-600 font-bold">
                    {user?.email?.[0].toUpperCase() || "U"}
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold">{user?.email?.split('@')[0] || "المستخدم"}</span>
                    <span className="text-xs text-zinc-500 truncate max-w-[140px]">{user?.email}</span>
                 </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer">
                <Link href="/dashboard/account" className="flex items-center gap-3 w-full">
                  <Settings className="h-4 w-4 text-zinc-500" />
                  <span>إعدادات الحساب</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer">
                <Link href="/audit-logs" className="flex items-center gap-3 w-full">
                  <History className="h-4 w-4 text-zinc-500" />
                  <span>سجل العمليات</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-1">
                 <LogoutButton />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
