import React, { useState } from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { Product } from '../types/lego';
import { soundService } from '../services/soundService';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playBrickSnap();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  // Theme-specific accent colors
  const themeBadgeStyle = {
    ninjago: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    'star-wars': 'text-indigo-800 bg-indigo-50 border-indigo-200',
    chima: 'text-cyan-800 bg-cyan-50 border-cyan-200',
    'scooby-doo': 'text-lime-800 bg-lime-50 border-lime-200',
    variado: 'text-red-700 bg-red-50 border-red-200',
  }[product.theme] || 'text-slate-700 bg-slate-100 border-slate-200';

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-4">
        {/* Set Badge (e.g. "Más Vendido", "Novedad") */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-[#D11013] text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              {product.badge}
            </span>
          </div>
        )}

        {/* Set number top right */}
        <span className="absolute top-2.5 right-2.5 z-10 text-[11px] font-semibold text-slate-400 bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-200/50">
          #{product.setNumber}
        </span>

        {/* Product Image */}
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-lg p-2 text-center">
            <div className="w-12 h-12 rounded bg-[#D11013]/10 text-[#D11013] flex items-center justify-center font-bold text-lg mb-1">
              LEGO
            </div>
            <span className="text-xs font-semibold">{product.name}</span>
            <span className="text-[10px] text-slate-400">Set #{product.setNumber}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Theme & Pieces */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-1.5">
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${themeBadgeStyle}`}>
              {product.themeName}
            </span>
            <span>·</span>
            <span>{product.pieces} pzs</span>
            <span>·</span>
            <span>{product.age}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#D11013] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[11px]">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 block leading-tight">
              En stock
            </span>
          </div>

          {/* Add to Cart Quick Action */}
          <button
            onClick={handleAdd}
            disabled={justAdded}
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              justAdded
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-[#FFD500] hover:bg-[#ffdf33] text-slate-900 active:scale-95'
            }`}
            title="Añadir al carrito"
            aria-label={`Añadir ${product.name} al carrito`}
          >
            {justAdded ? (
              <Check className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Plus className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
