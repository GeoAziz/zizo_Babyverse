import { db, auth } from '@/lib/firebaseAdmin';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RecommendationService } from '@/lib/services/RecommendationService';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = admin.firestore();
    // Get user's active baby profile
    const babySnap = await db.collection('babies')
      .where('userId', '==', session.user.id)
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();
    const babyProfile = babySnap.empty
      ? null
      : {
          id: babySnap.docs[0].id,
          userId: babySnap.docs[0].data().userId,
          updatedAt: babySnap.docs[0].data().updatedAt instanceof Date
            ? babySnap.docs[0].data().updatedAt
            : babySnap.docs[0].data().updatedAt?.toDate?.() ?? null,
          createdAt: babySnap.docs[0].data().createdAt instanceof Date
            ? babySnap.docs[0].data().createdAt
            : babySnap.docs[0].data().createdAt?.toDate?.() ?? null,
          name: babySnap.docs[0].data().name,
          ageInMonths: babySnap.docs[0].data().ageInMonths,
          weightInKilograms: babySnap.docs[0].data().weightInKilograms ?? null,
          allergies: babySnap.docs[0].data().allergies ?? null,
          preferences: babySnap.docs[0].data().preferences ?? null,
        };

    // Get user preferences (if stored in a separate collection)
    const userSnap = await db.collection('users').doc(session.user.id).get();
    const user = userSnap.exists ? userSnap.data() : null;

    // Get order history
    const ordersSnap = await db.collection('orders')
      .where('userId', '==', session.user.id)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    const orderHistory = ordersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        status: data.status,
        userId: data.userId,
        createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() ?? null,
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() ?? null,
        totalAmount: data.totalAmount,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod ?? null,
        paymentStatus: data.paymentStatus ?? null,
        trackingNumber: data.trackingNumber ?? null,
        estimatedDelivery: data.estimatedDelivery instanceof Date ? data.estimatedDelivery : data.estimatedDelivery?.toDate?.() ?? null,
      };
    });

    // Generate contextual recommendations
    const recommendations = await RecommendationService.getContextualRecommendations(
      session.user.id,
      {
        babyProfile: babyProfile || undefined,
        userPreferences: user || undefined,
        orderHistory,
        seasonality: true,
      }
    );

    return Response.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations context:", error);
    return Response.json({ message: "Failed to fetch recommendations context" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { babyId, budget, preferences } = body;

    const db = admin.firestore();

    // Get specific baby profile if babyId provided and is a string
    let babyProfile: any = undefined;
    if (typeof babyId === 'string' && babyId) {
      const babyDoc = await db.collection('babies').doc(babyId).get();
      babyProfile = babyDoc.exists ? { id: babyDoc.id, ...babyDoc.data() } : undefined;
    }

    // Get user preferences from users collection
    const userSnap = await db.collection('users').doc(session.user.id).get();
    const userPreferences = userSnap.exists ? userSnap.data() : undefined;

    // Get order history
    const ordersSnap = await db.collection('orders')
      .where('userId', '==', session.user.id)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    const orderHistory = ordersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        status: data.status,
        userId: data.userId,
        createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() ?? null,
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() ?? null,
        totalAmount: data.totalAmount,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod ?? null,
        paymentStatus: data.paymentStatus ?? null,
        trackingNumber: data.trackingNumber ?? null,
        estimatedDelivery: data.estimatedDelivery instanceof Date ? data.estimatedDelivery : data.estimatedDelivery?.toDate?.() ?? null,
      };
    });

    // Generate recommendations with custom context
    const recommendations = await RecommendationService.getContextualRecommendations(
      session.user.id,
      {
        babyProfile: babyProfile || undefined,
        userPreferences: { ...(userPreferences || {}), ...preferences },
        orderHistory,
        seasonality: true,
        budget
      }
    );

    return Response.json(recommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : undefined;
    return Response.json(
      { message: errorMessage || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}