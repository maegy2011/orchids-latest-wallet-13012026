import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { triggerAutoBackup } from "@/lib/backup-service";

export async function GET() {
  const { data: subscriptions, error } = await supabaseAdmin
    .from("subscriptions")
    .select(`
      *,
      profile:profiles(id, name, email),
      package:packages(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(subscriptions);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile_id, package_id, start_date, duration_days, auto_renew, status } = body;

    const startDate = start_date ? new Date(start_date) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (duration_days || 30));

    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        profile_id,
        package_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: auto_renew !== undefined ? auto_renew : true,
        status: status || 'active'
      })
      .select()
      .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await triggerAutoBackup("Change Package", { profile_id, package_id });

      return NextResponse.json(subscription);


  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
