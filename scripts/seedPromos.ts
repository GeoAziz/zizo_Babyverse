import admin from '@/lib/firebaseAdmin';

/**
 * Seed promo codes into Firestore 'promos' collection.
 * Each promo will have: code (doc id), type ('percentage'|'fixed'), value (number), expiresAt (timestamp), minCartValue (optional)
 */
async function seedPromos() {
  const db = admin.firestore();
  const promos = [
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
      minCartValue: 0,
      description: '10% off for new users',
    },
    {
      code: 'FIXED500',
      type: 'fixed',
      value: 500,
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
      minCartValue: 2000,
      description: 'KSH 500 off orders above KSH 2000',
    },
    {
      code: 'EXPIRED',
      type: 'percentage',
      value: 20,
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // expired
      minCartValue: 0,
      description: 'Expired promo for testing',
    },
  ];
  for (const promo of promos) {
    await db.collection('promos').doc(promo.code).set(promo);
    console.log(`Seeded promo: ${promo.code}`);
  }
  console.log('Promo seeding complete!');
}

if (require.main === module) {
  seedPromos().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}