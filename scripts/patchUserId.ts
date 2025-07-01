import admin from '../src/lib/firebaseAdmin'; // Use relative path for Node.js script

const db = admin.firestore();

async function patchUserIdOnCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const userId = data.userId || data.firebaseUid || null;
    if (!data.userId && userId) {
      await doc.ref.update({ userId });
      updated++;
      console.log(`Patched ${collectionName}/${doc.id} with userId: ${userId}`);
    }
  }
  console.log(`Patched ${updated} documents in ${collectionName}`);
}

async function main() {
  await patchUserIdOnCollection('babies');
  await patchUserIdOnCollection('orders');
  // Add more collections if needed
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
