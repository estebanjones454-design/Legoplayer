/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Shield,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Product, CartItem, User, LegoTheme, Order } from './types/lego';
import { PRODUCTS, THEME_CONFIG } from './data/products';
import { authService } from './services/authService';
import { soundService } from './services/soundService';
import { Navbar } from './components/Navbar';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { AndroidFrame } from './components/AndroidFrame';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AuthModal } from './components/AuthModal';
import { AccountView } from './components/AccountView';
import { CartDrawer } from './components/CartDrawer';
import { LegoBotModal } from './components/LegoBotModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<LegoTheme | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAndroidFrameEnabled, setIsAndroidFrameEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLegoBotOpen, setIsLegoBotOpen] = useState(false);

  // User & Cart state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lego_store_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize auth user from session
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setSoundEnabled(soundService.isEnabled());
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    localStorage.setItem('lego_store_cart_v1', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleSound = () => {
    const newState = soundService.toggleSound();
    setSoundEnabled(newState);
    addToast('info', newState ? 'Efectos de sonido activados' : 'Efectos de sonido silenciados');
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast('success', `Añadido: ${product.name} al carrito`);
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Auth operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    addToast('success', `¡Hola de nuevo, ${user.name}!`);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveTab('home');
    addToast('info', 'Has cerrado sesión correctamente.');
  };

  const handleOrderCompleted = (order: Order) => {
    addToast('success', `¡Pedido #${order.id} confirmado con éxito!`);
    setActiveTab('account');
  };

  const handleSelectProductById = (productId: string) => {
    const prod = PRODUCTS.find((p) => p.id === productId);
    if (prod) {
      setSelectedProduct(prod);
    }
  };

  // Filter products by search or active theme
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.setNumber.includes(searchQuery) ||
      product.themeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTheme =
      selectedThemeFilter === 'all' || product.theme === selectedThemeFilter;

    return matchesSearch && matchesTheme;
  });

  const cartTotalCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  // Categorized product groups for the home page sections
  const themesList: LegoTheme[] = ['ninjago', 'star-wars', 'chima', 'scooby-doo', 'variado'];

  return (
    <AndroidFrame
      enabled={isAndroidFrameEnabled}
      onDisable={() => setIsAndroidFrameEnabled(false)}
    >
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-16 md:pb-0">
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          cartCount={cartTotalCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => {
            setAuthInitialMode('login');
            setIsAuthModalOpen(true);
          }}
          onNavigateToAccount={() => setActiveTab('account')}
          onNavigateToHome={() => {
            setActiveTab('home');
            setSelectedThemeFilter('all');
            setSearchQuery('');
          }}
          onOpenLegoBot={() => setIsLegoBotOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAndroidView={isAndroidFrameEnabled}
          onToggleAndroidView={() => setIsAndroidFrameEnabled(!isAndroidFrameEnabled)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {activeTab === 'account' ? (
            /* Protected Account & Order History View */
            <AccountView
              currentUser={currentUser}
              onOpenAuth={() => {
                setAuthInitialMode('login');
                setIsAuthModalOpen(true);
              }}
              onLogout={handleLogout}
              onExploreProducts={() => {
                setActiveTab('home');
                setSelectedThemeFilter('all');
              }}
            />
          ) : activeTab === 'themes' ? (
            /* Themes Exploration Hub */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="mb-6">
                <span className="text-xs uppercase font-extrabold text-[#D11013] tracking-wider block">
                  Catálogo Oficial LEGO®
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-lego">
                  Temáticas Legendarias
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Selecciona una temática para filtrar todos los sets disponibles.
                </p>
              </div>

              {/* Theme Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {themesList.map((themeKey) => {
                  const cfg = THEME_CONFIG[themeKey];
                  const count = PRODUCTS.filter((p) => p.theme === themeKey).length;
                  const isSelected = selectedThemeFilter === themeKey;

                  return (
                    <button
                      key={themeKey}
                      onClick={() => {
                        soundService.playBrickSnap();
                        setSelectedThemeFilter(isSelected ? 'all' : themeKey);
                      }}
                      className={`p-5 rounded-3xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-[#D11013] bg-white ring-4 ring-[#D11013]/10 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{cfg.icon}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {count} sets
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 font-lego group-hover:text-[#D11013] transition-colors">
                        {cfg.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {cfg.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Filtered Grid Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 font-lego flex items-center gap-2">
                  <span>Sets en exhibición</span>
                  <span className="text-xs font-bold text-slate-400">({filteredProducts.length})</span>
                </h2>
                {selectedThemeFilter !== 'all' && (
                  <button
                    onClick={() => setSelectedThemeFilter('all')}
                    className="text-xs font-bold text-[#D11013] hover:underline cursor-pointer"
                  >
                    Mostrar todas las temáticas
                  </button>
                )}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Home Page with LEGO Thematic Sections */
            <div className="space-y-8 sm:space-y-12 pb-10">
              {/* Hero Banner with LEGO Android Branding */}
              <div className="bg-[#D11013] text-white py-6 sm:py-10 px-4 sm:px-6 relative overflow-hidden lego-stud-pattern border-b-4 border-[#FFD500]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="max-w-xl text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs font-bold text-[#FFD500] mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Optimizado para Android · Colección Oficial 2026</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black font-lego tracking-tight leading-none">
                      Construye Tu Aventura LEGO®
                    </h1>
                    <p className="text-xs sm:text-base text-red-100 mt-3 leading-relaxed">
                      Explora los universos favoritos de Ninjago, Star Wars, Legends of Chima, Scooby-Doo y Variado con compras seguras e historial de pedidos.
                    </p>

                    {/* Quick Action Badges */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-5">
                      <button
                        onClick={() => {
                          soundService.playBrickSnap();
                          const el = document.getElementById('sec-ninjago');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-2 bg-[#FFD500] hover:bg-[#ffdf33] text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Ver Ninjago
                      </button>
                      <button
                        onClick={() => {
                          soundService.playBrickSnap();
                          const el = document.getElementById('sec-star-wars');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-2 bg-slate-950/80 hover:bg-slate-950 text-white font-black text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
                      >
                        Ver Star Wars
                      </button>
                      <button
                        onClick={() => {
                          soundService.playBrickSnap();
                          setIsLegoBotOpen(true);
                        }}
                        className="px-4 py-2 bg-white text-[#D11013] font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Preguntar a BrickBot</span>
                      </button>
                    </div>
                  </div>

                  {/* Hero Visual Banner Cards Preview */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="w-48 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xl text-center transform -rotate-2 hover:rotate-0 transition-transform">
                      <img
                        src="https://images.brickset.com/sets/images/75902-1.jpg"
                        alt="Scooby Doo Mystery Machine"
                        className="w-full h-28 object-contain drop-shadow-md"
                      />
                      <span className="text-[11px] font-bold block text-amber-200 mt-1">Scooby-Doo™</span>
                      <span className="text-xs font-black block">Mystery Machine</span>
                    </div>
                    <div className="w-52 bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/30 shadow-2xl text-center transform rotate-2 hover:rotate-0 transition-transform">
                      <img
                        src="https://images.brickset.com/sets/images/71766-1.jpg"
                        alt="Ninjago Lloyd Dragon"
                        className="w-full h-32 object-contain drop-shadow-lg"
                      />
                      <span className="text-[11px] font-bold block text-emerald-300 mt-1">NINJAGO®</span>
                      <span className="text-xs font-black block">Dragón Legendario</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thematic Category Filter Bar */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button
                    onClick={() => {
                      soundService.playBrickSnap();
                      setSelectedThemeFilter('all');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedThemeFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Todos los Sets ({PRODUCTS.length})
                  </button>

                  {themesList.map((t) => {
                    const cfg = THEME_CONFIG[t];
                    const isSelected = selectedThemeFilter === t;
                    return (
                      <button
                        key={t}
                        onClick={() => {
                          soundService.playBrickSnap();
                          setSelectedThemeFilter(t);
                          const el = document.getElementById(`sec-${t}`);
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#D11013] text-white shadow-md'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Search Results (if searching) */}
              {searchQuery && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900 font-lego">
                      Resultados para "{searchQuery}" ({filteredProducts.length})
                    </h2>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-[#D11013] hover:underline cursor-pointer"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                      <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No encontramos sets con ese término</p>
                      <p className="text-xs text-slate-400 mt-1">Prueba buscando Ninjago, Halcón, Scooby, Laval o Technic</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelect={setSelectedProduct}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5 Thematic Sections (Ninjago, Star Wars, Chima, Scooby-Doo, Variado) */}
              {!searchQuery && (
                <div className="space-y-10 sm:space-y-16 max-w-7xl mx-auto px-4 sm:px-6">
                  {themesList.map((themeKey) => {
                    const cfg = THEME_CONFIG[themeKey];
                    const themeProducts = PRODUCTS.filter((p) => p.theme === themeKey);

                    // Skip if filter is set to something else
                    if (selectedThemeFilter !== 'all' && selectedThemeFilter !== themeKey) {
                      return null;
                    }

                    return (
                      <section
                        key={themeKey}
                        id={`sec-${themeKey}`}
                        className="space-y-4 scroll-mt-24"
                      >
                        {/* Section Thematic Header */}
                        <div
                          className={`rounded-3xl p-4 sm:p-6 bg-gradient-to-r ${cfg.bannerGradient} text-white shadow-lg border border-white/10 relative overflow-hidden lego-stud-dark-pattern`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl sm:text-4xl">{cfg.icon}</span>
                              <div>
                                <h2 className="text-xl sm:text-2xl font-black font-lego tracking-tight">
                                  {cfg.name}
                                </h2>
                                <p className="text-xs text-slate-300 mt-0.5">
                                  {cfg.tagline}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-bold border border-white/15">
                                {themeProducts.length} Sets Disponibles
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Product Grid for Section */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                          {themeProducts.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onSelect={setSelectedProduct}
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}

              {/* LEGO Club VIP Membership Callout Banner */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="bg-[#FFD500] rounded-3xl p-6 sm:p-8 border-4 border-[#D11013] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 lego-stud-pattern">
                  <div className="max-w-xl text-center md:text-left">
                    <span className="text-xs uppercase font-black text-[#D11013] tracking-wider block mb-1">
                      Club Oficial de Constructores
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-lego">
                      Únete a LEGO® Insiders & Acumula Puntos VIP
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-800 mt-2 font-medium">
                      Regístrate con tu correo y contraseña segura de 12 caracteres para recibir 100 puntos de bienvenida, descuentos exclusivos y acceso anticipado a sets coleccionables.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {currentUser ? (
                      <button
                        onClick={() => {
                          soundService.playBrickSnap();
                          setActiveTab('account');
                        }}
                        className="px-6 py-3 bg-[#D11013] hover:bg-[#b50e10] text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer text-center"
                      >
                        Ver Mis Compras y Puntos VIP
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            soundService.playBrickSnap();
                            setAuthInitialMode('register');
                            setIsAuthModalOpen(true);
                          }}
                          className="px-6 py-3 bg-[#D11013] hover:bg-[#b50e10] text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer text-center"
                        >
                          Crear Cuenta Gratis (+100 pts)
                        </button>
                        <button
                          onClick={() => {
                            soundService.playBrickSnap();
                            setAuthInitialMode('login');
                            setIsAuthModalOpen(true);
                          }}
                          className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm rounded-xl border border-black/15 shadow-sm transition-all cursor-pointer text-center"
                        >
                          Iniciar Sesión
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 text-white pt-10 pb-8 px-4 sm:px-6 border-t-4 border-[#D11013] mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#D11013] text-white font-lego font-black text-base flex items-center justify-center rounded-sm italic">
                  LEGO
                </div>
                <span className="font-lego font-black text-lg text-white">Mundo Bricks</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Tienda web oficial LEGO® adaptada para dispositivos móviles Android con experiencias completas en Ninjago, Star Wars, Chima, Scooby-Doo y Variado.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3">Temáticas</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>NINJAGO® Spinjitzu</li>
                <li>Star Wars™ Colección Galáctica</li>
                <li>Legends of CHIMA™ CHI Poder</li>
                <li>Scooby-Doo™ Misterios</li>
                <li>LEGO® Icons & Technic</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3">Seguridad y Cuenta</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>Validación de Contraseñas (≥12 caracteres)</li>
                <li>Bloqueo temporal de 15 min ante 5 fallos</li>
                <li>Mensajes de error genéricos anti-enumeración</li>
                <li>Historial protegido de pedidos</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3">Asistencia</h4>
              <p className="text-slate-400 mb-2">
                ¿Necesitas ayuda con algún ensamble o recomendación de edad?
              </p>
              <button
                onClick={() => {
                  soundService.playBrickSnap();
                  setIsLegoBotOpen(true);
                }}
                className="w-full py-2 px-3 bg-[#FFD500] hover:bg-[#ffdf33] text-slate-900 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#D11013]" />
                <span>Hablar con BrickBot</span>
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px]">
            LEGO, el logotipo de LEGO, la minifigura, Ninjago, Legends of Chima y las configuraciones de ladrillos son marcas comerciales del Grupo LEGO.
          </div>
        </footer>

        {/* Android Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'cart') {
              setIsCartOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          cartCount={cartTotalCount}
          isLoggedIn={currentUser !== null}
        />

        {/* Modals */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authInitialMode}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthInitialMode('login');
            setIsAuthModalOpen(true);
          }}
          onOrderCompleted={handleOrderCompleted}
        />

        <LegoBotModal
          isOpen={isLegoBotOpen}
          onClose={() => setIsLegoBotOpen(false)}
          onSelectProductById={handleSelectProductById}
        />

        {/* Notification Toasts */}
        <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </AndroidFrame>
  );
}
