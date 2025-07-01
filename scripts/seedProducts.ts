import admin from '../src/lib/firebaseAdmin';
import { randomUUID } from 'crypto';

// --- CATEGORY DEFINITIONS ---
const categories: {
  name: string;
  subcategories: string[];
  priceRange: [number, number];
}[] = [
  {
    name: 'Baby Clothes',
    subcategories: [
      'Onesies', 'Rompers', 'Sleepwear', 'Jackets & Sweaters', 'Socks & Booties',
      'Hats & Caps', 'Dresses & Skirts', 'Baby T-Shirts', 'Pants & Shorts', 'Mittens'
    ],
    priceRange: [300, 2000],
  },
  {
    name: 'Baby Feeding',
    subcategories: [
      'Baby Bottles', 'Bottle Nipples & Teats', 'Breast Pumps', 'Baby Bibs', 'High Chairs',
      'Baby Food Containers', 'Formula Milk', 'Spoons & Bowls', 'Pacifiers', 'Sterilizers'
    ],
    priceRange: [500, 8000],
  },
  {
    name: 'Diapers & Wipes',
    subcategories: [
      'Disposable Diapers (packs)', 'Cloth Diapers', 'Baby Wipes', 'Diaper Rash Creams',
      'Changing Mats', 'Diaper Bags', 'Diaper Disposal Bins', 'Training Pants', 'Swim Diapers', 'Diaper Liners'
    ],
    priceRange: [200, 3500],
  },
  {
    name: 'Baby Toys',
    subcategories: [
      'Rattles', 'Teething Toys', 'Soft Plush Toys', 'Activity Gyms', 'Musical Toys',
      'Stacking Rings', 'Shape Sorters', 'Baby Books', 'Crawl & Walk Toys', 'Bath Toys'
    ],
    priceRange: [250, 3000],
  },
  {
    name: 'Health & Safety',
    subcategories: [
      'Baby Thermometers', 'Baby Monitors', 'Safety Gates', 'Outlet Covers', 'Corner Protectors',
      'Nasal Aspirators', 'Baby First Aid Kits', 'Baby Toothbrushes', 'Medicine Dispensers', 'Sun Hats & UV Protection'
    ],
    priceRange: [300, 7000],
  },
  {
    name: 'Nursery & Furniture',
    subcategories: [
      'Cribs & Cots', 'Baby Mattresses', 'Changing Tables', 'Rocking Chairs', 'Storage Baskets',
      'Baby Monitors (audio/video)', 'Nursery Décor', 'Baby Swings', 'Playpens', 'Night Lights'
    ],
    priceRange: [2000, 25000],
  },
  {
    name: 'Bath & Skincare',
    subcategories: [
      'Baby Shampoo & Soap', 'Baby Lotion', 'Bath Tubs', 'Towels & Washcloths', 'Bath Toys',
      'Bath Thermometers', 'Diaper Creams', 'Baby Powder', 'Baby Oil', 'Gentle Wipes'
    ],
    priceRange: [250, 2500],
  },
  {
    name: 'Travel & Gear',
    subcategories: [
      'Strollers', 'Baby Carriers & Slings', 'Car Seats', 'Travel Cribs', 'Diaper Bags',
      'Baby Blankets', 'Sun Shades for Cars', 'Portable High Chairs', 'Baby Walkers', 'Travel Toys'
    ],
    priceRange: [2000, 30000],
  },
];

function randomPrice([min, max]: [number, number]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStock() {
  return Math.floor(Math.random() * 50) + 10;
}

function randomImage(category: string) {
  // Placeholder image, you can update with real images later
  return `https://placehold.co/400x400?text=${encodeURIComponent(category)}`;
}

async function seedProducts() {
  const db = admin.firestore();
  for (const cat of categories) {
    for (let i = 0; i < 10; i++) {
      const sub = cat.subcategories[i % cat.subcategories.length];
      const product = {
        name: `${sub}`,
        description: `High quality ${sub.toLowerCase()} for your baby.`,
        price: randomPrice(cat.priceRange),
        stock: randomStock(),
        category: cat.name,
        imageUrl: randomImage(sub),
        tags: [cat.name, sub],
        features: `Feature-rich ${sub.toLowerCase()} for comfort and safety.`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection('products').add(product);
      console.log(`Added product: ${product.name} (${cat.name})`);
    }
  }
}

// --- ADMIN UI TEST DATA ---
async function seedAdminTestData() {
  const db = admin.firestore();
  // Add a test user
  await db.collection('users').doc('test-admin').set({
    name: 'Test Admin',
    email: 'admin@babyverse.com',
    role: 'ADMIN',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  // Add a test parent
  await db.collection('users').doc('test-parent').set({
    name: 'Test Parent',
    email: 'parent@babyverse.com',
    role: 'PARENT',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  // Add a test order
  await db.collection('orders').add({
    userId: 'test-parent',
    status: 'PENDING',
    totalAmount: 5000,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    items: [
      { productId: 'dummy-product-1', name: 'Onesie', quantity: 2, price: 800 },
      { productId: 'dummy-product-2', name: 'Baby Bottle', quantity: 1, price: 1200 },
    ],
    shippingAddress: {
      fullName: 'Test Parent',
      address: '123 Baby St',
      city: 'Nairobi',
      postalCode: '00100',
      country: 'Kenya',
      email: 'parent@babyverse.com',
    },
  });
  // Add a test promotion
  await db.collection('promotions').add({
    name: 'Welcome Discount',
    type: 'PERCENTAGE',
    value: 10,
    target: 'ALL_PRODUCTS',
    startDate: admin.firestore.Timestamp.fromDate(new Date()),
    endDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    isActive: true,
  });
  console.log('Admin UI test data seeded.');
}

async function main() {
  await seedProducts();
  await seedAdminTestData();
  console.log('Seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
