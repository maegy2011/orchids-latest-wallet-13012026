import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type TransactionType = "Cash Out" | "Cash In" | "Incoming Transfer" | "Internal Transfer" | "ATM/Bank Deposit";

export interface WalletSuggestion {
  walletId: string;
  provider: string;
  availableBalance: number;
  remainingDailyLimit: number;
  isRecommended: boolean;
  warning?: string;
}

export async function suggestBestWallet(params: {
  type: TransactionType;
  amount: number;
  branchId: string;
  safetyMargin?: number;
}): Promise<WalletSuggestion[]> {
  const { type, amount, branchId, safetyMargin = 0 } = params;

  // 1. Fetch wallets for the branch
  const { data: wallets, error: walletsError } = await supabase
    .from("wallets")
    .select("*")
    .eq("branch_id", branchId);

  if (walletsError || !wallets) {
    throw new Error("Failed to fetch wallets");
  }

  // 2. Fetch today's transactions for these wallets to calculate remaining limits
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("wallet_id, amount")
    .gte("created_at", startOfDay.toISOString());

  if (txError) {
    throw new Error("Failed to fetch today's transactions");
  }

  const walletTxTotals: Record<string, number> = {};
  transactions?.forEach((tx) => {
    walletTxTotals[tx.wallet_id] = (walletTxTotals[tx.wallet_id] || 0) + Number(tx.amount);
  });

  // 3. Evaluate each wallet
  const suggestions: WalletSuggestion[] = wallets.map((wallet) => {
    const todaySpent = walletTxTotals[wallet.id] || 0;
    const remainingLimit = Number(wallet.daily_limit) - todaySpent;
    const balance = Number(wallet.balance);
    
    let warning = "";
    let isPossible = true;

    // Check activity status
    const needsReceive = ["Cash Out", "Incoming Transfer", "ATM/Bank Deposit"].includes(type);
    const needsSend = ["Cash In", "Internal Transfer"].includes(type);

    if (needsReceive && !wallet.is_active_receive) {
      isPossible = false;
      warning = "المحفظة غير متاحة للاستقبال";
    }
    
    if (needsSend && !wallet.is_active_send) {
      isPossible = false;
      warning = "المحفظة غير متاحة للإرسال";
    }

    // Check balance for send operations
    if (isPossible && needsSend) {
      if (balance < amount + safetyMargin) {
        isPossible = false;
        warning = "الرصيد غير كافٍ (مع احتساب هامش الأمان)";
      }
    }

    // Check daily limit
    if (isPossible && remainingLimit < amount) {
      isPossible = false;
      warning = "سيتم تجاوز الحد اليومي";
    }

    return {
      walletId: wallet.id,
      provider: wallet.provider,
      availableBalance: balance,
      remainingDailyLimit: Math.max(0, remainingLimit),
      isRecommended: isPossible,
      warning: warning || undefined,
    };
  });

  // Sort: Recommended first, then by highest balance
  return suggestions.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    return b.availableBalance - a.availableBalance;
  });
}
