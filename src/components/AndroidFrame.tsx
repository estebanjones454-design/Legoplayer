import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  enabled: boolean;
  onDisable: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children, enabled, onDisable }) => {
  if (!enabled) {
    return <>{children}</>;
  }

  // Current real-world time formatted for Android clock
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center justify-center">
      {/* Frame Switcher Bar */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[440px] text-xs text-slate-300 px-2">
        <span className="font-semibold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Simulador Android Galaxy S24 / Pixel
        </span>
        <button
          onClick={onDisable}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium cursor-pointer transition-colors"
        >
          Expandir a Pantalla Completa
        </button>
      </div>

      {/* Android Device Outer Chassis */}
      <div className="w-full max-w-[430px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-700/60 ring-1 ring-white/10 relative">
        {/* Android Device Inner Screen */}
        <div className="bg-slate-50 rounded-[38px] overflow-hidden flex flex-col h-[860px] relative shadow-inner">
          {/* Android Status Bar */}
          <div className="bg-[#FFD500] text-slate-900 px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-bold select-none border-b border-black/10">
            {/* Clock */}
            <span>{timeStr}</span>

            {/* Front Camera Punch-hole */}
            <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-black/40 shadow-inner" />

            {/* Android Icons: Signal, WiFi, Battery */}
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
              <span className="text-[10px]">98%</span>
            </div>
          </div>

          {/* App Screen Content with Scrollable Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
            {children}
          </div>

          {/* Android Bottom Navigation Pill */}
          <div className="bg-white/90 backdrop-blur-md pt-1 pb-2 flex justify-center items-center border-t border-slate-200">
            <div className="w-32 h-1 bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
