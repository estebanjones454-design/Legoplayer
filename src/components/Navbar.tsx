import React from 'react';
import { ShoppingBag, User as UserIcon, Volume2, VolumeX, Smartphone, Monitor, Search, Sparkles } from 'lucide-react';
import { User } from '../types/lego';
import { soundService } from '../services/soundService';

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onNavigateToAccount: () => void;
  onNavigateToHome: () => void;
  onOpenLegoBot: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAndroidView: boolean;
  onToggleAndroidView: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onNavigateToAccount,
  onNavigateToHome,
  onOpenLegoBot,
  searchQuery,
  onSearchChange,
  isAndroidView,
  onToggleAndroidView,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFD500] text-slate-900 border-b-4 border-[#D11013] shadow-md">
      {/* Official Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* LEGO Logo + Brand */}
          <button
            onClick={() => {
              soundService.playBrickSnap();
              onNavigateToHome();
            }}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            aria-label="Ir a la página de inicio LEGO"
          >
            {/* Iconic LEGO Red Box Logo */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#D11013] rounded-sm flex items-center justify-center shadow-md border-2 border-black/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-lg sm:text-xl tracking-tighter italic select-none font-lego">
                LEGO
              </span>
            </div>
            <div className="hidden xs:block">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#D11013] block leading-none">
                Oficial Store
              </span>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                Mundo Bricks
              </span>
            </div>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar sets, temas, # de set..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white text-slate-900 placeholder:text-slate-500 text-xs sm:text-sm pl-9 pr-3 py-2 rounded-full border-2 border-slate-900/10 focus:border-[#D11013] focus:outline-none focus:ring-2 focus:ring-[#D11013]/20 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* AI Advisor Button */}
            <button
              onClick={() => {
                soundService.playBrickSnap();
                onOpenLegoBot();
              }}
              className="p-2 text-slate-900 hover:bg-black/10 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
              title="Asistente Maestro Constructor"
              aria-label="Asistente LEGO"
            >
              <Sparkles className="w-5 h-5 text-[#D11013] animate-pulse" />
              <span className="hidden md:inline text-xs font-bold">Asesor</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 text-slate-900 hover:bg-black/10 rounded-full transition-colors cursor-pointer"
              title={soundEnabled ? 'Sonidos LEGO activados' : 'Sonidos desactivados'}
              aria-label="Alternar sonido de ladrillos"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-800" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>

            {/* Android Frame Simulator Toggle (Desktop only) */}
            <button
              onClick={() => {
                soundService.playBrickSnap();
                onToggleAndroidView();
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-black/10 hover:bg-black/15 text-slate-900 transition-colors cursor-pointer"
              title="Alternar entre vista web y simulador móvil Android"
            >
              {isAndroidView ? (
                <>
                  <Monitor className="w-4 h-4 text-[#D11013]" />
                  <span>Modo Web</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 text-[#0055BF]" />
                  <span>Modo Android</span>
                </>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => {
                soundService.playBrickSnap();
                onOpenCart();
              }}
              className="relative p-2 text-slate-900 hover:bg-black/10 rounded-full transition-colors cursor-pointer"
              aria-label="Ver carrito de compras"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D11013] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FFD500] shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Login Button */}
            {currentUser ? (
              <button
                onClick={() => {
                  soundService.playBrickSnap();
                  onNavigateToAccount();
                }}
                className="flex items-center gap-1.5 pl-2 pr-3 py-1 bg-white/90 hover:bg-white text-slate-900 rounded-full border border-black/10 shadow-sm transition-all cursor-pointer"
                title="Ir a Mi Cuenta y Mis Compras"
              >
                <div className="w-6 h-6 rounded-full bg-[#0055BF] text-white font-black text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold max-w-[80px] sm:max-w-[120px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundService.playBrickSnap();
                  onOpenAuth();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#D11013] hover:bg-[#b00d0f] text-white rounded-full text-xs font-black shadow-sm transition-all cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
