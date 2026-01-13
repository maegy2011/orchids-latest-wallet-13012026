import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string || `Imported Backup ${new Date().toISOString()}`;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const data = await file.text();

    // Check if the data starts with the IV format (hex:hex)
    if (!data.includes(':')) {
      return NextResponse.json({ error: "Invalid backup file format" }, { status: 400 });
    }

    const { data: backup, error } = await supabaseAdmin
      .from('backups')
      .insert({
        name,
        type: 'import',
        data,
        metadata: {
          imported_at: new Date().toISOString(),
          original_filename: file.name
        }
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(backup);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
