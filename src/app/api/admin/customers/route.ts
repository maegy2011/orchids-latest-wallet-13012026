import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data: customers, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      trading_name, 
      customer_type, 
      email, 
      mobile, 
      governorate, 
      city, 
      street,
      password 
    } = body;

    // 1. Create User in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Get the default Pro package for trial
    const { data: proPackage } = await supabaseAdmin
      .from("packages")
      .select("id")
      .eq("name", "الباقة الاحترافية (برو)")
      .single();

    const packageId = proPackage?.id || "0da7585d-55b9-4fa4-ba72-b714558dd162";

    // 3. Update Profile with details
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
        .update({
          name,
          trading_name,
          customer_type,
          email,
          mobile,
          governorate,
          city,
          street,
          currency: 'EGP',
          subscription_plan: 'pro',
          subscription_status: 'trialing',
          force_password_change: true,
          account_status: 'active'
        })
      .eq("id", userId);

    if (profileError) {
      // Cleanup auth user if profile update fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 4. Create Trial Subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    await supabaseAdmin
      .from("subscriptions")
      .insert({
        profile_id: userId,
        package_id: packageId,
        start_date: new Date().toISOString(),
        end_date: trialEndDate.toISOString(),
        status: 'trial',
        auto_renew: true
      });

    // 5. Update subscription_end_date in profiles for compatibility
    await supabaseAdmin
      .from("profiles")
      .update({ subscription_end_date: trialEndDate.toISOString() })
      .eq("id", userId);

    // 6. Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: userId,
      action: "account_created",
      metadata: { created_by: "admin", trial_end: trialEndDate }
    });

    return NextResponse.json({ id: userId, message: "Customer created successfully" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
