import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Checking for existing admin user...');

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
        message: 'Admin user not found. Please follow the manual setup process.',
        instructions: [
          '1. Go to your app and sign up with: admin@babyverse.com',
          '2. Use any password you prefer',
          '3. After signup, visit /admin-setup-simple.html',
          '4. Click "Upgrade to Admin" to complete the setup'
        ]
      }, { status: 404 });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.role === 'ADMIN') {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists and is properly configured!',
        user: {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          firebaseUid: userData.firebaseUid
        }
      });
    }

    // Upgrade to admin if not already
    await userDoc.ref.update({
      role: 'ADMIN',
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'User successfully upgraded to admin!',
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: 'ADMIN',
        firebaseUid: userData.firebaseUid
      }
    });

  } catch (error: any) {
    console.error('❌ Error in admin setup:', error);
    return NextResponse.json({
      success: false,
      message: 'Error during admin setup',
      error: error.message
    }, { status: 500 });
  }
}

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
        adminExists: false,
        message: 'No admin user found',
        adminEmail
      });
    }

    const userData = usersSnapshot.docs[0].data();
    
    return NextResponse.json({
      adminExists: true,
      isAdmin: userData.role === 'ADMIN',
      currentRole: userData.role || 'USER',
      adminEmail,
      user: {
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      adminExists: false
    }, { status: 500 });
  }
}