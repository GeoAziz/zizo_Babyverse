import type { Product, Testimonial, Order } from './types';

export const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Cosmic Comfort Diapers',
    description: 'Ultra-absorbent diapers made with sustainable Martian cotton, ensuring your baby stays dry and comfortable through any interstellar journey.',
    price: 29.99,
    category: 'Diapers',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'diapers baby',
    stock: 100,
    tags: ['Eco-Friendly', 'Bestseller'],
    ageGroup: '0-6 months',
    ecoTag: true,
    averageRating: 4.8,
    features: "Organic cotton, Hypoallergenic, Leak-proof",
    targetAudience: "Newborns",
    keywords: "soft, safe, eco-friendly diapers"
  },
  {
    id: 'prod_2',
    name: 'Galaxy Glow Pacifier Set',
    description: 'Set of two orthodontic pacifiers that glow softly in the dark, inspired by distant nebulae. BPA-free and designed for oral development.',
    price: 12.50,
    category: 'Pacifiers',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'pacifier baby',
    stock: 150,
    tags: ['BPA-Free', 'Glow-in-the-dark'],
    ageGroup: '0-12 months',
    averageRating: 4.5,
    features: "BPA-free, Orthodontic, Glow-in-the-dark",
    targetAudience: "Infants",
    keywords: "soothing, safe pacifier, night time"
  },
  {
    id: 'prod_3',
    name: 'Astro Organic Baby Food - Starfruit Puree',
    description: 'Nutritious and delicious organic starfruit puree, packed with vitamins for your little astronaut. No added sugar or preservatives.',
    price: 3.99,
    category: 'Food',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'baby food',
    stock: 200,
    tags: ['Organic', 'Allergy-Free (Nut)'],
    ageGroup: '6+ months',
    ecoTag: true,
    averageRating: 4.9,
    features: "Organic, No added sugar, Vitamin-rich",
    targetAudience: "Toddlers",
    keywords: "healthy, organic baby food, tasty"
  },
  {
    id: 'prod_4',
    name: 'Rover Activity Playmat',
    description: 'Interactive playmat with detachable space-themed toys, crinkle textures, and a baby-safe mirror. Encourages sensory development.',
    price: 59.00,
    category: 'Toys',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'baby playmat',
    stock: 80,
    tags: ['Developmental', 'Interactive'],
    ageGroup: '3-18 months',
    averageRating: 4.7,
    features: "Sensory toys, Machine washable, Non-toxic materials",
    targetAudience: "Infants and Toddlers",
    keywords: "fun, educational toy, activity mat"
  },
  {
    id: 'prod_5',
    name: 'Zero-G Swaddle Blanket',
    description: 'Lightweight and breathable swaddle blanket designed to mimic the calming sensation of zero gravity. Made from bamboo fabric.',
    price: 22.00,
    category: 'Sleep',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'baby swaddle',
    stock: 120,
    tags: ['Breathable', 'Organic'],
    ageGroup: '0-3 months',
    ecoTag: true,
    averageRating: 4.6,
    features: "Bamboo fabric, Hypoallergenic, Calming design",
    targetAudience: "Newborns",
    keywords: "comfortable, soft swaddle, good sleep"
  },
   {
    id: 'prod_6',
    name: 'Nebula Night Light Projector',
    description: 'Projects a calming nebula and star display onto nursery walls and ceiling. Multiple color modes and built-in lullabies.',
    price: 35.00,
    category: 'Nursery',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'night light',
    stock: 90,
    tags: ['Soothing', 'Multi-functional'],
    ageGroup: 'All ages',
    averageRating: 4.8,
    features: "Star projector, Lullabies, Timer function",
    targetAudience: "All ages",
    keywords: "nursery decor, sleep aid, calming light"
  },
];

export const mockFeaturedCollections = [
  { name: 'Pacifiers', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'pacifiers collection', link: '/products?category=Pacifiers' },
  { name: 'Organic Food', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'baby food', link: '/products?category=Food&tag=Organic' },
  { name: 'Eco Diapers', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'diapers eco', link: '/products?category=Diapers&tag=Eco-Friendly' },
  { name: 'Developmental Toys', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'baby toys', link: '/products?category=Toys&tag=Developmental' },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test_1',
    name: 'Dr. Eva Rostova',
    title: 'Pediatrician & Parent',
    quote: "Zizo's BabyVerse is a game-changer! The AI recommendations are spot-on, and the product quality is out of this world. My little astronaut loves his Rover Playmat!",
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'doctor woman',
    stars: 5,
  },
  {
    id: 'test_2',
    name: 'Jax Nebula',
    title: 'Tech Dad',
    quote: 'The futuristic UI and smooth experience make shopping for baby essentials actually enjoyable. The AR preview for the crib was super helpful!',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'man technology',
    stars: 5,
  },
  {
    id: 'test_3',
    name: 'Luna Starlight',
    title: 'First-time Mom',
    quote: "I was overwhelmed, but Zizi, the AI assistant, guided me to the perfect organic bundle for my newborn. The Cosmic Comfort Diapers are amazing!",
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman happy',
    stars: 4,
  },
];


export const mockOrders: Order[] = [
  {
    id: 'order_123',
    userId: 'user_1',
    items: [
      { productId: 'prod_1', name: 'Cosmic Comfort Diapers', quantity: 2, price: 29.99 },
      { productId: 'prod_2', name: 'Galaxy Glow Pacifier Set', quantity: 1, price: 12.50 },
    ],
    totalAmount: 72.48,
    status: 'Delivered',
    orderDate: '2024-07-15T10:30:00Z',
    shippingAddress: { street: '123 Milky Way', city: 'Star City', zip: '90210', country: 'Galaxy Prime' },
    paymentMethod: 'Zizo_PayWave',
    trackingNumber: 'ZP123456789',
    estimatedDelivery: '2024-07-18T10:00:00Z',
  },
  {
    id: 'order_456',
    userId: 'user_2',
    items: [
      { productId: 'prod_4', name: 'Rover Activity Playmat', quantity: 1, price: 59.00 },
    ],
    totalAmount: 59.00,
    status: 'In Transit',
    orderDate: '2024-07-20T14:00:00Z',
    shippingAddress: { street: '456 Nebula Lane', city: 'Planet Zen', zip: '12345', country: 'Galaxy Prime' },
    paymentMethod: 'Credit Card',
    trackingNumber: 'ZP987654321',
    estimatedDelivery: '2024-07-25T10:00:00Z',
  }
];
