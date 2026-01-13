"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout} 
      className="bg-white dark:bg-zinc-900 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-zinc-200 dark:border-zinc-800"
    >
      <LogOut className="h-4 w-4 ml-2" />
      تسجيل الخروج
    </Button>
  );
}
