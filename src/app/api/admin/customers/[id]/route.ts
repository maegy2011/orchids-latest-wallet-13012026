import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { triggerAutoBackup } from "@/lib/backup-service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 404 });
  }

  const { data: logs, error: logsError } = await supabaseAdmin
    .from("activity_logs")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ profile, logs: logs || [] });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, ...updates } = body;

    // Handle Archive Constraint
    if (updates.account_status === 'archived') {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("subscription_status, subscription_end_date")
        .eq("id", id)
        .single();

      const isActive = profile?.subscription_status === 'active' || 
                       (profile?.subscription_end_date && new Date(profile.subscription_end_date) > new Date());
      
      if (isActive) {
        return NextResponse.json({ 
          error: "لا يمكن أرشفة الحساب لوجود اشتراك نشط" 
        }, { status: 400 });
      }
    }

    // Handle Password Reset
    if (action === 'reset_password_manual') {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        password: updates.password
      });
      if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
      
      await supabaseAdmin.from("profiles").update({ force_password_change: true }).eq("id", id);
      
      await supabaseAdmin.from("activity_logs").insert({
        user_id: id,
        action: "password_reset_manual",
        metadata: { by: "admin" }
      });

      return NextResponse.json({ message: "Password updated successfully" });
    }

    if (action === 'send_reset_link') {
      const { data: profile } = await supabaseAdmin.from("profiles").select("email").eq("id", id).single();
      const { data, error: authError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: profile?.email || ''
      });
      if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

      await supabaseAdmin.from("activity_logs").insert({
        user_id: id,
        action: "reset_link_generated",
        metadata: { by: "admin" }
      });

      return NextResponse.json({ message: "Reset link generated", link: data.properties.action_link });
    }

    // Default Profile Update
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (updates.account_status === 'archived') {
      await triggerAutoBackup("Archive Customer", { customer_id: id });
    }

    await supabaseAdmin.from("activity_logs").insert({
      user_id: id,
      action: "profile_updated",
      metadata: updates
    });

    return NextResponse.json({ message: "Updated successfully" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Trigger backup before deletion
    await triggerAutoBackup("Delete Customer", { customer_id: id });

    // Delete from profiles (cascades or manual depending on DB setup)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

    // Delete from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) console.error("Error deleting auth user:", authError);

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
