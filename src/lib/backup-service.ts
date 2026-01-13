import { supabaseAdmin } from "@/lib/supabase-admin";
import { encrypt } from "@/lib/crypto";

export async function createBackup(name: string, type: string = 'manual', createdBy?: string) {
  // Fetch data from all tables
  const tables = [
    'profiles', 'branches', 'messages', 'wallets', 
    'invoices', 'transactions', 'packages', 'subscriptions', 'activity_logs'
  ];

  const backupData: Record<string, any> = {};

  for (const table of tables) {
    const { data, error } = await supabaseAdmin.from(table).select('*');
    if (error) {
      console.error(`Error fetching data from ${table}:`, error);
      continue;
    }
    backupData[table] = data;
  }

  const jsonString = JSON.stringify(backupData);
  const encryptedData = encrypt(jsonString);

  const { data: backup, error: backupError } = await supabaseAdmin
    .from('backups')
    .insert({
      name,
      type,
      data: encryptedData,
      created_by: createdBy,
      metadata: {
        table_counts: Object.fromEntries(
          Object.entries(backupData).map(([k, v]) => [k, v.length])
        ),
        timestamp: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (backupError) throw backupError;
  return backup;
}

export async function triggerAutoBackup(eventName: string, metadata?: any) {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const name = `Auto: ${eventName} (${timestamp})`;
    return await createBackup(name, 'automatic');
  } catch (error) {
    console.error("Auto backup failed:", error);
  }
}
