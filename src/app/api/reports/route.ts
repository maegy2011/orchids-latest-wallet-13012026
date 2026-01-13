import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    if (type === "wallet-balances") {
      const { data, error } = await supabaseAdmin
        .from("wallets")
        .select("id, name, provider, balance, currency, status, sim_number, owner_name")
        .order("name");
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === "daily-cash") {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabaseAdmin
        .from("cash_accounts")
        .select(`
          id, 
          branch_name, 
          opening_balance, 
          status,
          created_at
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // In a real scenario, we'd calculate current balance based on transactions
      // For now, returning the accounts. 
      return NextResponse.json(data);
    }

    if (type === "earned-fees") {
      const { data, error } = await supabaseAdmin
        .from("earned_fees_cash")
        .select(`
          id,
          amount,
          date_time,
          parent_transaction_id,
          branch_id
        `)
        .order("date_time", { ascending: false });
      
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === "rejected-modified") {
      const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select("*")
        .or("operation_type.eq.UPDATE,approval_status.eq.rejected")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === "limit-violations") {
      // This is a more complex report. We check wallets where current usage is near or over limits.
      // For simplicity, we'll return wallets and their limits, and maybe some metadata if we had a violations table.
      // Since we don't have a violations table, we'll return wallets that have low remaining limits.
      const { data: wallets, error: wError } = await supabaseAdmin
        .from("wallets")
        .select("id, name, balance, daily_limit, monthly_limit");
      
      if (wError) throw wError;

      // Filter wallets that are at or over 90% of their daily or monthly limit
      // (This is a simplified logic for the report)
      const violations = wallets.filter(w => {
        if (w.daily_limit && Number(w.balance) >= Number(w.daily_limit) * 0.9) return true;
        if (w.monthly_limit && Number(w.balance) >= Number(w.monthly_limit) * 0.9) return true;
        return false;
      });

      return NextResponse.json(violations);
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    console.error("Report error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
