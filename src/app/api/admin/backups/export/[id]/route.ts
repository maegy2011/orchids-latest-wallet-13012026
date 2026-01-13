import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const { data: backup, error } = await supabaseAdmin
      .from('backups')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    // Return the encrypted data as a file
    const filename = `${backup.name.replace(/\s+/g, '_')}_${new Date(backup.created_at).getTime()}.bak`;
    
    return new NextResponse(backup.data, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
