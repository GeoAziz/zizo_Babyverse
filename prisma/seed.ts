// ARCHIVED: Prisma seed script is no longer used. Firestore is now the database.

import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to convert KSh to a conceptual USD value (e.g., KSh 100 = $1)
function kshToConceptualUsd(ksh: number): number {
  return parseFloat((ksh / 100).toFixed(2));
}

async function main() {
  console.log('Start seeding...');

  // --- Create Users ---
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@babyverse.com' },
    update: {},
    create: {
      email: 'admin@babyverse.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const customerPassword = await bcrypt.hash('CustPass123!', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@babyverse.com' },
    update: {},
    create: {
      email: 'customer@babyverse.com',
      name: 'Test Customer',
      passwordHash: customerPassword,
      role: Role.PARENT,
    },
  });

  console.log(`Created basic users`);

  // Define all products
  const allProducts = [
    // Baby Clothing Products
    {
      name: "Organic Cotton Onesie - Stars",
      price: 12.99,
      description: "Soft organic cotton onesie with adorable star patterns",
      category: "Baby Clothing",
      stock: 100,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-12M",
      ecoTag: true,
      features: "100% Organic Cotton, Snap Closures",
      targetAudience: "Infants",
      keywords: "onesie, organic, cotton, stars"
    },
    {
      name: "Cozy Baby Socks Set (5 pairs)",
      price: 8.99,
      description: "Soft and stretchy socks in various colors",
      category: "Baby Clothing",
      stock: 150,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-24M",
      features: "Non-slip soles, Stretchy cuffs",
      targetAudience: "Babies and Toddlers",
      keywords: "socks, baby, cozy"
    },
    {
      name: "Baby Winter Jumpsuit",
      price: 34.99,
      description: "Warm winter jumpsuit with hood",
      category: "Baby Clothing",
      stock: 50,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "3-24M",
      features: "Fleece Lined, Water Resistant",
      keywords: "clothing, winter, jumpsuit"
    },
    {
      name: "Summer Dress Set",
      price: 29.99,
      description: "2-piece summer dress set with bloomers",
      category: "Baby Clothing",
      stock: 75,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "6-24M",
      features: "Breathable Cotton, Button Closure",
      targetAudience: "Babies and Toddlers",
      keywords: "clothing, dress, summer"
    },
    {
      name: "Baby Socks Collection",
      price: 12.99,
      description: "Set of 6 pairs of baby socks",
      category: "Baby Clothing",
      stock: 150,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-12M",
      features: "Anti-slip Soles, Stretchy Material",
      keywords: "clothing, socks"
    },
    {
      name: "Infant Cardigan",
      price: 19.99,
      description: "Soft knit cardigan for babies",
      category: "Baby Clothing",
      stock: 60,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "3-18M",
      features: "Button Front, Machine Washable",
      keywords: "clothing, cardigan, sweater"
    },
    {
      name: "Baby Pants 3-Pack",
      price: 27.99,
      description: "Set of 3 comfortable baby pants",
      category: "Baby Clothing",
      stock: 85,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "6-24M",
      features: "Elastic Waistband, Cotton Blend",
      keywords: "clothing, pants"
    },
    {
      name: "Special Occasion Outfit",
      price: 44.99,
      description: "Formal outfit for special events",
      category: "Baby Clothing",
      stock: 40,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "6-24M",
      features: "2-Piece Set, Premium Fabric",
      keywords: "clothing, formal, special"
    },
    {
      name: "Baby Sleepwear Set",
      price: 22.99,
      description: "Cozy sleepwear set with footies",
      category: "Baby Clothing",
      stock: 90,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-18M",
      features: "Full Zip, Non-slip Feet",
      keywords: "clothing, sleepwear, pajamas"
    },
    {
      name: "Newborn Essentials Kit",
      price: 49.99,
      description: "Complete clothing kit for newborns",
      category: "Baby Clothing",
      stock: 45,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-3M",
      features: "7-Piece Set, Hospital Ready",
      keywords: "clothing, newborn, essentials"
    },
    {
      name: "Baby Beanie Set",
      price: 14.99,
      description: "Set of 3 soft baby beanies",
      category: "Baby Clothing",
      stock: 120,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-12M",
      features: "Stretchy Fit, Different Colors",
      keywords: "clothing, hat, beanie"
    },

    // Baby Gear & Accessories (10 products)
    {
      name: "Deluxe Travel Stroller",
      price: 299.99,
      description: "Premium lightweight travel stroller",
      category: "Baby Gear & Accessories",
      stock: 30,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-4Y",
      features: "One-hand Fold, Reclining Seat",
      keywords: "gear, stroller, travel"
    },
    {
      name: "Convertible Car Seat",
      price: 199.99,
      description: "3-in-1 convertible car seat",
      category: "Baby Gear & Accessories",
      stock: 25,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-7Y",
      features: "5-Point Harness, Side Impact Protection",
      keywords: "gear, car seat, safety"
    },
    {
      name: "Baby Carrier",
      price: 89.99,
      description: "Ergonomic baby carrier with multiple positions",
      category: "Baby Gear & Accessories",
      stock: 50,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-3Y",
      features: "Adjustable Straps, Breathable Mesh",
      keywords: "gear, carrier"
    },
    {
      name: "Diaper Bag Backpack",
      price: 69.99,
      description: "Spacious diaper bag with multiple compartments",
      category: "Baby Gear & Accessories",
      stock: 60,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Insulated Pockets, Changing Pad",
      keywords: "gear, diaper bag"
    },
    {
      name: "Baby Monitor",
      price: 159.99,
      description: "Digital video baby monitor",
      category: "Baby Gear & Accessories",
      stock: 40,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Night Vision, Two-way Audio",
      keywords: "gear, monitor, safety"
    },
    {
      name: "Play Yard",
      price: 129.99,
      description: "Portable play yard with bassinet",
      category: "Baby Gear & Accessories",
      stock: 35,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-2Y",
      features: "Easy Setup, Travel Bag",
      keywords: "gear, play yard, portable"
    },
    {
      name: "Baby Swing",
      price: 149.99,
      description: "Electric baby swing with music",
      category: "Baby Gear & Accessories",
      stock: 30,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-12M",
      features: "6 Swing Speeds, Music",
      keywords: "gear, swing"
    },
    {
      name: "Baby Bouncer",
      price: 79.99,
      description: "Comfortable baby bouncer seat",
      category: "Baby Gear & Accessories",
      stock: 45,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-2Y",
      features: "Vibration, Toy Bar",
      keywords: "gear, bouncer"
    },
    {
      name: "High Chair",
      price: 119.99,
      description: "Adjustable high chair with tray",
      category: "Baby Gear & Accessories",
      stock: 40,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "6M-3Y",
      features: "3-Position Recline, Washable",
      keywords: "gear, high chair"
    },
    {
      name: "Baby Gate",
      price: 49.99,
      description: "Expandable safety gate",
      category: "Baby Gear & Accessories",
      stock: 55,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Easy Install, Auto-Close",
      keywords: "gear, gate, safety"
    },

    // Feeding & Nursing Products (10 products)
    {
      name: "Premium Baby Bottles Set",
      price: 29.99,
      description: "Set of 3 anti-colic baby bottles",
      category: "Feeding & Nursing",
      stock: 80,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-12M",
      features: "Anti-colic, BPA-free",
      keywords: "feeding, bottles"
    },
    {
      name: "Electric Breast Pump",
      price: 159.99,
      description: "Double electric breast pump",
      category: "Feeding & Nursing",
      stock: 40,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Dual Expression, Adjustable Suction",
      keywords: "feeding, breast pump"
    },
    {
      name: "Baby Formula Dispenser",
      price: 24.99,
      description: "Portable formula dispenser",
      category: "Feeding & Nursing",
      stock: 100,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-12M",
      features: "3 Compartments, Travel-friendly",
      keywords: "feeding, formula"
    },
    {
      name: "Nursing Pillow",
      price: 39.99,
      description: "Ergonomic nursing support pillow",
      category: "Feeding & Nursing",
      stock: 60,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-12M",
      features: "Machine Washable, Ergonomic Design",
      keywords: "feeding, nursing pillow"
    },
    {
      name: "Baby Food Maker",
      price: 89.99,
      description: "All-in-one baby food processor",
      category: "Feeding & Nursing",
      stock: 45,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "6M+",
      features: "Steam & Blend, Dishwasher Safe",
      keywords: "feeding, food maker"
    },
    {
      name: "Silicone Bibs Set",
      price: 19.99,
      description: "Set of 3 waterproof silicone bibs",
      category: "Feeding & Nursing",
      stock: 120,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "6M+",
      features: "Food Catcher, Easy Clean",
      keywords: "feeding, bibs"
    },
    {
      name: "Bottle Sterilizer",
      price: 69.99,
      description: "Electric steam sterilizer",
      category: "Feeding & Nursing",
      stock: 50,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "6-Bottle Capacity, Quick Cycle",
      keywords: "feeding, sterilizer"
    },
    {
      name: "Bottle Warmer",
      price: 34.99,
      description: "Quick-warm bottle warmer",
      category: "Feeding & Nursing",
      stock: 70,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Auto Shutoff, Fits All Bottles",
      keywords: "feeding, warmer"
    },
    {
      name: "Nursing Cover",
      price: 24.99,
      description: "Multi-use nursing cover",
      category: "Feeding & Nursing",
      stock: 90,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Breathable Fabric, Adjustable Neck",
      keywords: "feeding, nursing cover"
    },
    {
      name: "Sippy Cup Set",
      price: 15.99,
      description: "Set of 2 transition sippy cups",
      category: "Feeding & Nursing",
      stock: 100,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "6M+",
      features: "Spill-proof, Easy Grip",
      keywords: "feeding, sippy cup"
    },

    // Baby Health & Safety (10 products)
    {
      name: "Digital Baby Thermometer",
      price: 29.99,
      description: "Fast-read digital thermometer",
      category: "Baby Health & Safety",
      stock: 75,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "10-Second Reading, Waterproof",
      keywords: "health, thermometer"
    },
    {
      name: "Baby Healthcare Kit",
      price: 39.99,
      description: "Complete baby healthcare and grooming kit",
      category: "Baby Health & Safety",
      stock: 60,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "12 Pieces, Storage Case",
      keywords: "health, kit"
    },
    {
      name: "Nasal Aspirator",
      price: 19.99,
      description: "Electric nasal aspirator",
      category: "Baby Health & Safety",
      stock: 85,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-24M",
      features: "Battery Operated, Washable Tips",
      keywords: "health, nasal care"
    },
    {
      name: "Corner Guards Set",
      price: 14.99,
      description: "Pack of 12 furniture corner protectors",
      category: "Baby Health & Safety",
      stock: 120,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Clear Design, Strong Adhesive",
      keywords: "safety, corner guards"
    },
    {
      name: "Cabinet Locks",
      price: 16.99,
      description: "10-pack child safety cabinet locks",
      category: "Baby Health & Safety",
      stock: 100,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Easy Adult Access, No Tools",
      keywords: "safety, locks"
    },
    {
      name: "Outlet Covers",
      price: 9.99,
      description: "24-pack electrical outlet covers",
      category: "Baby Health & Safety",
      stock: 150,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Self-closing, Easy Installation",
      keywords: "safety, outlet covers"
    },
    {
      name: "Baby Monitor HD",
      price: 179.99,
      description: "HD video baby monitor with night vision",
      category: "Baby Health & Safety",
      stock: 40,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Temperature Monitor, Lullabies",
      keywords: "safety, monitor"
    },
    {
      name: "Safety Gates Pack",
      price: 89.99,
      description: "Set of 2 adjustable safety gates",
      category: "Baby Health & Safety",
      stock: 45,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "One-hand Operation, Auto-close",
      keywords: "safety, gates"
    },
    {
      name: "Anti-Tip Furniture Straps",
      price: 19.99,
      description: "8-pack furniture anchoring straps",
      category: "Baby Health & Safety",
      stock: 90,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Metal Hardware, Easy Install",
      keywords: "safety, furniture straps"
    },
    {
      name: "Baby First Aid Kit",
      price: 34.99,
      description: "Comprehensive baby first aid kit",
      category: "Baby Health & Safety",
      stock: 70,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "40+ Items, Guide Included",
      keywords: "health, first aid"
    },

    // Bathing & Grooming Products (10 products)
    {
      name: "Baby Bath Tub",
      price: 39.99,
      description: "Ergonomic baby bath tub with support",
      category: "Bathing & Grooming",
      stock: 50,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-24M",
      features: "Temperature Indicator, Non-slip",
      keywords: "bath, tub, safety"
    },
    {
      name: "Baby Care Kit",
      price: 29.99,
      description: "Complete grooming kit for babies",
      category: "Bathing & Grooming",
      stock: 75,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "10 Pieces, Travel Case",
      keywords: "grooming, care, kit"
    },
    {
      name: "Hooded Towel Set",
      price: 24.99,
      description: "Set of 2 hooded baby towels",
      category: "Bathing & Grooming",
      stock: 100,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-24M",
      features: "100% Cotton, Animal Design",
      keywords: "bath, towel"
    },
    {
      name: "Baby Shampoo Bundle",
      price: 19.99,
      description: "Gentle shampoo and body wash set",
      category: "Bathing & Grooming",
      stock: 120,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Tear-free, Natural Ingredients",
      keywords: "bath, shampoo"
    },
    {
      name: "Bath Toys Set",
      price: 15.99,
      description: "10-piece educational bath toys",
      category: "Bathing & Grooming",
      stock: 150,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "6M+",
      features: "BPA-free, Mold-resistant",
      keywords: "bath, toys"
    },
    {
      name: "Baby Hair Brush Set",
      price: 12.99,
      description: "Soft bristle brush and comb set",
      category: "Bathing & Grooming",
      stock: 90,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-24M",
      features: "Extra Soft Bristles, Easy Grip",
      keywords: "grooming, brush"
    },
    {
      name: "Bath Kneeler Pad",
      price: 22.99,
      description: "Cushioned bath kneeler and elbow rest",
      category: "Bathing & Grooming",
      stock: 60,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Waterproof, Storage Pockets",
      keywords: "bath, kneeler"
    },
    {
      name: "Baby Nail Care Set",
      price: 16.99,
      description: "Safe baby nail trimming kit",
      category: "Bathing & Grooming",
      stock: 85,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "LED Light, Safety Tips",
      keywords: "grooming, nail care"
    },
    {
      name: "Bath Spout Cover",
      price: 9.99,
      description: "Cute animal bath spout protector",
      category: "Bathing & Grooming",
      stock: 110,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Universal Fit, Soft Material",
      keywords: "bath, safety"
    },
    {
      name: "Bath Temperature Duck",
      price: 8.99,
      description: "Color-changing bath temperature indicator",
      category: "Bathing & Grooming",
      stock: 130,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Color Change, Floating",
      keywords: "bath, safety"
    },

    // Diapers & Wipes (10 products)
    {
      name: "Eco-Friendly Diapers",
      price: 49.99,
      description: "Pack of 120 biodegradable diapers",
      category: "Diapers & Wipes",
      stock: 200,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-12M",
      features: "Biodegradable, Super Absorbent",
      keywords: "diapers, eco-friendly"
    },
    {
      name: "Premium Baby Wipes",
      price: 24.99,
      description: "Pack of 720 sensitive wipes",
      category: "Diapers & Wipes",
      stock: 300,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Unscented, 99% Water",
      keywords: "wipes, sensitive"
    },
    {
      name: "Cloth Diaper Set",
      price: 89.99,
      description: "Set of 6 reusable cloth diapers",
      category: "Diapers & Wipes",
      stock: 50,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "0-24M",
      features: "Adjustable Size, Washable",
      keywords: "diapers, cloth"
    },
    {
      name: "Diaper Rash Cream",
      price: 12.99,
      description: "Natural diaper rash treatment",
      category: "Diapers & Wipes",
      stock: 150,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Organic Ingredients, Fast Relief",
      keywords: "diaper care, cream"
    },
    {
      name: "Diaper Pail",
      price: 39.99,
      description: "Odor-sealing diaper disposal system",
      category: "Diapers & Wipes",
      stock: 80,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Odor Lock, Large Capacity",
      keywords: "diaper disposal"
    },
    {
      name: "Changing Pad",
      price: 29.99,
      description: "Portable changing pad with storage",
      category: "Diapers & Wipes",
      stock: 100,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Waterproof, Storage Pockets",
      keywords: "diaper changing"
    },
    {
      name: "Swim Diapers",
      price: 19.99,
      description: "Pack of 12 disposable swim diapers",
      category: "Diapers & Wipes",
      stock: 120,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "3-24M",
      features: "Leak Protection, Tear-away Sides",
      keywords: "diapers, swim"
    },
    {
      name: "Wipes Warmer",
      price: 34.99,
      description: "Baby wipes warming system",
      category: "Diapers & Wipes",
      stock: 60,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Even Heating, Night Light",
      keywords: "wipes, warmer"
    },
    {
      name: "Diaper Caddy",
      price: 27.99,
      description: "Portable diaper organization caddy",
      category: "Diapers & Wipes",
      stock: 90,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "All Ages",
      features: "Multiple Compartments, Portable",
      keywords: "diaper storage"
    },
    {
      name: "Training Pants",
      price: 22.99,
      description: "Pack of 20 toddler training pants",
      category: "Diapers & Wipes",
      stock: 110,
      imageUrl: "https://placehold.co/400x400.png",
      ageGroup: "2Y+",
      features: "Easy Pull-up Design, Absorbent",
      keywords: "diapers, training"
    }
  ];

  // Create products
  console.log('Creating products...');
  for (const product of allProducts) {
    await prisma.product.create({
      data: product
    });
  }

  // Get created products for orders
  console.log('Creating sample orders...');
  const products = await prisma.product.findMany({
    take: 5
  });

  // Create orders
  const orderStatuses = [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered];
  
  for (let i = 0; i < 5; i++) {
    const orderItems = products.map(product => ({
      productId: product.id,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: product.price,
      name: product.name
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await prisma.order.create({
      data: {
        userId: customer.id,
        totalAmount: totalAmount + 5.99, // Add shipping
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        shippingAddress: {
          fullName: "Test Customer",
          address: "123 Test Street",
          city: "Test City",
          postalCode: "12345",
          country: "Test Country",
          email: "customer@babyverse.com"
        },
        items: {
          create: orderItems
        }
      }
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
