import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
  console.log(`Created/updated admin user: ${adminUser.email}`);

  const customerPassword = await bcrypt.hash('CustPass123!', 10);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@babyverse.com' },
    update: {},
    create: {
      email: 'customer@babyverse.com',
      name: 'Valued Customer',
      passwordHash: customerPassword,
      role: Role.PARENT,
    },
  });
  console.log(`Created/updated customer user: ${customerUser.email}`);

  // --- Product Categories & Data ---
  const categories = [
    "Baby Care & Hygiene",
    "Sleep & Nursery",
    "Feeding & Nursing",
    "Safety & Babyproofing",
    "Baby Gear & Travel",
    "Toys & Learning",
  ];

  const productDataByCategory: Record<string, Array<Partial<Omit<Parameters<typeof prisma.product.create>[0]['data'], 'id' | 'createdAt' | 'updatedAt'>>>> = {
    "Baby Care & Hygiene": [
      { name: 'Cussons Baby Gift Box (Blue)', price: kshToConceptualUsd(2199), description: 'A comprehensive baby care set including lotion, powder, oil, and wipes.', category: "Baby Care & Hygiene", stock: 50, ecoTag: false, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'gift box baby', features: "Lotion, Powder, Oil, Wipes", targetAudience: "Newborns", keywords: "baby care, gift set, hygiene" },
      { name: 'Calendula Baby Soap', price: kshToConceptualUsd(380), description: 'Gentle soap suitable for babies.', category: "Baby Care & Hygiene", stock: 100, ecoTag: true, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby soap', features: "Calendula extract, Gentle formula", targetAudience: "Infants", keywords: "natural, gentle, baby soap" },
      { name: 'Baby Body Wash and Shampoo', price: kshToConceptualUsd(680), description: 'A 2-in-1 product ideal for babies with sensitive skin.', category: "Baby Care & Hygiene", stock: 75, ecoTag: true, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby wash shampoo', features: "2-in-1, Sensitive skin, Tear-free", targetAudience: "Babies", keywords: "sensitive skin, tear-free, baby wash" },
      { name: 'Organic Baby Lotion - Lavender', price: 9.99, description: 'Soothing organic baby lotion with calming lavender scent.', category: "Baby Care & Hygiene", stock: 60, ecoTag: true, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby lotion organic', features: "Organic ingredients, Lavender scent, Moisturizing", targetAudience: "All baby ages", keywords: "organic, lotion, calming, lavender" },
      { name: 'Hypoallergenic Baby Wipes (80 pack)', price: 4.50, description: 'Extra soft and hypoallergenic wipes for sensitive baby skin.', category: "Baby Care & Hygiene", stock: 120, ecoTag: false, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby wipes', features: "Hypoallergenic, Fragrance-free, Extra soft", targetAudience: "All baby ages", keywords: "wipes, sensitive, hypoallergenic" },
      { name: 'Baby Nail Care Kit', price: 7.20, description: 'Safe and easy to use nail clippers, scissors, and file for tiny nails.', category: "Baby Care & Hygiene", stock: 90, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'nail kit baby', features: "Safety design, Multiple tools, Compact case", targetAudience: "Infants", keywords: "nail care, baby safety, grooming" },
      { name: 'Gentle Baby Powder - Cornstarch', price: 5.00, description: 'Talc-free baby powder made with natural cornstarch.', category: "Baby Care & Hygiene", stock: 80, ecoTag: true, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby powder', features: "Talc-free, Cornstarch based, Gentle", targetAudience: "All baby ages", keywords: "powder, natural, talc-free" },
      { name: 'Baby Bath Thermometer - Starfish', price: 6.50, description: 'Fun starfish shaped bath thermometer for safe water temperature.', category: "Baby Care & Hygiene", stock: 70, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'bath thermometer', features: "Accurate reading, Floats, Fun design", targetAudience: "Infants", keywords: "bath safety, thermometer, baby bath" },
      { name: 'Eco-Friendly Diaper Rash Cream', price: 11.00, description: 'Natural and organic diaper rash cream to soothe and protect.', category: "Baby Care & Hygiene", stock: 55, ecoTag: true, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'rash cream', features: "Organic, Soothing, Protective", targetAudience: "Infants", keywords: "diaper rash, organic, natural cream" },
      { name: 'Soft Bristle Baby Hair Brush & Comb Set', price: 8.00, description: 'Gentle hair brush and comb set for baby\'s delicate scalp.', category: "Baby Care & Hygiene", stock: 65, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby brush', features: "Soft bristles, Ergonomic design, Scalp care", targetAudience: "Infants", keywords: "hair brush, baby grooming, gentle" },
    ],
    "Sleep & Nursery": [
      { name: 'New Born Baby Bedside Sleeper Bassinet (Baby Pink)', price: kshToConceptualUsd(14800), description: 'Comes with a mosquito net and cradle, Baby Pink color.', category: "Sleep & Nursery", stock: 20, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'bassinet pink', features: "Bedside sleeper, Mosquito net, Cradle function", targetAudience: "Newborns", keywords: "bassinet, crib, newborn sleep" },
      { name: 'New Born Baby Bedside Sleeper Bassinet (Pastel Grey)', price: kshToConceptualUsd(14800), description: 'Comes with a mosquito net and cradle, Pastel Grey color.', category: "Sleep & Nursery", stock: 20, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'bassinet grey', features: "Bedside sleeper, Mosquito net, Cradle function", targetAudience: "Newborns", keywords: "bassinet, crib, pastel grey" },
      { name: 'Organic Cotton Crib Sheets - Starry Night', price: 25.00, description: 'Soft and breathable organic cotton crib sheets with a starry night pattern.', category: "Sleep & Nursery", stock: 40, ecoTag: true, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'crib sheets space', features: "Organic cotton, Breathable, Fitted design", targetAudience: "Infants", keywords: "crib bedding, organic, cotton sheets" },
      { name: 'Musical Mobile - Galaxy Theme', price: 35.50, description: 'Soothing musical mobile with rotating galaxy-themed plush toys.', category: "Sleep & Nursery", stock: 30, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby mobile galaxy', features: "Musical, Rotating, Plush toys, Galaxy theme", targetAudience: "Newborns to 6 months", keywords: "crib mobile, musical toy, nursery decor" },
      { name: 'Sleep Sack - Astronaut Print (0-6M)', price: 22.99, description: 'Wearable blanket with astronaut print for safe and cozy sleep.', category: "Sleep & Nursery", stock: 50, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'sleep sack astronaut', features: "Wearable blanket, Zipper closure, Soft fabric", targetAudience: "0-6 months", keywords: "sleep sack, baby sleepwear, safe sleep" },
      { name: 'Nursery Storage Bins - Set of 3 (Space Theme)', price: 28.00, description: 'Set of three fabric storage bins with space theme for organizing nursery items.', category: "Sleep & Nursery", stock: 45, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'nursery storage space', features: "Set of 3, Fabric, Foldable, Space theme", targetAudience: "Nursery organization", keywords: "storage bins, nursery organization, space theme" },
      { name: 'White Noise Machine - Cosmic Sounds', price: 30.00, description: 'Helps baby sleep with various white noise and cosmic sound options.', category: "Sleep & Nursery", stock: 35, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'white noise machine', features: "Multiple sounds, Timer, Portable", targetAudience: "All baby ages", keywords: "white noise, sleep aid, sound machine" },
      { name: 'Blackout Curtains - Star Pattern (Pair)', price: 45.00, description: 'Pair of blackout curtains with a subtle star pattern to ensure dark sleep environment.', category: "Sleep & Nursery", stock: 25, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'blackout curtains stars', features: "Blackout, Thermal insulated, Star pattern", targetAudience: "Nursery", keywords: "blackout curtains, nursery decor, sleep environment" },
      { name: 'Rocking Chair with Ottoman - Lunar Grey', price: 299.00, description: 'Comfortable rocking chair and ottoman for feeding and soothing baby.', category: "Sleep & Nursery", stock: 10, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'rocking chair nursery', features: "Smooth rocking, Padded, Ottoman included", targetAudience: "Parents", keywords: "rocking chair, nursery furniture, feeding chair" },
      { name: 'Convertible Crib - Galaxy Model', price: 350.00, description: 'A crib that converts to a toddler bed, daybed, and full-size bed. Galaxy design accents.', category: "Sleep & Nursery", stock: 15, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'convertible crib space', features: "4-in-1 convertible, Sturdy wood, Galaxy accents", targetAudience: "Newborn to toddler", keywords: "convertible crib, baby bed, long-lasting" },
    ],
    "Feeding & Nursing": [
      { name: 'Baby Feeding Set (Bottles & Accessories)', price: kshToConceptualUsd(1200), description: 'Includes bottles, nipples, and cleaning accessories.', category: "Feeding & Nursing", stock: 60, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'feeding set bottles', features: "Anti-colic bottles, Various nipple sizes, Cleaning brush", targetAudience: "Infants", keywords: "baby bottles, feeding set, nursing" },
      { name: 'Breastfeeding Pillow - Moon Shape', price: kshToConceptualUsd(1500), description: 'Provides ergonomic support during nursing, moon shape.', category: "Feeding & Nursing", stock: 40, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'nursing pillow moon', features: "Ergonomic support, Removable cover, Soft", targetAudience: "Nursing mothers", keywords: "breastfeeding pillow, nursing support, mom essentials" },
      { name: 'Silicone Bibs - Set of 2 (Planet Prints)', price: 12.50, description: 'Easy-to-clean silicone bibs with a food catcher pocket, planet prints.', category: "Feeding & Nursing", stock: 80, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'silicone bibs planets', features: "Waterproof, Food catcher, Adjustable", targetAudience: "6+ months", keywords: "silicone bib, baby bibs, easy clean" },
      { name: 'Baby Food Maker - Steamer & Blender', price: 85.00, description: '2-in-1 machine to steam and blend homemade baby food.', category: "Feeding & Nursing", stock: 25, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby food maker', features: "Steamer, Blender, Compact design", targetAudience: "Parents", keywords: "baby food maker, homemade baby food, healthy" },
      { name: 'High Chair - Stardust Model', price: 120.00, description: 'Adjustable and easy-to-clean high chair with stardust pattern tray.', category: "Feeding & Nursing", stock: 30, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'high chair stars', features: "Adjustable height, Removable tray, Safety harness", targetAudience: "6 months to 3 years", keywords: "high chair, baby feeding, stardust" },
      { name: 'Insulated Bottle Bag - Rocket Theme', price: 18.00, description: 'Keeps bottles warm or cold for hours, fun rocket theme.', category: "Feeding & Nursing", stock: 50, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'bottle bag rocket', features: "Insulated, Holds 2 bottles, Rocket design", targetAudience: "Parents on-the-go", keywords: "bottle bag, insulated, travel" },
      { name: 'Toddler Utensil Set - Space Explorer', price: 9.00, description: 'Ergonomic fork and spoon set for toddlers learning to self-feed.', category: "Feeding & Nursing", stock: 70, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'toddler utensils space', features: "Easy grip, Stainless steel, BPA-free", targetAudience: "Toddlers", keywords: "toddler utensils, self-feeding, space theme" },
      { name: 'Manual Breast Pump - Comet Comfort', price: 32.00, description: 'Lightweight and portable manual breast pump for occasional use.', category: "Feeding & Nursing", stock: 35, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'manual breast pump', features: "Portable, Gentle suction, Easy to use", targetAudience: "Nursing mothers", keywords: "breast pump, manual, milk expression" },
      { name: 'Spill-Proof Snack Cups - Set of 3 (Galaxy Colors)', price: 15.00, description: 'Set of 3 spill-proof snack cups in galaxy-inspired colors.', category: "Feeding & Nursing", stock: 65, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'snack cups galaxy', features: "Spill-proof, Easy grip handles, BPA-free", targetAudience: "Toddlers", keywords: "snack cups, toddler snacks, spill-proof" },
      { name: 'Nursing Cover - Infinity Scarf Style', price: 20.00, description: 'Stylish and discreet nursing cover that can also be worn as a scarf.', category: "Feeding & Nursing", stock: 45, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'nursing cover scarf', features: "Multi-use, Breathable fabric, Full coverage", targetAudience: "Nursing mothers", keywords: "nursing cover, breastfeeding, privacy" },
    ],
    "Safety & Babyproofing": [
      { name: '10PCS Transparent Child Safety Soft Corner Guards', price: kshToConceptualUsd(890), description: 'Protects babies from sharp corners of furniture.', category: "Safety & Babyproofing", stock: 100, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'corner guards safety', features: "Transparent, Soft PVC, Easy to install", targetAudience: "Crawling babies and toddlers", keywords: "corner guards, child safety, babyproofing" },
      { name: '10-Pack Child Safety Power Outlet Socket Cover Guard', price: kshToConceptualUsd(780), description: 'Prevents electrical accidents by covering unused outlets.', category: "Safety & Babyproofing", stock: 120, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'outlet covers safety', features: "Universal fit, Difficult for child to remove, Pack of 10", targetAudience: "Crawling babies and toddlers", keywords: "outlet covers, electrical safety, childproofing" },
      { name: 'Cabinet Locks (12-Pack) - Asteroid Proof', price: 14.50, description: 'Secure your cabinets and drawers from curious little hands.', category: "Safety & Babyproofing", stock: 80, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'cabinet locks', features: "Adhesive mount, No drilling, 12-pack", targetAudience: "Toddlers", keywords: "cabinet locks, drawer safety, baby proofing" },
      { name: 'Baby Gate - Extra Wide Stellar Span', price: 75.00, description: 'Pressure-mounted baby gate for doorways and stairs, extra wide.', category: "Safety & Babyproofing", stock: 30, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby gate wide', features: "Pressure mounted, Walk-through door, Extra wide", targetAudience: "Crawling babies and toddlers", keywords: "baby gate, safety gate, child barrier" },
      { name: 'Furniture Anti-Tip Straps (8-Pack)', price: 18.00, description: 'Secure heavy furniture to walls to prevent tipping accidents.', category: "Safety & Babyproofing", stock: 60, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'anti tip straps', features: "Adjustable straps, Heavy duty, Easy installation", targetAudience: "Homes with toddlers", keywords: "furniture safety, anti-tip, childproofing" },
      { name: 'Digital Baby Monitor - Cosmic View', price: 129.99, description: 'Video and audio baby monitor with night vision and two-way talk.', category: "Safety & Babyproofing", stock: 25, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby monitor video', features: "Video display, Night vision, Two-way audio, Temperature sensor", targetAudience: "Parents of infants", keywords: "baby monitor, video monitor, nursery safety" },
      { name: 'Door Knob Covers (4-Pack) - Child Proof', price: 9.50, description: 'Prevents toddlers from opening doors to unsafe areas.', category: "Safety & Babyproofing", stock: 90, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'door knob covers', features: "Easy for adults, Hard for kids, Fits most knobs", targetAudience: "Toddlers", keywords: "door safety, childproof, babyproofing" },
      { name: 'Non-Slip Bath Mat - Space Bubbles', price: 16.00, description: 'Prevents slips in the bathtub with fun space bubble design.', category: "Safety & Babyproofing", stock: 70, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'bath mat non slip', features: "Suction cups, Non-slip surface, Mold resistant", targetAudience: "Babies and toddlers", keywords: "bath safety, non-slip mat, bathtub" },
      { name: 'Window Guards - Adjustable (2-Pack)', price: 35.00, description: 'Prevents falls from windows, adjustable to fit various sizes.', category: "Safety & Babyproofing", stock: 40, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'window guards safety', features: "Adjustable, Sturdy metal, Easy to install", targetAudience: "Homes with children", keywords: "window safety, fall prevention, childproofing" },
      { name: 'First Aid Kit - Baby & Toddler Edition', price: 28.00, description: 'Comprehensive first aid kit specifically for babies and toddlers.', category: "Safety & Babyproofing", stock: 55, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'first aid kit baby', features: "Age-appropriate supplies, Compact case, Emergency guide", targetAudience: "Parents", keywords: "first aid, baby safety, emergency kit" },
    ],
    "Baby Gear & Travel": [
      { name: 'Peekaboo Lightweight Foldable Baby Stroller Pram', price: kshToConceptualUsd(10000), description: 'Features a cushion seat and canopy, suitable for babies up to 25 kg.', category: "Baby Gear & Travel", stock: 25, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'stroller foldable lightweight', features: "Lightweight, Foldable, Canopy, Cushion seat", targetAudience: "Babies up to 25kg", keywords: "stroller, pram, baby travel, lightweight" },
      { name: 'Comfortable Baby Carrier - Cosmic Blue', price: kshToConceptualUsd(1299), description: 'Offers hands-free carrying, ergonomic design, cosmic blue color.', category: "Baby Gear & Travel", stock: 40, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby carrier blue', features: "Ergonomic, Multiple positions, Breathable fabric", targetAudience: "Infants and toddlers", keywords: "baby carrier, hands-free, ergonomic" },
      { name: 'Travel Crib - Starlight Portable Playard', price: 95.00, description: 'Lightweight and easy-to-fold travel crib and playard.', category: "Baby Gear & Travel", stock: 30, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'travel crib portable', features: "Lightweight, Folds compactly, Carry bag included", targetAudience: "Infants and toddlers", keywords: "travel crib, playard, portable bed" },
      { name: 'Diaper Bag Backpack - Galaxy Voyager', price: 55.00, description: 'Spacious diaper bag backpack with insulated pockets and changing pad.', category: "Baby Gear & Travel", stock: 50, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'diaper bag backpack galaxy', features: "Multiple compartments, Insulated pockets, Changing pad, Stroller straps", targetAudience: "Parents", keywords: "diaper bag, backpack, travel essential" },
      { name: 'Car Seat - Astro Explorer Convertible', price: 180.00, description: 'Convertible car seat that grows with your child, rear-facing and forward-facing.', category: "Baby Gear & Travel", stock: 20, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'car seat convertible', features: "Convertible, Side impact protection, 5-point harness", targetAudience: "Infant to preschool", keywords: "car seat, convertible, child safety" },
      { name: 'Portable Changing Pad - Comet Clutch', price: 22.00, description: 'Foldable changing pad clutch with pockets for diapers and wipes.', category: "Baby Gear & Travel", stock: 60, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'changing pad portable', features: "Compact, Padded, Wipeable surface, Storage pockets", targetAudience: "Parents on-the-go", keywords: "changing pad, portable, diaper clutch" },
      { name: 'Stroller Organizer - Universal Fit (Cosmic Black)', price: 19.50, description: 'Attaches to stroller handles for extra storage and cup holders.', category: "Baby Gear & Travel", stock: 70, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'stroller organizer black', features: "Universal fit, Multiple pockets, Cup holders, Insulated compartment", targetAudience: "Parents with strollers", keywords: "stroller organizer, accessories, storage" },
      { name: 'Baby Sun Shade for Car Windows (2-Pack) - UV Shield', price: 14.00, description: 'Protects baby from sun glare and UV rays in the car.', category: "Baby Gear & Travel", stock: 80, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'car sun shade baby', features: "UPF 50+, Easy to attach, Universal fit", targetAudience: "Parents with cars", keywords: "sun shade, car travel, UV protection" },
      { name: 'Toddler Travel Bed - Inflatable Spaceship', price: 48.00, description: 'Fun inflatable travel bed shaped like a spaceship for toddlers.', category: "Baby Gear & Travel", stock: 35, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'toddler travel bed spaceship', features: "Inflatable, Safety bumpers, Includes pump, Fun design", targetAudience: "Toddlers", keywords: "travel bed, inflatable, toddler sleep" },
      { name: 'Baby Carrier Wrap - Stretchy Celestial Print', price: 29.99, description: 'Soft and stretchy baby wrap carrier with a celestial print.', category: "Baby Gear & Travel", stock: 45, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby wrap celestial', features: "Stretchy fabric, Hands-free, Promotes bonding", targetAudience: "Newborns and infants", keywords: "baby wrap, carrier, celestial print" },
    ],
    "Toys & Learning": [
      { name: '3-in-1 Baby Walker, Table, Scooter & Learning Centre', price: kshToConceptualUsd(6465), description: 'Encourages movement and play, converts between walker, table, and scooter.', category: "Toys & Learning", stock: 30, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'baby walker learning', features: "3-in-1, Activity panel, Lights and sounds", targetAudience: "9 months+", keywords: "baby walker, activity center, learning toy" },
      { name: '58pcs Building Blocks Toy Smart Stick', price: kshToConceptualUsd(674), description: 'Enhances creativity and motor skills with interlocking smart sticks.', category: "Toys & Learning", stock: 80, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'building blocks smart stick', features: "58 pieces, Interlocking, Develops motor skills", targetAudience: "3 years+", keywords: "building blocks, construction toy, creative play" },
      { name: 'LED Yoyo for Kids - Galaxy Glow', price: kshToConceptualUsd(350), description: 'A fun light-up yoyo for older toddlers and kids.', category: "Toys & Learning", stock: 100, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'led yoyo kids', features: "LED lights, Durable, Fun for older toddlers", targetAudience: "3 years+", keywords: "yoyo, light-up toy, kids toy" },
      { name: 'Soft Activity Book - Space Adventure', price: 18.50, description: 'Interactive soft book with crinkles, textures, and space themes.', category: "Toys & Learning", stock: 60, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'soft book space', features: "Sensory elements, Teether corner, Washable", targetAudience: "0-24 months", keywords: "soft book, activity toy, baby book, space" },
      { name: 'Stacking Rings - Rocket Shape', price: 12.00, description: 'Classic stacking toy with a fun rocket ship design.', category: "Toys & Learning", stock: 70, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'stacking rings rocket', features: "Develops coordination, Bright colors, Rocket topper", targetAudience: "6 months+", keywords: "stacking toy, educational, rocket" },
      { name: 'Wooden Puzzles - Set of 3 (Cosmic Animals)', price: 22.00, description: 'Set of three wooden peg puzzles featuring cosmic animal designs.', category: "Toys & Learning", stock: 50, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'wooden puzzles animals', features: "Wooden, Pegged pieces, Develops problem-solving", targetAudience: "18 months+", keywords: "wooden puzzle, educational toy, animals" },
      { name: 'Bath Toys - Floating Planets & Spaceships (Set of 5)', price: 16.00, description: 'Set of 5 floating bath toys including planets and spaceships.', category: "Toys & Learning", stock: 75, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'bath toys planets', features: "Floating, Squeezable, BPA-free", targetAudience: "6 months+", keywords: "bath toys, planets, spaceships, fun" },
      { name: 'Musical Instrument Set - Baby Band in a Box (Galaxy Theme)', price: 38.00, description: 'Includes shakers, tambourine, and xylophone with galaxy theme.', category: "Toys & Learning", stock: 40, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'musical instruments baby galaxy', features: "Multiple instruments, Develops rhythm, Non-toxic", targetAudience: "12 months+", keywords: "musical toys, baby instruments, galaxy theme" },
      { name: 'Interactive Learning Tablet - My First Space Computer', price: 29.99, description: 'Kid-friendly tablet with learning games, letters, numbers, and space facts.', category: "Toys & Learning", stock: 45, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'learning tablet space', features: "Educational games, Lights and sounds, Volume control", targetAudience: "2 years+", keywords: "learning tablet, educational toy, space" },
      { name: 'Plush Alien Toy - Zorp from Planet Snuggle', price: 19.99, description: 'Soft and cuddly plush alien toy, perfect for imaginative play.', category: "Toys & Learning", stock: 55, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'plush alien toy', features: "Soft plush, Embroidered details, Cuddly", targetAudience: "All ages", keywords: "plush toy, alien, soft toy, imaginative play" },
    ],
  };

  for (const category of categories) {
    const products = productDataByCategory[category] || [];
    let createdCount = 0;

    // Create products from the detailed list first
    for (const product of products) {
      if (createdCount < 10) {
        const newProduct = await prisma.product.create({
          data: {
            name: product.name!,
            description: product.description!,
            price: product.price!,
            category: product.category!,
            imageUrl: product.imageUrl || 'https://placehold.co/600x400.png',
            dataAiHint: product.dataAiHint || product.category?.toLowerCase() || 'product',
            stock: product.stock || Math.floor(Math.random() * 50) + 20,
            tags: product.tags || [],
            ageGroup: product.ageGroup || 'Various',
            ecoTag: product.ecoTag || false,
            averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // Random rating between 3.5 and 5.0
            features: product.features,
            targetAudience: product.targetAudience,
            keywords: product.keywords,
          },
        });
        console.log(`Created product: ${newProduct.name} in category ${category}`);
        createdCount++;
      }
    }

    // If fewer than 10 products were created from the list, add generic ones
    let genericCounter = products.length + 1;
    while (createdCount < 10) {
      const newProduct = await prisma.product.create({
        data: {
          name: `${category} Item #${genericCounter}`,
          description: `A wonderful ${category.toLowerCase()} item for your little star. Item number ${genericCounter} in our collection.`,
          price: parseFloat((Math.random() * 50 + 5).toFixed(2)), // Random price between $5 and $55
          category: category,
          imageUrl: 'https://placehold.co/600x400.png',
          dataAiHint: category.toLowerCase().split(' ')[0] || 'product item',
          stock: Math.floor(Math.random() * 70) + 30, // Random stock between 30 and 100
          tags: ['New Arrival'],
          ageGroup: 'Various',
          ecoTag: Math.random() > 0.5,
          averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
          features: "High-quality, Durable, Safe for babies",
          targetAudience: "Babies and Toddlers",
          keywords: `baby, ${category.toLowerCase()}, essential`
        },
      });
      console.log(`Created generic product: ${newProduct.name} in category ${category}`);
      createdCount++;
      genericCounter++;
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
