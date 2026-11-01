import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check, Users } from 'lucide-react';
import { Product } from '../types/lego';
import { soundService } from '../services/soundService';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentImg = selectedImage || product.image;

  const handleAddToCart = () => {
    soundService.playBrickSnap();
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    soundService.playBrickSnap();
    onBuyNow(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header with Close */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#D11013] uppercase tracking-wider">
              {product.themeName}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">Set #{product.setNumber}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Gallery & Large Image */}
            <div className="flex flex-col gap-3">
              <div className="aspect-square w-full bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-200/60 shadow-inner overflow-hidden relative">
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#D11013] text-white text-xs font-extrabold uppercase px-2.5 py-1 rounded shadow-sm">
                    {product.badge}
                  </span>
                )}
                <img
                  src={currentImg}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-lg transition-all duration-300"
                />
              </div>

              {/* Gallery Thumbnails */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {product.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundService.playBrickSnap();
                        setSelectedImage(img);
                      }}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 p-1 bg-slate-50 transition-all cursor-pointer ${
                        currentImg === img ? 'border-[#D11013] ring-2 ring-[#D11013]/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Spec Tags */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Piezas</span>
                  <span className="text-sm font-black text-slate-800">{product.pieces}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Edad</span>
                  <span className="text-sm font-black text-slate-800">{product.age}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Minifiguras</span>
                  <span className="text-sm font-black text-slate-800">{product.minifiguresCount}</span>
                </div>
              </div>
            </div>

            {/* Right: Product Info, Price, Actions */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({product.reviewsCount} reseñas verificadas)</span>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Precio Oficial</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md">
                      Disponible
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Envío Gratis</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Descripción del Set
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Features Bullets */}
                {product.features && product.features.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Características Principales
                    </h3>
                    <ul className="space-y-1.5">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D11013] mt-1.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Minifigures list if any */}
                {product.minifigures && product.minifigures.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                      <Users className="w-4 h-4 text-[#0055BF]" />
                      <span>Minifiguras Incluidas ({product.minifiguresCount}):</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {product.minifigures.join(' · ')}
                    </p>
                  </div>
                )}

                {/* Dimensions */}
                {product.dimensions && (
                  <div className="mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Dimensiones del modelo: </span>
                    {product.dimensions.height} de alto x {product.dimensions.width} de ancho x {product.dimensions.depth} de profundidad.
                  </div>
                )}
              </div>

              {/* Purchase Actions */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                {/* Quantity selector */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                  <div className="flex items-center gap-2 border border-slate-300 rounded-xl p-1 bg-white">
                    <button
                      onClick={() => {
                        soundService.playBrickSnap();
                        setQuantity((q) => Math.max(1, q - 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                    <button
                      onClick={() => {
                        soundService.playBrickSnap();
                        setQuantity((q) => q + 1);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    className={`py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#FFD500] hover:bg-[#ffdf33] text-slate-900 active:scale-[0.98]'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>¡Añadido al Carrito!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Añadir al Carrito</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="py-3 px-4 rounded-xl font-black text-sm bg-[#D11013] hover:bg-[#b50e10] text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>Comprar Ahora</span>
                  </button>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500 pt-2">
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-4 h-4 text-[#0055BF] mb-1" />
                    <span>100% Original LEGO</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck className="w-4 h-4 text-emerald-600 mb-1" />
                    <span>Envío Garantizado</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <RotateCcw className="w-4 h-4 text-amber-600 mb-1" />
                    <span>30 días devolución</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
