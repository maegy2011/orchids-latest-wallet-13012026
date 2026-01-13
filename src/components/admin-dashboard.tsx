"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  ArrowLeft, 
  Settings, 
  CreditCard, 
  History, 
  TrendingUp, 
  Users,
  CheckCircle2,
  Clock,
  UserCog,
  Bell,
  FileText,
  PieChart,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { CustomerManagement } from "./admin/customer-management";
import { PackageManagement } from "./admin/package-management";
import { SubscriptionManagement } from "./admin/subscription-management";
import { CommunicationManagement } from "./admin/communication-management";
import { InvoiceManagement } from "./admin/invoice-management";
import { ReportsManagement } from "./admin/reports-management";
import { BackupManagement } from "./admin/backup-management";
import { AuditLogManagement } from "./admin/audit-log-management";
import { SecurityManagement } from "./admin/security-management";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Database, ShieldCheck, Lock } from "lucide-react";

interface Stats {
  totalBranches: number;
  totalWallets: number;
  totalBalance: number;
  totalTransactions: number;
}

interface DashboardStats {
  general: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
  };
  financial: {
    totalInvoicesCount: number;
    totalInvoicesValue: number;
    paidPayments: number;
    overdueAmount: number;
  };
  technical: {
    loginsCount: number;
    systemActivityCount: number;
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  description: string;
  created_at: string;
  wallet_provider?: string;
  branch_name?: string;
}

  export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'packages' | 'subscriptions' | 'communications' | 'invoices' | 'reports' | 'backups' | 'audit' | 'security'>('overview');
    const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalBranches: 0,
    totalWallets: 0,
    totalBalance: 0,
    totalTransactions: 0
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profileError || (profileData?.role !== 'admin' && !profileData?.is_super_admin)) {
          toast.error("عذراً، لا تملك صلاحيات الوصول لهذه الصفحة");
          router.push("/");
          return;
        }
        setProfile(profileData);

        // Fetch Branches
        const { data: branches } = await supabase
          .from("branches")
          .select("*")
          .eq("user_id", user.id);
        
        // Fetch Wallets
        const { data: wallets } = await supabase
          .from("wallets")
          .select("*, branches(name)")
          .eq("user_id", user.id);

        // Fetch Transactions (Join with wallets and branches)
        const { data: transactions } = await supabase
          .from("transactions")
          .select(`
            *,
            wallets!inner (
              provider,
              branches!inner (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        const totalBalance = wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;

        setStats({
          totalBranches: branches?.length || 0,
          totalWallets: wallets?.length || 0,
          totalBalance,
          totalTransactions: transactions?.length || 0
        });

        if (transactions) {
          setRecentTransactions(transactions.map((t: any) => ({
            ...t,
            wallet_provider: t.wallets.provider,
            branch_name: t.wallets.branches.name
          })));
        }

        // Fetch Dashboard Stats
        const statsRes = await fetch("/api/admin/dashboard-stats");
        const statsData = await statsRes.json();
        if (!statsData.error) {
          setDashboardStats(statsData);
        }

      } catch (error: any) {
        toast.error("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-10" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b p-4 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded-lg">
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold hidden sm:block">محفظة</h1>
              </div>
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
              <h1 className="text-xl font-bold flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                لوحة التحكم الإدارية
              </h1>
            </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push("/pricing")}>
            <Settings className="w-4 h-4" />
            الإعدادات
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border mb-6 overflow-x-auto no-scrollbar">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            className="flex-1 gap-2 min-w-[120px]"
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard className="w-4 h-4" />
            نظرة عامة
          </Button>
          <Button 
            variant={activeTab === 'customers' ? 'default' : 'ghost'} 
            className="flex-1 gap-2 min-w-[120px]"
            onClick={() => setActiveTab('customers')}
          >
            <Users className="w-4 h-4" />
            العملاء
          </Button>
          <Button 
            variant={activeTab === 'packages' ? 'default' : 'ghost'} 
            className="flex-1 gap-2 min-w-[120px]"
            onClick={() => setActiveTab('packages')}
          >
            <CreditCard className="w-4 h-4" />
            الباقات
          </Button>
          <Button 
            variant={activeTab === 'subscriptions' ? 'default' : 'ghost'} 
            className="flex-1 gap-2 min-w-[120px]"
            onClick={() => setActiveTab('subscriptions')}
          >
            <Clock className="w-4 h-4" />
            الاشتراكات
          </Button>
          <Button 
            variant={activeTab === 'communications' ? 'default' : 'ghost'} 
            className="flex-1 gap-2 min-w-[120px]"
            onClick={() => setActiveTab('communications')}
          >
            <Bell className="w-4 h-4" />
            التواصل
          </Button>
          <Button 
            variant={activeTab === 'invoices' ? 'default' : 'ghost'} 
            className="flex-1 gap-2 min-w-[120px]"
            onClick={() => setActiveTab('invoices')}
          >
            <FileText className="w-4 h-4" />
            الفواتير
          </Button>
            <Button 
              variant={activeTab === 'reports' ? 'default' : 'ghost'} 
              className="flex-1 gap-2 min-w-[120px]"
              onClick={() => setActiveTab('reports')}
            >
              <PieChart className="w-4 h-4" />
              التقارير
            </Button>
            <Button 
              variant={activeTab === 'backups' ? 'default' : 'ghost'} 
              className="flex-1 gap-2 min-w-[120px]"
              onClick={() => setActiveTab('backups')}
            >
                <Database className="w-4 h-4" />
                النسخ الاحتياطي
              </Button>
              <Button 
                variant={activeTab === 'audit' ? 'default' : 'ghost'} 
                className="flex-1 gap-2 min-w-[120px]"
                onClick={() => setActiveTab('audit')}
              >
                <History className="w-4 h-4" />
                سجل المراجعة
              </Button>
              <Button 
                variant={activeTab === 'security' ? 'default' : 'ghost'} 
                className="flex-1 gap-2 min-w-[120px]"
                onClick={() => setActiveTab('security')}
              >
                <ShieldCheck className="w-4 h-4" />
                الأمان
              </Button>
            </div>


          {activeTab === 'overview' && (

          <div className="space-y-8">
            {/* General Stats */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                إحصائيات عامة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-2xl font-bold">{dashboardStats?.general.totalCustomers || 0}</span>
                    <span className="text-xs text-zinc-500">إجمالي عدد العملاء</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-2xl font-bold">{dashboardStats?.general.activeCustomers || 0}</span>
                    <span className="text-xs text-zinc-500">العملاء المفعلين</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <span className="text-2xl font-bold">{dashboardStats?.general.inactiveCustomers || 0}</span>
                    <span className="text-xs text-zinc-500">العملاء غير المفعلين</span>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Financial Stats */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                إحصائيات مالية
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-xl font-bold">{dashboardStats?.financial.totalInvoicesCount || 0}</span>
                    <span className="text-[10px] text-zinc-500">عدد الفواتير</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-xl font-bold">{(dashboardStats?.financial.totalInvoicesValue || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500">إجمالي قيمة الفواتير</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-xl font-bold text-emerald-600">{(dashboardStats?.financial.paidPayments || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500">المدفوعات المسددة</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-xl font-bold text-rose-600">{(dashboardStats?.financial.overdueAmount || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500">المتأخرات</span>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Technical Stats */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                إحصائيات تقنية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-2xl font-bold">{dashboardStats?.technical.loginsCount || 0}</span>
                    <span className="text-xs text-zinc-500">عدد تسجيلات الدخول</span>
                  </CardContent>
                </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                      <span className="text-2xl font-bold">{dashboardStats?.technical.systemActivityCount || 0}</span>
                      <span className="text-xs text-zinc-500">نشاط النظام</span>
                    </CardContent>
                  </Card>
              </div>
            </section>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Recent Transactions */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <History className="w-5 h-5" />
                    آخر العمليات في النظام
                  </h2>
                </div>
                <Card>
                  <CardContent className="p-0">
                    {recentTransactions.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500">لا توجد عمليات مسجلة حالياً</div>
                    ) : (
                      <div className="divide-y">
                        {recentTransactions.map((tx) => (
                          <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {tx.type === 'deposit' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="font-medium">{tx.description || (tx.type === 'deposit' ? 'إيداع' : 'سحب')}</div>
                                <div className="text-xs text-zinc-500">{tx.branch_name} • {tx.wallet_provider}</div>
                              </div>
                            </div>
                            <div className="text-left">
                              <div className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} ج.م
                              </div>
                              <div className="text-[10px] text-zinc-400">
                                {format(new Date(tx.created_at), 'HH:mm - dd/MM', { locale: ar })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Profile Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UserCog className="w-5 h-5" />
                  معلومات الحساب
                </h2>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs text-zinc-500">الاسم التجاري</div>
                      <div className="font-bold">{profile?.trading_name || profile?.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-zinc-500">نوع الحساب</div>
                      <div className="font-medium">{profile?.customer_type === 'individual' ? 'فرد' : 'شركة'}</div>
                    </div>
                    <div className="space-y-1 pt-2 border-t">
                      <div className="text-xs text-zinc-500">عضو منذ</div>
                      <div className="font-medium">
                        {profile?.created_at && format(new Date(profile.created_at), 'dd MMMM yyyy', { locale: ar })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'packages' && <PackageManagement />}
        {activeTab === 'subscriptions' && <SubscriptionManagement />}
        {activeTab === 'communications' && <CommunicationManagement />}
        {activeTab === 'invoices' && <InvoiceManagement />}
        {activeTab === 'reports' && <ReportsManagement />}
        {activeTab === 'backups' && <BackupManagement />}
        {activeTab === 'audit' && <AuditLogManagement />}
        {activeTab === 'security' && <SecurityManagement />}
      </main>
    </div>
  );
}
