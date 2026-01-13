"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type CashTransactionType = 
  | "Transfer Between Accounts" 
  | "Transfer to Wallet" 
  | "Purchases" 
  | "Bills" 
  | "Rent" 
  | "Petty Cash" 
  | "Hospitality" 
  | "Others";

export async function createCashAccountAction(data: {
  status: string;
  openingBalance: number;
  branchName: string;
  branchId: string;
  employeeId: string;
}) {
  const { error } = await supabase
    .from("cash_accounts")
    .insert([{
      status: data.status,
      opening_balance: data.openingBalance,
      branch_name: data.branchName,
      branch_id: data.branchId,
      employee_id: data.employeeId,
      opened_at: new Date().toISOString()
    }]);

  if (error) throw error;
  revalidatePath("/cash");
}

export async function createCashTransactionAction(data: {
  walletId?: string;
  cashAccountId: string;
  employeeId: string;
  branchName: string;
  branchId: string;
  type: CashTransactionType;
  fundingSource: "Wallet" | "Cash";
  amount: number;
  notes?: string;
}) {
  const { error } = await supabase
    .from("cash_transactions")
    .insert([{
      wallet_id: data.walletId,
      cash_account_id: data.cashAccountId,
      employee_id: data.employeeId,
      branch_name: data.branchName,
      branch_id: data.branchId,
      type: data.type,
      funding_source: data.fundingSource,
      amount: data.amount,
      notes: data.notes,
      date: new Date().toISOString().split('T')[0]
    }]);

  if (error) throw error;

  // Process financial impact on cash account
  // If funding source is Cash, we decrease the cash account balance
  // If it's a transfer between accounts, it's more complex, but for now we follow simple logic
  if (data.fundingSource === "Cash") {
     // Decrease branch cash or cash account balance? 
     // The user says "رصيد حساب النقدية سوف ينقص/يزيد" in the main transactions,
     // but for "نموذج تسجيل معاملة جديدة" under "النقدية", they list types like Purchases, Bills, etc.
     // These are expenses, so they should decrease cash.
     await supabase.rpc('decrement_branch_cash', { x: data.amount, row_id: data.branchId });
  }

  revalidatePath("/cash");
}

export async function getCashAccountsAction(branchId: string) {
  const { data, error } = await supabase
    .from("cash_accounts")
    .select("*")
    .eq("branch_id", branchId);

  if (error) throw error;
  return data;
}

export async function getInitialCashDataAction() {
  const { data: branches } = await supabase.from("branches").select("*").limit(1);
  const { data: wallets } = await supabase.from("wallets").select("*");
  const { data: cashAccounts } = await supabase.from("cash_accounts").select("*");
  
  return {
    branch: branches?.[0] || null,
    wallets: wallets || [],
    cashAccounts: cashAccounts || []
  };
}
