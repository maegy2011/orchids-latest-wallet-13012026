"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getEmployeesAction() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .in("role", ["employee", "admin"]);
  
  if (error) throw error;
  return data || [];
}

export async function getBranchesAction() {
  const { data, error } = await supabase
    .from("branches")
    .select("id, name");
  
  if (error) throw error;
  return data || [];
}

export async function getWalletsAction() {
  const { data, error } = await supabase
    .from("wallets")
    .select(`
      *,
      branches (name),
      profiles:responsible_employee_id (name)
    `)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createWalletAction(walletData: {
  id: string;
  name: string;
  provider: string;
  status: string;
  simNumber?: string;
  ownerName?: string;
  nationalId?: string;
  openingDate: string;
  openingBalance: number;
  balance: number;
  minTransactionAmount: number;
  maxTransactionAmount: number;
  commissionPercentage: number;
  minCommission: number;
  maxCommission: number;
  dailyLimit: number;
  monthlyLimit: number;
  receiveOnlyThreshold: number;
  sendOnlyThreshold: number;
  responsibleEmployeeId: string | null;
  branchId: string;
  isActiveSend: boolean;
  isActiveReceive: boolean;
}) {
  const { error } = await supabase
    .from("wallets")
    .insert([{
      id: walletData.id,
      name: walletData.name,
      provider: walletData.provider,
      status: walletData.status,
      sim_number: walletData.simNumber,
      owner_name: walletData.ownerName,
      national_id: walletData.nationalId,
      opening_date: walletData.openingDate,
      opening_balance: walletData.openingBalance,
      balance: walletData.balance,
      min_transaction_amount: walletData.minTransactionAmount,
      max_transaction_amount: walletData.maxTransactionAmount,
      commission_percentage: walletData.commissionPercentage,
      min_commission: walletData.minCommission,
      max_commission: walletData.maxCommission,
      daily_limit: walletData.dailyLimit,
      monthly_limit: walletData.monthlyLimit,
      receive_only_threshold: walletData.receiveOnlyThreshold,
      send_only_threshold: walletData.sendOnlyThreshold,
      responsible_employee_id: walletData.responsibleEmployeeId,
      branch_id: walletData.branchId,
      is_active_send: walletData.isActiveSend,
      is_active_receive: walletData.isActiveReceive
    }]);

  if (error) throw error;
  
  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  return { success: true };
}
