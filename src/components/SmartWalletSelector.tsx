"use client";

import { useState, useEffect } from "react";
import { WalletSuggestion, TransactionType } from "@/lib/wallet-selector";
import { getWalletSuggestionsAction } from "@/app/transactions/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Wallet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartWalletSelectorProps {
  type: TransactionType;
  amount: number;
  branchId: string;
  onSelect: (walletId: string) => void;
  selectedWalletId?: string;
}

export function SmartWalletSelector({
  type,
  amount,
  branchId,
  onSelect,
  selectedWalletId,
}: SmartWalletSelectorProps) {
  const [suggestions, setSuggestions] = useState<WalletSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuggestions() {
      if (!amount || amount <= 0) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getWalletSuggestionsAction({
          type,
          amount,
          branchId,
        });
        setSuggestions(data);
        
        const firstRecommended = data.find(s => s.isRecommended);
        if (firstRecommended && (!selectedWalletId || !data.find(s => s.walletId === selectedWalletId)?.isRecommended)) {
          onSelect(firstRecommended.walletId);
        }
      } catch (err) {
        console.error("Error fetching wallet suggestions:", err);
        setError("فشل تحميل اقتراحات المحفظة");
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [type, amount, branchId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="mr-2 text-sm text-zinc-500">جاري البحث عن أفضل محفظة...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (suggestions.length === 0 && amount > 0) {
    return (
      <div className="p-4 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        لا توجد محافظ متاحة لهذا الفرع.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">الاقتراحات الذكية</h4>
        {!suggestions.some(s => s.isRecommended) && amount > 0 && (
          <Badge variant="destructive" className="bg-red-100 text-red-600 border-red-200 dark:bg-red-900/40">
            تحذير: لا توجد محفظة مثالية
          </Badge>
        )}
      </div>
      
      <div className="grid gap-3">
        {suggestions.map((s) => (
          <button
            key={s.walletId}
            type="button"
            onClick={() => onSelect(s.walletId)}
            className={cn(
              "w-full text-right transition-all border rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group",
              selectedWalletId === s.walletId 
                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-600" 
                : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-zinc-900",
              !s.isRecommended && "opacity-60 grayscale-[0.5]"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  selectedWalletId === s.walletId ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                )}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">{s.provider}</div>
                  <div className="text-xs text-zinc-500">ID: {s.walletId.split('-')[0]}...</div>
                </div>
              </div>
              
              <div className="text-left">
                <div className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {s.availableBalance.toLocaleString()} ر.س
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">الرصيد المتاح</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-1">
              <div>
                <div className="text-[10px] text-zinc-500 mb-0.5">المتبقي من الحد اليومي</div>
                <div className="text-xs font-semibold">{s.remainingDailyLimit.toLocaleString()} ر.س</div>
              </div>
              {s.isRecommended ? (
                <div className="flex items-center justify-end gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3.3 w-3.3" />
                  <span className="text-[10px] font-bold">محفظة مناسبة</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-1 text-amber-600 dark:text-amber-500">
                  <AlertCircle className="h-3.3 w-3.3" />
                  <span className="text-[10px] font-bold">{s.warning || "غير مستحسن"}</span>
                </div>
              )}
            </div>

            {selectedWalletId === s.walletId && (
              <div className="absolute top-0 right-0 w-1 h-full bg-indigo-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
