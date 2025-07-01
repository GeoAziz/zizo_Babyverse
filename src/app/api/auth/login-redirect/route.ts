import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Not authenticated',
        redirectTo: '/login'
      }, { status: 401 });
    }

    // Check user role and redirect accordingly
    const userRole = (session.user as any).role;
    
    let redirectTo = '/profile'; // Default redirect for regular users
    
    if (userRole === 'ADMIN') {
      redirectTo = '/admin/dashboard';
    } else if (userRole === 'PARENT') {
      redirectTo = '/parent-dashboard';
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: userRole
      },
      redirectTo
    });

  } catch (error: any) {
    console.error('Login redirect error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process login redirect',
      error: error.message,
      redirectTo: '/login'
    }, { status: 500 });
  }
}