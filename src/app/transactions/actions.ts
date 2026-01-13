"use server";

import { suggestBestWallet, TransactionType } from "@/lib/wallet-selector";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getWalletSuggestionsAction(params: {
  type: TransactionType;
  amount: number;
  branchId: string;
  safetyMargin?: number;
}) {
  return await suggestBestWallet(params);
}

export async function getLatestUsedWalletAction(branchId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("wallet_id")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.wallet_id;
}

export async function getDashboardStatsAction() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Total Cash Balance
  const { data: branches } = await supabase
    .from("branches")
    .select("cash_balance");
  const totalCashBalance = branches?.reduce((sum, b) => sum + (Number(b.cash_balance) || 0), 0) || 0;

  // 2. Total Wallet Balances
  const { data: wallets } = await supabase
    .from("wallets")
    .select("balance, daily_limit, is_active_send, is_active_receive, name, id");
  const totalWalletBalances = wallets?.reduce((sum, w) => sum + (Number(w.balance) || 0), 0) || 0;

  // 3. Operations Today
  const { count: opsToday } = await supabase
    .from("transactions")
    .select("*", { count: 'exact', head: true })
    .gte("created_at", today.toISOString());

  // 4. Fees Collected Today (from earned_fees_balance in branches for better accuracy)
  const { data: branchFees } = await supabase
    .from("branches")
    .select("earned_fees_balance");
  const totalFees = branchFees?.reduce((sum, b) => sum + (Number(b.earned_fees_balance) || 0), 0) || 0;

  // 5. Alerts
  const alerts = {
    approachingLimit: wallets?.filter(w => {
        const balance = Number(w.balance) || 0;
        const limit = Number(w.daily_limit) || 0;
        return limit > 0 && (balance / limit) >= 0.9;
    }).map(w => ({
        id: w.id,
        name: w.name,
        percentage: Math.round((Number(w.balance) / Number(w.daily_limit)) * 100)
    })) || [],
    unavailable: wallets?.filter(w => !w.is_active_send || !w.is_active_receive).map(w => ({
        id: w.id,
        name: w.name,
        reason: !w.is_active_send && !w.is_active_receive ? "الإرسال والاستقبال" : !w.is_active_send ? "الإرسال" : "الاستقبال"
    })) || [],
    discrepancies: [] 
  };

  return {
    summary: {
      totalCashBalance,
      totalWalletBalances,
      opsToday: opsToday || 0,
      totalFeesToday: totalFees
    },
    alerts
  };
}

