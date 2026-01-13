import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createBackup } from "@/lib/backup-service";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('backups')
    .select('id, name, created_at, type, created_by, metadata')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const backup = await createBackup(name || `Manual Backup ${new RegExp(/(\d{4}-\d{2}-\d{2})/).exec(new Date().toISOString())?.[0]}`, 'manual');
    return NextResponse.json(backup);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
