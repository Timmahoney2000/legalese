import { NextResponse } from 'next/server';
import { getUserPlanFromStripe } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  console.log('TEST ENDPOINT CALLED');
  console.log('Testing plan lookup for:', email);
  
  const plan = await getUserPlanFromStripe(email);
  
  console.log('Plan result:', plan);
  
  return NextResponse.json({ email, plan });
}