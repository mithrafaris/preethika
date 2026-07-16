import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function checkAdmin(request?: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return false;
  
  const decoded = verifyToken(token);
  return decoded && decoded.isadmin;
}
