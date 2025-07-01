import { NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password } = validation.data;
    const db = admin.firestore();
    // Check if user already exists
    const userSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!userSnap.empty) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserRef = db.collection('users').doc();
    await newUserRef.set({
      name,
      email,
      passwordHash: hashedPassword,
      role: 'PARENT',
      userId: newUserRef.id, // Add userId for Firestore rules
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const userWithoutPassword = { id: newUserRef.id, name, email, role: 'PARENT' };
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ message: "Failed to register user" }, { status: 500 });
  }
}
