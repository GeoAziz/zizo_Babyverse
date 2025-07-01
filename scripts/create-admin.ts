import admin from '@/lib/firebaseAdmin';

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...');

    const adminEmail = 'admin@babyverse.com';
    const adminPassword = 'Admin123!@#'; // Change this to a secure password
    const adminName = 'Zizo BabyVerse Admin';

    // Check if admin user already exists in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(adminEmail);
      console.log('✅ Admin user already exists in Firebase Auth');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create user in Firebase Auth
        firebaseUser = await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: adminName,
          emailVerified: true,
        });
        console.log('✅ Created admin user in Firebase Auth');
      } else {
        throw error;
      }
    }

    // Create/Update user document in Firestore
    const db = admin.firestore();
    const userDoc = db.collection('users').doc(firebaseUser.uid);
    
    const userData = {
      email: adminEmail,
      name: adminName,
      firebaseUid: firebaseUser.uid,
      emailVerified: new Date(),
      image: null,
      role: 'ADMIN', // This is the key - setting admin role
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userDoc.set(userData, { merge: true });
    console.log('✅ Created/Updated admin user in Firestore');

    // Set custom claims for additional security
    await admin.auth().setCustomUserClaims(firebaseUser.uid, {
      role: 'ADMIN',
      admin: true,
    });
    console.log('✅ Set custom claims for admin user');

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 UID:', firebaseUser.uid);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('🔐 You can now login with these credentials and access admin features.');

    return {
      success: true,
      uid: firebaseUser.uid,
      email: adminEmail,
    };

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default createAdminUser;