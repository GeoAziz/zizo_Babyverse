import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        // Get date for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Parallel fetch all required data
        const [orders, users, products, ageGroups, topProducts] = await Promise.all([
            // Orders data with items for revenue calculation
            prisma.order.findMany({
                where: { createdAt: { gte: sixMonthsAgo } },
                include: { items: true },
            }),
            // User growth data
            prisma.user.findMany({
                where: { createdAt: { gte: sixMonthsAgo } },
                select: { id: true, createdAt: true, role: true }
            }),
            // Product inventory status
            prisma.product.findMany({
                where: { stock: { lte: 10 } }, // Low stock alert threshold
                select: { id: true, name: true, stock: true }
            }),
            // Age group distribution from babies table
            prisma.baby.groupBy({
                by: [Prisma.BabyScalarFieldEnum.ageInMonths],
                _count: { id: true }
            }),
            // Top selling products
            prisma.orderItem.groupBy({
                by: ['productId', 'name'],
                _sum: { quantity: true },
                _count: { id: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            })
        ]);

        // Process monthly data
        const monthlyData = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.toLocaleString('default', { month: 'short' });
            
            const monthOrders = orders.filter(order => 
                order.createdAt.getMonth() === date.getMonth() &&
                order.createdAt.getFullYear() === date.getFullYear()
            );
            
            const monthUsers = users.filter(user =>
                user.createdAt.getMonth() === date.getMonth() &&
                user.createdAt.getFullYear() === date.getFullYear()
            );

            const revenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

            return {
                name: month,
                sales: revenue,
                orders: monthOrders.length,
                users: monthUsers.length
            };
        }).reverse();

        // Calculate region data
        const regionData = await prisma.order.groupBy({
            by: ['shippingAddress'],
            _sum: { totalAmount: true },
            _count: { id: true }
        });

        // Process and format response data
        return NextResponse.json({
            monthlyData,
            ageGroups: ageGroups.map(group => ({
                name: group.ageInMonths?.toString() || 'Unknown',
                value: group._count.id
            })),
            regionData: regionData.map(region => {
                const address = typeof region.shippingAddress === 'string' 
                    ? JSON.parse(region.shippingAddress)
                    : region.shippingAddress;
                return {
                    name: address?.city || 'Unknown',
                    sales: region._sum.totalAmount || 0,
                    orders: region._count.id
                };
            }),
            inventory: {
                lowStock: products.length,
                items: products.map(p => ({
                    name: p.name,
                    stock: p.stock
                }))
            },
            topProducts: topProducts.map(p => ({
                name: p.name,
                quantity: p._sum.quantity,
                orders: p._count.id
            })),
            summary: {
                totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
                totalOrders: orders.length,
                totalUsers: users.length,
                averageOrderValue: orders.length ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ message: "Failed to fetch analytics" }, { status: 500 });
    }
}