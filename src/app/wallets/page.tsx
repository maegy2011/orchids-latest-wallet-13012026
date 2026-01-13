import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, Building2, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getWalletsAction } from "@/app/wallets/actions";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  frozen: "bg-blue-100 text-blue-700 border-blue-200",
  archived: "bg-zinc-100 text-zinc-700 border-zinc-200",
  receive_only: "bg-amber-100 text-amber-700 border-amber-200",
  send_only: "bg-purple-100 text-purple-700 border-purple-200"
};

const statusLabels: Record<string, string> = {
  active: "نشطة",
  frozen: "مجمدة",
  archived: "مؤرشفة",
  receive_only: "استقبال فقط",
  send_only: "ارسال فقط"
};

export default async function WalletsPage() {
  const wallets = await getWalletsAction();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans p-4 md:p-8" dir="rtl">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">إدارة المحافظ</h1>
            <p className="text-zinc-500 dark:text-zinc-400">عرض وإدارة جميع المحافظ الإلكترونية</p>
          </div>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/wallets/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            فتح محفظة جديدة
          </Link>
        </Button>
      </header>

      {wallets.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Wallet className="h-16 w-16 text-zinc-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">لا توجد محافظ حالياً</h3>
          <p className="text-zinc-500 mb-6">ابدأ بفتح محفظة جديدة لإدارة عملياتك المالية</p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/wallets/new">فتح محفظة جديدة</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet: any) => (
            <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                      <Wallet className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{wallet.name || wallet.provider}</CardTitle>
                      <p className="text-xs text-zinc-500 font-mono">{wallet.id.split('-')[0]}...</p>
                    </div>
                  </div>
                  <Badge className={statusColors[wallet.status] || statusColors.active}>
                    {statusLabels[wallet.status] || "نشطة"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <span className="text-sm text-zinc-500">الرصيد الحالي</span>
                  <span className="text-lg font-bold text-indigo-600">{Number(wallet.balance).toLocaleString()} ج.م</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Building2 className="h-4 w-4" />
                    <span>{wallet.branches?.name || "غير محدد"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <User className="h-4 w-4" />
                    <span>{wallet.profiles?.name || "غير محدد"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-zinc-400">الحد اليومي:</span>
                    <span className="font-semibold mr-1">{Number(wallet.daily_limit).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">الحد الشهري:</span>
                    <span className="font-semibold mr-1">{Number(wallet.monthly_limit).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        asChild
        size="lg"
        className="fixed bottom-8 left-8 h-16 w-16 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white z-50 transition-all hover:scale-110 active:scale-95"
      >
        <Link href="/wallets/new" title="فتح محفظة جديدة">
          <Plus className="h-8 w-8" />
        </Link>
      </Button>
    </div>
  );
}
