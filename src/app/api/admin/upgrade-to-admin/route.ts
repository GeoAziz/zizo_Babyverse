import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Upgrading user to admin...');

    const adminEmail = 'admin@babyverse.com';
    
    // Find user by email in Firestore
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: 'User not found. Please sign up with admin@babyverse.com first',
        instructions: [
          '1. Go to your app homepage',
          '2. Click "Sign Up" or "Login"', 
          '3. Create account with email: admin@babyverse.com',
          '4. Use any password you want',
          '5. After signup, come back and try this upgrade again'
        ]
      }, { status: 404 });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Check if already admin
    if (userData.role === 'ADMIN') {
      return NextResponse.json({
        success: true,
        message: 'User is already an admin!',
        user: {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          firebaseUid: userData.firebaseUid
        }
      });
    }

    // Update user to admin role
    await userDoc.ref.update({
      role: 'ADMIN',
      updatedAt: new Date()
    });

    console.log('✅ User upgraded to admin successfully');

    return NextResponse.json({
      success: true,
      message: 'User successfully upgraded to admin! 🎉',
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: 'ADMIN',
        firebaseUid: userData.firebaseUid
      },
      instructions: [
        '✅ Admin role has been set',
        '🔐 You can now access admin features',
        '📋 Admin can update order statuses',
        '👥 Admin can view all user orders'
      ]
    });

  } catch (error: any) {
    console.error('❌ Error upgrading user to admin:', error);
    return NextResponse.json({
      success: false,
      message: 'Error upgrading user to admin',
      error: error.message
    }, { status: 500 });
  }
}

// GET method to check if user can be upgraded
export async function GET(request: NextRequest) {
  try {
    const adminEmail = 'admin@babyverse.com';
    
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({
        canUpgrade: false,
        message: 'No user found with admin email',
        adminEmail
      });
    }

    const userData = usersSnapshot.docs[0].data();
    
    return NextResponse.json({
      canUpgrade: userData.role !== 'ADMIN',
      currentRole: userData.role || 'USER',
      adminEmail,
      message: userData.role === 'ADMIN' ? 'User is already admin' : 'User can be upgraded to admin'
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
