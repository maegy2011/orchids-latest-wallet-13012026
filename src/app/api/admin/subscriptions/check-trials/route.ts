import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const now = new Date().toISOString();

    // 1. Find expired trial subscriptions
    const { data: expiredTrials, error } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        *,
        package:packages(*)
      `)
      .eq("status", "trial")
      .lt("end_date", now);

    if (error) throw error;

    const results = [];

    for (const sub of (expiredTrials || [])) {
      // Logic: If they haven't paid (we'll assume no payment for now as we don't have a payments check here yet, 
      // but the rule says: if not paid -> free)
      
      // Get the free package
      const { data: freePackage } = await supabaseAdmin
        .from("packages")
        .select("id")
        .eq("type", "free")
        .single();

      if (freePackage) {
        // Update subscription to free
        await supabaseAdmin
          .from("subscriptions")
          .update({
            package_id: freePackage.id,
            status: "active",
            start_date: now,
            // Add a long end date for free package or handle it as duration-based
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
            upgrade_log: [...(sub.upgrade_log || []), {
              from: sub.package_id,
              to: freePackage.id,
              date: now,
              reason: "trial_expired_no_payment"
            }]
          })
          .eq("id", sub.id);

        // Update profile status
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_plan: "free",
            subscription_status: "active"
          })
          .eq("id", sub.profile_id);

        results.push({ id: sub.id, transition: "trial -> free" });
      }
    }

    return NextResponse.json({ processed: results.length, details: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
