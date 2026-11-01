import React from 'react';
import { Home, Grid, ShoppingBag, User as UserIcon } from 'lucide-react';
import { soundService } from '../services/soundService';

export type ActiveTab = 'home' | 'themes' | 'cart' | 'account';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  cartCount: number;
  isLoggedIn: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  isLoggedIn,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    soundService.playBrickSnap();
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Inicio */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#D11013]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D11013] rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-bold mt-1">Inicio</span>
        </button>

        {/* Temas */}
        <button
          onClick={() => handleTabClick('themes')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'themes' ? 'text-[#D11013]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Grid className="w-5 h-5" />
            {activeTab === 'themes' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D11013] rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-bold mt-1">Temas</span>
        </button>

        {/* Carrito */}
        <button
          onClick={() => handleTabClick('cart')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer ${
            activeTab === 'cart' ? 'text-[#D11013]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#D11013] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            {activeTab === 'cart' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D11013] rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-bold mt-1">Carrito</span>
        </button>

        {/* Mi Cuenta / Mis Compras */}
        <button
          onClick={() => handleTabClick('account')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'account' ? 'text-[#D11013]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <UserIcon className="w-5 h-5" />
            {isLoggedIn && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            )}
            {activeTab === 'account' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D11013] rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-bold mt-1">Mi Cuenta</span>
        </button>
      </div>
    </nav>
  );
};
