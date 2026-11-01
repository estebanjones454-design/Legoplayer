import React, { useState } from 'react';
import {
  Package,
  LogOut,
  ShieldCheck,
  Award,
  ChevronRight,
  Clock,
  MapPin,
  CreditCard,
  ExternalLink,
  Lock,
  Sparkles,
  ShoppingBag,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { User, Order, OrderStatus } from '../types/lego';
import { authService } from '../services/authService';
import { soundService } from '../services/soundService';

interface AccountViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onExploreProducts: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onExploreProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'security'>('orders');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);

  // If user is not authenticated, show protected member gate
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-8 sm:my-16 px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="w-16 h-16 bg-[#D11013]/10 text-[#D11013] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D11013]/20">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-[#D11013] block mb-1">
            Área Protegida para Clientes
          </span>
          <h2 className="text-2xl font-black text-slate-900 font-lego">
            Mi Cuenta y Mis Compras
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Inicia sesión con tu correo y contraseña protegida de al menos 12 caracteres para consultar tu historial de pedidos, seguimiento de envíos y puntos LEGO VIP.
          </p>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => {
                soundService.playBrickSnap();
                onOpenAuth();
              }}
              className="w-full py-3 px-4 bg-[#D11013] hover:bg-[#b50e10] text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Iniciar Sesión / Registrarse</span>
            </button>

            <button
              onClick={() => {
                soundService.playBrickSnap();
                onExploreProducts();
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Explorar Catálogo de Sets
            </button>
          </div>

          {/* Security Features Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Cifrado Seguro
            </span>
            <span>·</span>
            <span>Bloqueo 15 min ante ataques</span>
          </div>
        </div>
      </div>
    );
  }

  // Load user's real persistent orders
  const orders = authService.getUserOrders(currentUser.id);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'entregado':
        return {
          label: 'Entregado',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          step: 4,
        };
      case 'en_camino':
        return {
          label: 'En camino hacia ti',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          step: 3,
        };
      case 'empaquetado':
        return {
          label: 'Empaquetado en bodega',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          step: 2,
        };
      case 'preparando':
      default:
        return {
          label: 'Preparando pedido',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          step: 1,
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* User VIP Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-700/60 relative overflow-hidden lego-stud-dark-pattern">
        {/* LEGO Yellow Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FFD500]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* User Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-[#D11013] text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-lego">{currentUser.name}</h1>
                <span className="bg-[#FFD500] text-slate-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs">
                  {currentUser.vipTier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{currentUser.email}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Miembro del club desde: {currentUser.joinedDate}
              </p>
            </div>
          </div>

          {/* Points & Logout action */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-right">
              <span className="text-[10px] uppercase font-bold text-amber-300 block flex items-center gap-1 justify-end">
                <Award className="w-3.5 h-3.5" /> Puntos VIP
              </span>
              <span className="text-lg font-black text-white">{currentUser.vipPoints.toLocaleString()} pts</span>
              <span className="text-[10px] text-slate-300 block">Equivale a ${(currentUser.vipPoints / 100).toFixed(2)} de descuento</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                soundService.playBrickSnap();
                onLogout();
              }}
              className="p-2.5 sm:px-3 sm:py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => {
            soundService.playBrickSnap();
            setActiveTab('orders');
          }}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#D11013] text-[#D11013]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Compras ({orders.length})</span>
        </button>

        <button
          onClick={() => {
            soundService.playBrickSnap();
            setActiveTab('security');
          }}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'border-[#D11013] text-[#D11013]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Seguridad de la Cuenta</span>
        </button>
      </div>

      {/* Tab 1: Mis Compras (Historial de Compras) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">Aún no tienes compras realizadas</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explora las secciones de Ninjago, Star Wars, Chima, Scooby-Doo y Variado para armar tu primer set.
              </p>
              <button
                onClick={onExploreProducts}
                className="mt-4 px-4 py-2 bg-[#FFD500] hover:bg-[#ffdf33] text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Top Bar */}
                  <div className="bg-slate-50/80 px-4 sm:px-6 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Número de Pedido</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                          #{order.id}
                        </span>
                      </div>
                      <span className="text-slate-300">·</span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha</span>
                        <span className="text-xs text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {order.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
                        {order.statusLabel}
                      </span>
                      <button
                        onClick={() => setSelectedReceipt(order)}
                        className="text-xs font-bold text-[#0055BF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Recibo</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Status Progress Tracker */}
                  <div className="px-4 sm:px-6 pt-4 pb-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span className={statusInfo.step >= 1 ? 'font-bold text-[#D11013]' : ''}>1. Preparando</span>
                      <span className={statusInfo.step >= 2 ? 'font-bold text-[#D11013]' : ''}>2. Empaquetado</span>
                      <span className={statusInfo.step >= 3 ? 'font-bold text-[#D11013]' : ''}>3. En Camino</span>
                      <span className={statusInfo.step >= 4 ? 'font-bold text-emerald-600' : ''}>4. Entregado</span>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D11013] h-full transition-all duration-500 rounded-full"
                        style={{ width: `${(statusInfo.step / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-4 sm:p-6 divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[#D11013] uppercase">
                              {item.themeName} · Set #{item.setNumber}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {item.name}
                            </h4>
                            <span className="text-xs text-slate-500">
                              Cantidad: {item.quantity} · ${item.price.toFixed(2)} c/u
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Tracking Details */}
                  <div className="bg-slate-50/60 px-4 sm:px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-500">Guía: {order.trackingNumber}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">Puntos VIP: +{order.vipPointsEarned} pts</span>
                      <span className="text-base font-black text-slate-900">
                        Total: ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Seguridad de la Cuenta */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Políticas de Seguridad Implementadas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tu cuenta está protegida con los estándares de seguridad solicitados para la plataforma LEGO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Longitud de Contraseña Obligatoria
              </span>
              <p className="text-xs text-slate-600">
                Se exige y valida en el cliente y servidor una longitud mínima de 12 caracteres para prevenir ataques de fuerza bruta.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Bloqueo Temporal de 15 Minutos
              </span>
              <p className="text-xs text-slate-600">
                Tras 5 intentos fallidos consecutivos de contraseña, el acceso a la cuenta se bloquea automáticamente por 15 minutos con cuenta regresiva.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Mensajes de Error Genéricos
              </span>
              <p className="text-xs text-slate-600">
                La respuesta de fallo no revela si el correo está o no registrado en el sistema, mitigando la enumeración de usuarios.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Visualización Segura de Contraseña
              </span>
              <p className="text-xs text-slate-600">
                El campo de contraseña viene oculto por defecto con opción accesible de mostrar/ocultar mediante icono de visibilidad.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#D11013] text-white font-black text-xs flex items-center justify-center rounded-sm italic">
                  LEGO
                </div>
                <span className="text-sm font-bold text-slate-900">Comprobante Oficial</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Orden:</span>
                <span className="font-mono font-bold text-slate-900">#{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Fecha:</span>
                <span className="text-slate-900">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Cliente:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.shippingAddress.fullName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Dirección de Entrega:</span>
                <span className="text-slate-900 text-right">{selectedReceipt.shippingAddress.street}, {selectedReceipt.shippingAddress.city}</span>
              </div>

              {/* Items Table */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Artículos:</span>
                {selectedReceipt.items.map((it, i) => (
                  <div key={i} className="flex justify-between py-1 text-slate-600">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="font-semibold">${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${selectedReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Envío Especial LEGO</span>
                  <span>GRATIS</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1">
                  <span>Total Pagado</span>
                  <span>${selectedReceipt.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
