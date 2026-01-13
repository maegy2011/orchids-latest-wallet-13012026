import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId, packageId } = await req.json();

    if (!userId || !packageId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current active subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*, packages(*)')
      .eq('profile_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    // Get new package details
    const { data: newPackage } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (!newPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    let remainingDays = 0;
    const now = new Date();

    if (currentSub && currentSub.end_date && new Date(currentSub.end_date) > now) {
      // If current is paid, add remaining days to new subscription
      if (currentSub.packages.type === 'paid') {
        const endDate = new Date(currentSub.end_date);
        remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    const newDurationDays = newPackage.duration_days + remainingDays;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + newDurationDays);

    // Deactivate current subscription
    if (currentSub) {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', currentSub.id);
    }

    // Create new subscription
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        profile_id: userId,
        package_id: packageId,
        start_date: now.toISOString(),
        end_date: newEndDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (subError) throw subError;

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: newPackage.name,
        subscription_status: 'active',
        subscription_end_date: newEndDate.toISOString()
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subData
    });

  } catch (error: any) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
