import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { restoreBackup } from "@/lib/restore-service";

export async function POST(req: Request) {
  try {
    const { id, encryptedData } = await req.json();
    
    let dataToRestore = encryptedData;
    
    if (id) {
      const { data: backup, error } = await supabaseAdmin
        .from('backups')
        .select('data')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      dataToRestore = backup.data;
    }

    if (!dataToRestore) {
      return NextResponse.json({ error: "No backup data provided" }, { status: 400 });
    }

    const results = await restoreBackup(dataToRestore);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
