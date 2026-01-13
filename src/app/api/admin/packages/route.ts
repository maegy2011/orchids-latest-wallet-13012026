import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = supabaseAdmin
    .from("packages")
    .select("*")
    .order("version", { ascending: false })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: packages, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(packages);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      type, 
      price, 
      duration_days, 
      includes_tax, 
      tax_type, 
      tax_rate, 
      renewal_policy, 
      trial_period_days,
      currency,
      status,
      max_wallets,
      max_branches,
      features
    } = body;

    const { data: newPackage, error } = await supabaseAdmin
      .from("packages")
      .insert({
        name,
        type,
        price,
        duration_days,
        includes_tax,
        tax_type,
        tax_rate,
        renewal_policy,
        trial_period_days,
        currency: currency || 'EGP',
        status: status || 'active',
        max_wallets,
        max_branches,
        features: features || [],
        version: 1,
        group_id: crypto.randomUUID()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newPackage);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
