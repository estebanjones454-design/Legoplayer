export type LegoTheme = 'ninjago' | 'star-wars' | 'chima' | 'scooby-doo' | 'variado';

export interface Product {
  id: string;
  setNumber: string;
  name: string;
  theme: LegoTheme;
  themeName: string;
  price: number;
  originalPrice?: number;
  pieces: number;
  age: string;
  minifiguresCount: number;
  minifigures: string[];
  rating: number;
  reviewsCount: number;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  dimensions: {
    height: string;
    width: string;
    depth: string;
  };
  inStock: boolean;
  featured?: boolean;
  badge?: string;
  releaseYear: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  setNumber: string;
  name: string;
  themeName: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'preparando' | 'empaquetado' | 'en_camino' | 'entregado';

export interface Order {
  id: string;
  date: string;
  timestamp: number;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  statusLabel: string;
  trackingNumber: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod: {
    type: string;
    last4: string;
  };
  vipPointsEarned: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  vipTier: 'Principiante' | 'Constructor' | 'Maestro Constructor';
  vipPoints: number;
  joinedDate: string;
  avatarUrl?: string;
}

export interface LockoutInfo {
  isLocked: boolean;
  lockedUntil: number; // timestamp ms
  remainingSeconds: number;
  failedAttempts: number;
}
