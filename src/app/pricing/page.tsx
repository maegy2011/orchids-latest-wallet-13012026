import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { PricingContent } from '@/components/PricingContent';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export default async function PricingPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  
  let userId: string | undefined;
  let email: string | undefined;

  if (accessToken) {
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    userId = user?.id;
    email = user?.email;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingHeader />
      <main className="flex-1">
        <PricingContent userId={userId} email={email} />
      </main>
      <MarketingFooter />
    </div>
  );
}
