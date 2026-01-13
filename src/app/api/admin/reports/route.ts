import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "revenue") {
    // Total Revenue
    const { data: paidInvoices, error } = await supabaseAdmin
      .from("invoices")
      .select("total_amount")
      .eq("status", "paid");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const total = paidInvoices.reduce((acc, inv) => acc + Number(inv.total_amount), 0);
    return NextResponse.json({ total });
  }

  if (type === "overdue") {
    // Overdue Report
    const { data: overdueInvoices, error } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        profiles:customer_id (name, trading_name)
      `)
      .eq("status", "overdue");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const totalOverdue = overdueInvoices.reduce((acc, inv) => acc + Number(inv.total_amount), 0);
    return NextResponse.json({ 
      total: totalOverdue,
      count: overdueInvoices.length,
      invoices: overdueInvoices
    });
  }

  if (type === "monthly") {
    // Monthly Revenue (last 6 months)
    const { data: invoices, error } = await supabaseAdmin
      .from("invoices")
      .select("total_amount, payment_date")
      .eq("status", "paid")
      .not("payment_date", "is", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const monthlyData: Record<string, number> = {};
    invoices.forEach(inv => {
      const date = new Date(inv.payment_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + Number(inv.total_amount);
    });

    return NextResponse.json(monthlyData);
  }

  // Summary for dashboard
  const { data: allInvoices, error: allErr } = await supabaseAdmin.from("invoices").select("status, total_amount");
  if (allErr) return NextResponse.json({ error: allErr.message }, { status: 500 });

  const summary = {
    paid: allInvoices.filter(i => i.status === 'paid').reduce((a, b) => a + Number(b.total_amount), 0),
    overdue: allInvoices.filter(i => i.status === 'overdue').reduce((a, b) => a + Number(b.total_amount), 0),
    pending: allInvoices.filter(i => i.status === 'pending').reduce((a, b) => a + Number(b.total_amount), 0)
  };

  return NextResponse.json(summary);
}