export async function createTransactionAction(formData: {
  id: string;
  walletId: string;
  employeeId: string;
  branchId: string;
  type: TransactionType;
  status: string;
  amount: number;
  feePercentage?: number;
  feeAmount?: number;
  toWalletId?: string;
  source?: string;
  notes?: string;
}) {
  const { error } = await supabase
    .from("transactions")
    .insert([{
      id: formData.id,
      wallet_id: formData.walletId,
      employee_id: formData.employeeId,
      branch_id: formData.branchId,
      type: formData.type,
      status: formData.status,
      amount: formData.amount,
      fee_percentage: formData.feePercentage || 0,
      fee: formData.feeAmount || 0,
      to_wallet_id: formData.toWalletId,
      source: formData.source,
      notes: formData.notes
    }]);

  if (error) throw error;

  // Log the creation
  await supabase.from("audit_logs").insert([{
    transaction_id: formData.id,
    operation_type: 'إنشاء معاملة',
    user_id: formData.employeeId,
    branch_id: formData.branchId,
    new_value: formData.amount,
    approval_status: formData.status,
    metadata: { type: formData.type, notes: formData.notes }
  }]);

  // Process financial impact if Approved
  if (formData.status === "Approved") {
    const amount = formData.amount;
    const fee = formData.feeAmount || 0;
    const walletId = formData.walletId;
    const branchId = formData.branchId;

      switch (formData.type) {
        case "Cash Out":
          // Wallet ↑, Cash ↓ (Amount - Fee), Fee Income ↑
          await supabase.rpc('increment_wallet_balance', { x: amount, row_id: walletId });
          await supabase.rpc('decrement_branch_cash', { x: (amount - fee), row_id: branchId });
          await supabase.rpc('increment_branch_fees', { x: fee, row_id: branchId });
          if (fee > 0) {
            await supabase.from("earned_fees_cash").insert([{
              transaction_id: formData.id,
              amount: fee,
              branch_id: branchId,
              date_time: new Date().toISOString()
            }]);
          }
          break;

        case "Cash In":
          // Cash ↑ (Amount - Fee), Wallet ↓ (Amount - Fee), Fee Income ↑
          // Following user's specific formula
          await supabase.rpc('increment_branch_cash', { x: (amount - fee), row_id: branchId });
          await supabase.rpc('decrement_wallet_balance', { x: (amount - fee), row_id: walletId });
          await supabase.rpc('increment_branch_fees', { x: fee, row_id: branchId });
          if (fee > 0) {
            await supabase.from("earned_fees_cash").insert([{
              transaction_id: formData.id,
              amount: fee,
              branch_id: branchId,
              date_time: new Date().toISOString()
            }]);
          }
          break;

      case "Incoming Transfer":
        // Wallet ↑
        await supabase.rpc('increment_wallet_balance', { x: amount, row_id: walletId });
        break;

      case "Internal Transfer":
        // Sender Wallet ↓, Receiver Wallet ↑, Fees Expense ↑ (if any)
        await supabase.rpc('decrement_wallet_balance', { x: amount, row_id: walletId });
        if (formData.toWalletId) {
          await supabase.rpc('increment_wallet_balance', { x: amount, row_id: formData.toWalletId });
        }
        if (fee > 0) {
          await supabase.rpc('decrement_branch_cash', { x: fee, row_id: branchId });
        }
        break;

      case "ATM/Bank Deposit":
        // Cash ↓, Wallet ↑, Fees Expense ↑
        await supabase.rpc('decrement_branch_cash', { x: amount, row_id: branchId });
        await supabase.rpc('increment_wallet_balance', { x: amount, row_id: walletId });
        if (fee > 0) {
          await supabase.rpc('decrement_branch_cash', { x: fee, row_id: branchId });
        }
        break;
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function updateTransactionStatusAction(params: {
  id: string;
  status: string;
  actionBy: string;
  rejectionReason?: string;
}) {
  const { data: transaction, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !transaction) throw new Error("Transaction not found");

  const { error } = await supabase
    .from("transactions")
    .update({ 
      status: params.status,
      // We might want to store who approved/rejected in the transactions table too, but for now we use audit logs
    })
    .eq("id", params.id);

  if (error) throw error;

  // Log the status change
  await supabase.from("audit_logs").insert([{
    transaction_id: params.id,
    operation_type: params.status === "Approved" ? "اعتماد المعاملة" : "رفض المعاملة",
    branch_id: transaction.branch_id,
    approval_status: params.status,
    action_by: params.actionBy,
    rejection_reason: params.rejectionReason,
    new_value: transaction.amount,
    metadata: { previous_status: transaction.status }
  }]);

  // If approved, process financial impact (reuse logic from createTransactionAction)
  if (params.status === "Approved" && transaction.status !== "Approved") {
    const amount = Number(transaction.amount);
    const fee = Number(transaction.fee) || 0;
    const walletId = transaction.wallet_id;
    const branchId = transaction.branch_id;

      switch (transaction.type) {
        case "Cash Out":
          await supabase.rpc('increment_wallet_balance', { x: amount, row_id: walletId });
          await supabase.rpc('decrement_branch_cash', { x: (amount - fee), row_id: branchId });
          await supabase.rpc('increment_branch_fees', { x: fee, row_id: branchId });
          if (fee > 0) {
            await supabase.from("earned_fees_cash").insert([{
              transaction_id: transaction.id,
              amount: fee,
              branch_id: branchId,
              date_time: new Date().toISOString()
            }]);
          }
          break;
        case "Cash In":
          await supabase.rpc('increment_branch_cash', { x: (amount - fee), row_id: branchId });
          await supabase.rpc('decrement_wallet_balance', { x: (amount - fee), row_id: walletId });
          await supabase.rpc('increment_branch_fees', { x: fee, row_id: branchId });
          if (fee > 0) {
            await supabase.from("earned_fees_cash").insert([{
              transaction_id: transaction.id,
              amount: fee,
              branch_id: branchId,
              date_time: new Date().toISOString()
            }]);
          }
          break;
      case "Incoming Transfer":
        await supabase.rpc('increment_wallet_balance', { x: amount, row_id: walletId });
        break;
      case "Internal Transfer":
        await supabase.rpc('decrement_wallet_balance', { x: amount, row_id: walletId });
        if (transaction.to_wallet_id) {
          await supabase.rpc('increment_wallet_balance', { x: amount, row_id: transaction.to_wallet_id });
        }
        if (fee > 0) {
          await supabase.rpc('decrement_branch_cash', { x: fee, row_id: branchId });
        }
        break;
      case "ATM/Bank Deposit":
        await supabase.rpc('decrement_branch_cash', { x: amount, row_id: branchId });
        await supabase.rpc('increment_wallet_balance', { x: amount, row_id: walletId });
        if (fee > 0) {
          await supabase.rpc('decrement_branch_cash', { x: fee, row_id: branchId });
        }
        break;
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/audit-logs");
}

export async function updateTransactionAction(params: {
  id: string;
  amount: number;
  userId: string;
  editReason: string;
}) {
  const { data: oldTransaction, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !oldTransaction) throw new Error("Transaction not found");

  const { error } = await supabase
    .from("transactions")
    .update({ 
      amount: params.amount,
      status: "Pending" // Reset status for re-approval if modified? Common pattern
    })
    .eq("id", params.id);

  if (error) throw error;

  // Log the edit
  await supabase.from("audit_logs").insert([{
    transaction_id: params.id,
    operation_type: "تعديل معاملة",
    user_id: params.userId,
    branch_id: oldTransaction.branch_id,
    old_value: oldTransaction.amount,
    new_value: params.amount,
    edit_reason: params.editReason,
    approval_status: "Pending",
    metadata: { previous_amount: oldTransaction.amount, new_amount: params.amount }
  }]);

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/audit-logs");
}

export async function getAuditLogsAction() {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      *,
      transactions (
        id,
        type,
        amount,
        status,
        created_at
      ),
      branches (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInitialTransactionDataAction() {
  const { data: branches } = await supabase.from("branches").select("*").limit(1);
  const { data: wallets } = await supabase.from("wallets").select("*");
  
  return {
    branch: branches?.[0] || null,
    wallets: wallets || []
  };
}
