import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data: invoices, error } = await supabaseAdmin
    .from("invoices")
    .select(`
      *,
      profiles:customer_id (id, name, trading_name),
      packages:package_id (id, name),
      subscriptions:subscription_id (id, end_date)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      customer_id, 
      package_id, 
      subscription_id, 
      invoice_number,
      issue_date,
      due_date,
      amount_before_tax,
      tax_amount,
      total_amount,
      payment_method,
      status
    } = body;

    const { data, error } = await supabaseAdmin
      .from("invoices")
      .insert({
        customer_id,
        package_id,
        subscription_id,
        invoice_number,
        issue_date: issue_date || new Date().toISOString(),
        due_date,
        amount_before_tax,
        tax_amount,
        total_amount,
        payment_method,
        status: status || 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
