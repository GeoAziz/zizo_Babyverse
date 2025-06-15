
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role } from '@prisma/client';

// This route is specifically for admins to fetch all orders
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: "Forbidden: Admins only." }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          // select specific fields if needed, otherwise all are included by default
        },
        user: { // Include basic user info for display
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}
