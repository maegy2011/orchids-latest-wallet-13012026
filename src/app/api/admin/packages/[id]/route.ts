import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { data: pkg, error } = await supabaseAdmin
    .from("packages")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(pkg);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    
    // Get current package
    const { data: currentPackage, error: getError } = await supabaseAdmin
      .from("packages")
      .select("*")
      .eq("id", params.id)
      .single();

    if (getError) {
      return NextResponse.json({ error: getError.message }, { status: 404 });
    }

    // Check if we should create a new version
    // We create a new version if price, duration, limits or features change
    const hasCriticalChanges = 
      (body.price !== undefined && Number(body.price) !== Number(currentPackage.price)) ||
      (body.duration_days !== undefined && body.duration_days !== currentPackage.duration_days) ||
      (body.max_wallets !== undefined && body.max_wallets !== currentPackage.max_wallets) ||
      (body.max_branches !== undefined && body.max_branches !== currentPackage.max_branches) ||
      (body.features !== undefined);

    if (hasCriticalChanges) {
      // 1. Archive current version
      await supabaseAdmin
        .from("packages")
        .update({ status: 'archived' })
        .eq("id", params.id);

      // 2. Create new version
      const { data: newPackage, error: insertError } = await supabaseAdmin
        .from("packages")
        .insert({
          ...currentPackage,
          ...body,
          id: undefined, // Let DB generate new UUID
          version: (currentPackage.version || 1) + 1,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }

      return NextResponse.json(newPackage);
    } else {
      // Non-critical change, update in place
      const { data: updatedPackage, error: updateError } = await supabaseAdmin
        .from("packages")
        .update(body)
        .eq("id", params.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      return NextResponse.json(updatedPackage);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from("packages")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Package deleted successfully" });
}
