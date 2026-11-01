import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { CartItem, User, Order } from '../types/lego';
import { authService } from '../services/authService';
import { soundService } from '../services/soundService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onOpenAuth,
  onOrderCompleted,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState({
    fullName: currentUser?.name || 'Emmet Brickowski',
    street: 'Av. Ladrillo Central #250',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '03100',
    phone: '+52 55 1234 5678',
  });
  const [paymentType, setPaymentType] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const freeShippingThreshold = 49.0;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shipping;
  const vipPointsEarned = Math.floor(subtotal);

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      soundService.playBrickSnap();
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    soundService.playSuccessChime();

    const randomId = Math.floor(10000 + Math.random() * 90000);
    const trackingCode = `DHL-LEGO-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `LEGO-2026-${randomId}`,
      date: new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date()),
      timestamp: Date.now(),
      items: items.map((it) => ({
        productId: it.product.id,
        setNumber: it.product.setNumber,
        name: it.product.name,
        themeName: it.product.themeName,
        image: it.product.image,
        price: it.product.price,
        quantity: it.quantity,
      })),
      subtotal,
      shipping,
      total,
      status: 'preparando',
      statusLabel: 'Pedido recibido - Preparando en bodega oficial',
      trackingNumber: trackingCode,
      shippingAddress: { ...address },
      paymentMethod: {
        type: paymentType === 'card' ? 'Tarjeta Bancaria' : 'Puntos VIP + Saldo',
        last4: '7721',
      },
      vipPointsEarned,
    };

    setTimeout(() => {
      authService.addOrder(currentUser.id, newOrder);
      setIsSubmitting(false);
      setIsCheckingOut(false);
      onClearCart();
      onClose();
      onOrderCompleted(newOrder);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      {/* Drawer Container */}
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 relative">
        {/* Top Bar */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D11013]" />
            <h2 className="text-base font-black text-slate-900 font-lego">
              {isCheckingOut ? 'Finalizar Compra' : 'Tu Carrito LEGO'}
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => {
              if (isCheckingOut) {
                setIsCheckingOut(false);
              } else {
                onClose();
              }
            }}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Alert Bar */}
        {!isCheckingOut && subtotal > 0 && (
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/60 text-xs flex items-center justify-between text-amber-900">
            <div className="flex items-center gap-1.5 font-semibold">
              <Truck className="w-4 h-4 text-[#0055BF]" />
              {subtotal >= freeShippingThreshold ? (
                <span className="text-emerald-700 font-bold">¡Calificas para Envío Gratis! 🎉</span>
              ) : (
                <span>
                  Faltan <strong>${(freeShippingThreshold - subtotal).toFixed(2)}</strong> para Envío Gratis
                </span>
              )}
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!isCheckingOut ? (
            /* Items List Mode */
            items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700">Tu carrito está vacío</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Añade sets de Ninjago, Star Wars, Chima, Scooby-Doo o Variado para comenzar a armar.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-[#FFD500] hover:bg-[#ffdf33] text-slate-900 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex gap-3 items-center"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-xl p-1 shrink-0 border border-slate-100 flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#D11013] uppercase block">
                        #{product.setNumber} · {product.themeName}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                      <span className="text-xs font-black text-slate-800 block mt-0.5">
                        ${product.price.toFixed(2)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            onClick={() => {
                              soundService.playBrickSnap();
                              onUpdateQuantity(product.id, quantity - 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{quantity}</span>
                          <button
                            onClick={() => {
                              soundService.playBrickSnap();
                              onUpdateQuantity(product.id, quantity + 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            soundService.playBrickSnap();
                            onRemoveItem(product.id);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Checkout Form Mode */
            <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-3.5 text-xs">
              {!currentUser && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                  <span>Inicia sesión para guardar este pedido en tu cuenta:</span>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="font-bold text-[#D11013] underline cursor-pointer"
                  >
                    Identificarme
                  </button>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#D11013]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#D11013]"
                  placeholder="Calle y número exterior"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#D11013]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#D11013]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#D11013]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentType === 'card'
                        ? 'border-[#D11013] bg-red-50/50 text-[#D11013] font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    💳 Tarjeta (Visa/MC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('points')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentType === 'points'
                        ? 'border-[#D11013] bg-red-50/50 text-[#D11013] font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    ✨ Puntos VIP + Efectivo
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer with Totals and Action */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} sets):</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className={shipping === 0 ? 'text-emerald-600 font-bold' : 'font-semibold'}>
                  {shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-amber-700 text-[11px]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Puntos VIP que acumularás:
                </span>
                <span className="font-bold">+{vipPointsEarned} pts</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total a Pagar:</span>
                <span className="text-[#D11013]">${total.toFixed(2)}</span>
              </div>
            </div>

            {!isCheckingOut ? (
              <button
                onClick={() => {
                  soundService.playBrickSnap();
                  if (!currentUser) {
                    onOpenAuth();
                  } else {
                    setIsCheckingOut(true);
                  }
                }}
                className="w-full py-3 px-4 bg-[#D11013] hover:bg-[#b50e10] text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continuar a Finalizar Compra</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#0D7B48] hover:bg-[#0b663b] text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:bg-slate-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Procesando Pedido...' : 'Confirmar Pedido y Pagar'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
