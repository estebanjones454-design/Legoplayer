import { User, Order, LockoutInfo } from '../types/lego';

const USERS_STORAGE_KEY = 'lego_store_users_v1';
const SESSION_STORAGE_KEY = 'lego_store_current_user_v1';
const ATTEMPTS_STORAGE_KEY = 'lego_store_failed_attempts_v1';
const ORDERS_STORAGE_KEY = 'lego_store_orders_v1';

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos
const MAX_FAILED_ATTEMPTS = 5;

// Simple deterministic hash for demo client storage
function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'lh_' + Math.abs(hash).toString(36) + '_' + pass.length;
}

// Initial demo user
const DEFAULT_DEMO_USER: User & { passwordHash: string } = {
  id: 'usr-lego-master-001',
  name: 'Emmet Brickowski',
  email: 'maestro.constructor@lego.com',
  passwordHash: hashPassword('LegoMaster2026!'), // 15 chars
  vipTier: 'Maestro Constructor',
  vipPoints: 1850,
  joinedDate: '15 de Enero de 2024',
};

// Seed initial orders for demo user
const SEED_ORDERS: Order[] = [
  {
    id: 'LEGO-2026-98124',
    date: '28 de Octubre de 2026',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    items: [
      {
        productId: 'ninjago-71766',
        setNumber: '71766',
        name: 'Dragón Legendario de Lloyd',
        themeName: 'NINJAGO®',
        image: 'https://images.brickset.com/sets/images/71766-1.jpg',
        price: 69.99,
        quantity: 1,
      },
      {
        productId: 'scooby-75902',
        setNumber: '75902',
        name: 'La Máquina del Misterio (The Mystery Machine)',
        themeName: 'Scooby-Doo™',
        image: 'https://images.brickset.com/sets/images/75902-1.jpg',
        price: 89.99,
        quantity: 1,
      },
    ],
    subtotal: 159.98,
    shipping: 0,
    total: 159.98,
    status: 'en_camino',
    statusLabel: 'En reparto hacia tu domicilio',
    trackingNumber: 'GLS-LEGO-994821',
    shippingAddress: {
      fullName: 'Emmet Brickowski',
      street: 'Av. Ladrillo Dorado #104, Col. Centro',
      city: 'Ciudad LEGO',
      state: 'Distrito Central',
      postalCode: '64000',
      phone: '+52 55 9876 5432',
    },
    paymentMethod: {
      type: 'Tarjeta Visa VIP',
      last4: '4288',
    },
    vipPointsEarned: 160,
  },
  {
    id: 'LEGO-2026-87410',
    date: '14 de Septiembre de 2026',
    timestamp: Date.now() - 48 * 24 * 60 * 60 * 1000,
    items: [
      {
        productId: 'chima-70005',
        setNumber: '70005',
        name: 'Guerrero León Real de Laval',
        themeName: 'Legends of CHIMA™',
        image: 'https://images.brickset.com/sets/images/70005-1.jpg',
        price: 59.99,
        quantity: 1,
      },
      {
        productId: 'var-10300',
        setNumber: '10300',
        name: 'Máquina del Tiempo de Volver al Futuro',
        themeName: 'LEGO® Icons',
        image: 'https://images.brickset.com/sets/images/10300-1.jpg',
        price: 199.99,
        quantity: 1,
      },
    ],
    subtotal: 259.98,
    shipping: 0,
    total: 259.98,
    status: 'entregado',
    statusLabel: 'Entregado con éxito',
    trackingNumber: 'DHL-LEGO-771920',
    shippingAddress: {
      fullName: 'Emmet Brickowski',
      street: 'Av. Ladrillo Dorado #104, Col. Centro',
      city: 'Ciudad LEGO',
      state: 'Distrito Central',
      postalCode: '64000',
      phone: '+52 55 9876 5432',
    },
    paymentMethod: {
      type: 'Mastercard Gold',
      last4: '9103',
    },
    vipPointsEarned: 260,
  },
];

interface StoredUser extends User {
  passwordHash: string;
}

