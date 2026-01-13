"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Plus, Wallet, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";

interface WalletData {
  id: string;
  provider: string;
  balance: number;
  branch_id: string;
}

interface Branch {
  id: string;
  name: string;
}

export function BranchDetailsClient({ params }: { params: Promise<{ id: string }> }) {
  const { id: branchId } = use(params);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWalletProvider, setNewWalletProvider] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState("");
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [updatingWallet, setUpdatingWallet] = useState<WalletData | null>(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [updateType, setUpdateType] = useState<"deposit" | "withdrawal">("deposit");
  const router = useRouter();

  useEffect(() => {
    fetchBranchAndWallets();
  }, [branchId]);

  const fetchBranchAndWallets = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: branchData, error: branchError } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single();

      if (branchError) throw branchError;
      setBranch(branchData);

      const { data: walletsData, error: walletsError } = await supabase
        .from("wallets")
        .select("*")
        .eq("branch_id", branchId);

      if (walletsError) throw walletsError;
      setWallets(walletsData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    if (!newWalletProvider) return;
    try {
      if (profile?.subscription_plan === 'free' && wallets.length >= 2) {
        toast.error("لقد وصلت للحد الأقصى للمحافظ في الخطة المجانية (محفظتين). يرجى الترقية لإضافة المزيد.");
        router.push("/pricing");
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("wallets")
        .insert([{ 
          provider: newWalletProvider, 
          balance: parseFloat(newWalletBalance) || 0, 
          branch_id: branchId,
          user_id: user?.id 
        }]);
      
      if (error) throw error;
      
      toast.success("تمت إضافة المحفظة بنجاح");
      setNewWalletProvider("");
      setNewWalletBalance("");
      setIsAddWalletOpen(false);
      fetchBranchAndWallets();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateBalance = async () => {
    if (!updatingWallet || !updateAmount) return;
    const amount = parseFloat(updateAmount);
    const newBalance = updateType === "deposit" 
      ? Number(updatingWallet.balance) + amount 
      : Number(updatingWallet.balance) - amount;

    try {
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance, last_updated: new Date().toISOString() })
        .eq("id", updatingWallet.id);

      if (updateError) throw updateError;

      // Log transaction
      await supabase
        .from("transactions")
        .insert([{
          wallet_id: updatingWallet.id,
          type: updateType,
          amount: amount,
          description: updateType === "deposit" ? "إيداع يدوي" : "سحب يدوي"
        }]);

      toast.success("تم تحديث الرصيد بنجاح");
      setUpdatingWallet(null);
      setUpdateAmount("");
      fetchBranchAndWallets();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المحفظة؟")) return;
    try {
      const { error } = await supabase.from("wallets").delete().eq("id", id);
      if (error) throw error;
      toast.success("تم حذف المحفظة");
      fetchBranchAndWallets();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <header className="bg-white dark:bg-zinc-900 border-b p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">{branch?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {profile?.subscription_plan === 'free' ? (
            <Button variant="outline" size="sm" onClick={() => router.push("/pricing")} className="text-amber-600 border-amber-200 bg-amber-50">
              ترقية
            </Button>
          ) : (
            <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
              برو
            </div>
          )}
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">المحافظ الإلكترونية</h2>
          <Dialog open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full gap-1">
                <Plus className="w-4 h-4" />
                محفظة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="text-right">
              <DialogHeader>
                <DialogTitle>إضافة محفظة للفرع</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>نوع المحفظة / المزود</Label>
                  <Input 
                    placeholder="مثلاً: فودافون كاش، إنستا باي" 
                    value={newWalletProvider}
                    onChange={(e) => setNewWalletProvider(e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الرصيد الافتتاحي</Label>
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    value={newWalletBalance}
                    onChange={(e) => setNewWalletBalance(e.target.value)}
                    className="text-right"
                  />
                </div>
                <Button onClick={handleAddWallet} className="w-full">حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {wallets.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed">
              <p>لا يوجد محافظ مضافة في هذا الفرع</p>
            </div>
          ) : (
            wallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{wallet.provider}</h3>
                    <p className="text-2xl font-mono text-primary">
                      {Number(wallet.balance).toLocaleString()} <span className="text-sm font-sans">ج.م</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setUpdatingWallet(wallet)}
                      className="gap-1"
                    >
                      تعديل الرصيد
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteWallet(wallet.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Update Balance Dialog */}
        <Dialog open={!!updatingWallet} onOpenChange={() => setUpdatingWallet(null)}>
          <DialogContent className="text-right">
            <DialogHeader>
              <DialogTitle>تحديث رصيد {updatingWallet?.provider}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex gap-2">
                <Button 
                  className={`flex-1 gap-2 ${updateType === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                  onClick={() => setUpdateType('deposit')}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  إيداع (+)
                </Button>
                <Button 
                  className={`flex-1 gap-2 ${updateType === 'withdrawal' ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                  onClick={() => setUpdateType('withdrawal')}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  سحب (-)
                </Button>
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input 
                  type="number"
                  placeholder="ادخل المبلغ" 
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  className="text-right text-xl font-mono"
                />
              </div>
              <Button onClick={handleUpdateBalance} className="w-full h-12 text-lg">تأكيد العملية</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
