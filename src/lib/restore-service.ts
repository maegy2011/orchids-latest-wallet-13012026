import { supabaseAdmin } from "@/lib/supabase-admin";
import { decrypt } from "@/lib/crypto";

export async function restoreBackup(encryptedData: string) {
  const jsonString = decrypt(encryptedData);
  const backupData = JSON.parse(jsonString);

  // Order matters for foreign keys
  // Generally: packages -> profiles -> branches -> subscriptions -> invoices -> transactions -> others
  const tables = [
    'packages',
    'profiles',
    'branches',
    'subscriptions',
    'wallets',
    'invoices',
    'transactions',
    'messages',
    'activity_logs'
  ];

  const results: Record<string, any> = {};

  // We should do this in a transaction if possible, but supabase-js doesn't support complex transactions across tables easily
  // We'll do it table by table.
  // CRITICAL: We should probably truncate or delete in REVERSE order first
  for (const table of [...tables].reverse()) {
    if (backupData[table]) {
      const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      if (error) {
        console.error(`Error clearing table ${table}:`, error);
      }
    }
  }

  // Insert in order
  for (const table of tables) {
    if (backupData[table] && backupData[table].length > 0) {
      const { error } = await supabaseAdmin.from(table).insert(backupData[table]);
      if (error) {
        console.error(`Error restoring table ${table}:`, error);
        results[table] = { status: 'error', message: error.message };
      } else {
        results[table] = { status: 'success', count: backupData[table].length };
      }
    }
  }

  return results;
}