interface AttemptRecord {
  count: number;
  lockedUntil: number;
  lastAttempt: number;
}

class AuthService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    // Seed default demo user if not present
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!rawUsers) {
      const users: Record<string, StoredUser> = {
        [DEFAULT_DEMO_USER.email.toLowerCase()]: DEFAULT_DEMO_USER,
      };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    // Seed default orders if not present
    const rawOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!rawOrders) {
      const ordersMap: Record<string, Order[]> = {
        [DEFAULT_DEMO_USER.id]: SEED_ORDERS,
      };
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersMap));
    }
  }

  private getUsers(): Record<string, StoredUser> {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveUsers(users: Record<string, StoredUser>) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private getAttemptRecords(): Record<string, AttemptRecord> {
    try {
      const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveAttemptRecords(records: Record<string, AttemptRecord>) {
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(records));
  }

  /**
   * Check if an email or global key is currently locked out
   */
  public getLockoutStatus(email?: string): LockoutInfo {
    const key = (email && email.trim().toLowerCase()) || '__global_client__';
    const records = this.getAttemptRecords();
    const record = records[key] || { count: 0, lockedUntil: 0, lastAttempt: 0 };

    const now = Date.now();
    if (record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        isLocked: true,
        lockedUntil: record.lockedUntil,
        remainingSeconds,
        failedAttempts: record.count,
      };
    }

    // If lock duration expired, reset
    if (record.lockedUntil > 0 && record.lockedUntil <= now) {
      record.count = 0;
      record.lockedUntil = 0;
      records[key] = record;
      this.saveAttemptRecords(records);
    }

    return {
      isLocked: false,
      lockedUntil: 0,
      remainingSeconds: 0,
      failedAttempts: record.count,
    };
  }

  /**
   * Register failed attempt; triggers 15-min lockout at 5 attempts
   */
  private recordFailedAttempt(email: string): LockoutInfo {
    const key = email.trim().toLowerCase() || '__global_client__';
    const records = this.getAttemptRecords();
    const record = records[key] || { count: 0, lockedUntil: 0, lastAttempt: 0 };

    record.count += 1;
    record.lastAttempt = Date.now();

    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    records[key] = record;
    this.saveAttemptRecords(records);

    return this.getLockoutStatus(email);
  }

  /**
   * Clear failed attempts upon successful login
   */
  private clearFailedAttempts(email: string) {
    const key = email.trim().toLowerCase();
    const records = this.getAttemptRecords();
    delete records[key];
    delete records['__global_client__'];
    this.saveAttemptRecords(records);
  }

  /**
   * Validate password rules (at least 12 characters)
   */
  public validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password) {
      return { isValid: false, message: 'La contraseña es requerida.' };
    }
    if (password.length < 12) {
      return {
        isValid: false,
        message: `La contraseña debe contener al menos 12 caracteres (actualmente tiene ${password.length}).`,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate email format
   */
  public validateEmail(email: string): { isValid: boolean; message?: string } {
    if (!email || !email.trim()) {
      return { isValid: false, message: 'El correo electrónico es requerido.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: 'El formato del correo electrónico no es válido.' };
    }
    return { isValid: true };
  }

  /**
   * Login with email and password
   * Returns generic error that never discloses whether the email exists or not
   */
  public login(
    email: string,
    password: string
  ): { success: boolean; user?: User; error?: string; lockout?: LockoutInfo } {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if account is currently locked
    const lockout = this.getLockoutStatus(cleanEmail);
    if (lockout.isLocked) {
      const minutes = Math.floor(lockout.remainingSeconds / 60);
      const seconds = lockout.remainingSeconds % 60;
      const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      return {
        success: false,
        error: `Has superado el límite de 5 intentos fallidos. Tu cuenta está bloqueada temporalmente por 15 minutos. Tiempo restante: ${formattedTime}.`,
        lockout,
      };
    }

    // 2. Validate email syntax
    const emailVal = this.validateEmail(cleanEmail);
    if (!emailVal.isValid) {
      return { success: false, error: emailVal.message };
    }

    // 3. Validate password length (at least 12 characters)
    const passVal = this.validatePassword(password);
    if (!passVal.isValid) {
      return { success: false, error: passVal.message };
    }

    // 4. Verify credentials
    const users = this.getUsers();
    const storedUser = users[cleanEmail];
    const passwordHashed = hashPassword(password);

    // GENERIC ERROR MESSAGE: Does not reveal if email exists or password was wrong!
    const GENERIC_ERROR = 'Credenciales incorrectas. Verifique su correo electrónico o contraseña.';

    if (!storedUser || storedUser.passwordHash !== passwordHashed) {
      const updatedLock = this.recordFailedAttempt(cleanEmail);

      if (updatedLock.isLocked) {
        return {
          success: false,
          error: `Has alcanzado el límite de 5 intentos fallidos. Por tu seguridad, el acceso se ha bloqueado temporalmente por 15 minutos.`,
          lockout: updatedLock,
        };
      }

      const remainingAttempts = MAX_FAILED_ATTEMPTS - updatedLock.failedAttempts;
      const warningExtra =
        remainingAttempts <= 2
          ? ` (Quedan ${remainingAttempts} intento${remainingAttempts === 1 ? '' : 's'} antes del bloqueo de 15 minutos)`
          : '';

      return {
        success: false,
        error: `${GENERIC_ERROR}${warningExtra}`,
        lockout: updatedLock,
      };
    }

    // 5. Successful login
    this.clearFailedAttempts(cleanEmail);

    const safeUser: User = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      vipTier: storedUser.vipTier,
      vipPoints: storedUser.vipPoints,
      joinedDate: storedUser.joinedDate,
      avatarUrl: storedUser.avatarUrl,
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  }

  /**
   * Register a new client account
   */
  public register(
    name: string,
    email: string,
    password: string
  ): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Por favor ingrese su nombre completo (mínimo 2 letras).' };
    }

    const emailVal = this.validateEmail(cleanEmail);
    if (!emailVal.isValid) {
      return { success: false, error: emailVal.message };
    }

    const passVal = this.validatePassword(password);
    if (!passVal.isValid) {
      return { success: false, error: passVal.message };
    }

    const users = this.getUsers();
    if (users[cleanEmail]) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const newUser: StoredUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: cleanName,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      vipTier: 'Constructor',
      vipPoints: 100, // Welcome bonus
      joinedDate: new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date()),
    };

    users[cleanEmail] = newUser;
    this.saveUsers(users);

    const safeUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      vipTier: newUser.vipTier,
      vipPoints: newUser.vipPoints,
      joinedDate: newUser.joinedDate,
    };

    // Auto login new registered user
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  }

  /**
   * Get currently logged-in user
   */
  public getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Logout current user
   */
  public logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  /**
   * Get orders for the specified user
   */
  public getUserOrders(userId: string): Order[] {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      const ordersMap: Record<string, Order[]> = raw ? JSON.parse(raw) : {};
      return ordersMap[userId] || [];
    } catch {
      return [];
    }
  }

  /**
   * Add a newly completed order for a user
   */
  public addOrder(userId: string, order: Order) {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      const ordersMap: Record<string, Order[]> = raw ? JSON.parse(raw) : {};
      const currentList = ordersMap[userId] || [];
      ordersMap[userId] = [order, ...currentList];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersMap));

      // Award VIP points to user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.vipPoints += order.vipPointsEarned;
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));

        const users = this.getUsers();
        if (users[currentUser.email.toLowerCase()]) {
          users[currentUser.email.toLowerCase()].vipPoints += order.vipPointsEarned;
          this.saveUsers(users);
        }
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Manual reset for lockouts (convenience for demo testing)
   */
  public resetLockout(email?: string) {
    const key = (email && email.trim().toLowerCase()) || '__global_client__';
    const records = this.getAttemptRecords();
    delete records[key];
    delete records['__global_client__'];
    this.saveAttemptRecords(records);
  }
}

export const authService = new AuthService();
export const DEMO_CREDENTIALS = {
  email: DEFAULT_DEMO_USER.email,
  password: 'LegoMaster2026!',
};
