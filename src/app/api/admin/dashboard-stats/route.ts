import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // 1. General Stats
    const { count: totalCustomers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: 'exact', head: true })
      .eq("role", "customer");

    const { count: activeCustomers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: 'exact', head: true })
      .eq("role", "customer")
      .eq("account_status", "active");

    const { count: inactiveCustomers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: 'exact', head: true })
      .eq("role", "customer")
      .neq("account_status", "active");

    // 2. Financial Stats
    const { data: invoices, error: invError } = await supabaseAdmin
      .from("invoices")
      .select("status, total_amount");

    if (invError) throw invError;

      const totalInvoicesCount = invoices.length;
      const totalInvoicesValue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      const paidPayments = invoices
        .filter(inv => inv.status === 'paid' || inv.status === 'مسددة' || inv.status === 'تم الدفع')
        .reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      
      // Arrears is everything not paid
      const arrears = totalInvoicesValue - paidPayments;

      // 3. Technical Stats
      const { count: loginsCount } = await supabaseAdmin
        .from("activity_logs")
        .select("*", { count: 'exact', head: true })
        .eq("action", "login");

      // System activity: all actions in the last 7 days for a better overview
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: systemActivityCount } = await supabaseAdmin
        .from("activity_logs")
        .select("*", { count: 'exact', head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      return NextResponse.json({
        general: {
          totalCustomers: totalCustomers || 0,
          activeCustomers: activeCustomers || 0,
          inactiveCustomers: inactiveCustomers || 0
        },
        financial: {
          totalInvoicesCount,
          totalInvoicesValue,
          paidPayments,
          overdueAmount: arrears // Using arrears as requested
        },
      technical: {
        loginsCount: loginsCount || 0,
        systemActivityCount: systemActivityCount || 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
