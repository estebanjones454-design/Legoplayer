import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User as UserIcon, AlertTriangle, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';
import { User, LockoutInfo } from '../types/lego';
import { authService, DEMO_CREDENTIALS } from '../services/authService';
import { soundService } from '../services/soundService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lockout State
  const [lockout, setLockout] = useState<LockoutInfo>({
    isLocked: false,
    lockedUntil: 0,
    remainingSeconds: 0,
    failedAttempts: 0,
  });

  // Keep modal mode in sync if opened with initialMode
  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  // Check lockout on mount and when email changes
  useEffect(() => {
    if (isOpen) {
      const status = authService.getLockoutStatus(email);
      setLockout(status);
    }
  }, [isOpen, email]);

  // Countdown timer when locked
  useEffect(() => {
    if (!lockout.isLocked) return;

    const interval = setInterval(() => {
      const updated = authService.getLockoutStatus(email);
      setLockout(updated);
      if (!updated.isLocked) {
        setErrorMsg(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockout.isLocked, email]);

  if (!isOpen) return null;

  // Format remaining lock time (MM:SS)
  const formatLockTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    soundService.playBrickSnap();
    setMode(newMode);
    resetForm();
  };

  const handleFillDemo = () => {
    soundService.playBrickSnap();
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMsg(null);
  };

  const handleUnlockDemo = () => {
    soundService.playBrickSnap();
    authService.resetLockout(email);
    setLockout({
      isLocked: false,
      lockedUntil: 0,
      remainingSeconds: 0,
      failedAttempts: 0,
    });
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // If currently locked out
    if (lockout.isLocked) {
      soundService.playErrorChime();
      setErrorMsg(`La cuenta está bloqueada temporalmente. Espera ${formatLockTime(lockout.remainingSeconds)}.`);
      return;
    }

    // Client-side Password Length Check (Must be >= 12 characters)
    if (password.length < 12) {
      soundService.playErrorChime();
      setErrorMsg(`La contraseña debe tener al menos 12 caracteres (tienes ${password.length}).`);
      return;
    }

    setIsLoading(true);

    if (mode === 'login') {
      const result = authService.login(email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        soundService.playSuccessChime();
        setSuccessMsg('¡Inicio de sesión exitoso! Bienvenido al LEGO Club.');
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 600);
      } else {
        soundService.playErrorChime();
        // Update lockout info from result
        if (result.lockout) {
          setLockout(result.lockout);
        }
        setErrorMsg(result.error || 'Credenciales incorrectas. Verifique su correo electrónico o contraseña.');
      }
    } else {
      // Register mode
      if (password !== confirmPassword) {
        setIsLoading(false);
        soundService.playErrorChime();
        setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }

      const result = authService.register(name, email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        soundService.playSuccessChime();
        setSuccessMsg('¡Cuenta creada con éxito! Bienvenido al programa LEGO VIP.');
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 800);
      } else {
        soundService.playErrorChime();
        setErrorMsg(result.error || 'No se pudo completar el registro.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top LEGO Stud Pattern Banner */}
        <div className="bg-[#D11013] text-white p-5 lego-stud-pattern relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[#FFD500] rounded-sm flex items-center justify-center font-lego font-black text-slate-900 text-xs italic shadow-xs">
              LEGO
            </div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-200">
              LEGO® Insiders Club
            </span>
          </div>

          <h2 className="text-xl font-black text-white font-lego tracking-tight">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta LEGO'}
          </h2>
          <p className="text-xs text-red-100 mt-0.5">
            {mode === 'login'
              ? 'Accede a tus compras, puntos VIP y pedidos protegidos.'
              : 'Regístrate para acumular puntos y proteger tu historial.'}
          </p>
        </div>

        {/* Tab Segmented Control */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Registro de Cliente
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Lockout Warning Banner */}
          {lockout.isLocked && (
            <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-bold text-red-900 block text-sm">
                  Cuenta bloqueada por 15 minutos
                </span>
                <p className="text-red-700 mt-1">
                  Has superado los 5 intentos fallidos consecutivos. Por tu seguridad, el acceso se encuentra suspendido.
                </p>
                <div className="mt-2 flex items-center justify-between bg-red-100/80 px-2.5 py-1.5 rounded-lg border border-red-200">
                  <span className="font-semibold text-red-800">Tiempo restante:</span>
                  <span className="font-mono font-black text-red-950 text-sm">
                    {formatLockTime(lockout.remainingSeconds)}
                  </span>
                </div>
                {/* Demo Unlock button */}
                <button
                  type="button"
                  onClick={handleUnlockDemo}
                  className="mt-2 text-[11px] font-bold text-red-700 hover:text-red-900 underline cursor-pointer"
                >
                  ⚡ Desbloquear ahora (Atajo para pruebas)
                </button>
              </div>
            </div>
          )}

          {/* Generic Error Message (or validation error) */}
          {errorMsg && !lockout.isLocked && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">{errorMsg}</span>
                {lockout.failedAttempts > 0 && lockout.failedAttempts < 5 && (
                  <span className="block text-[11px] text-red-600 mt-0.5">
                    Intentos registrados: {lockout.failedAttempts} de 5 antes del bloqueo.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name field (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Mateo Morales"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#D11013] focus:ring-2 focus:ring-[#D11013]/20 focus:outline-none"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  disabled={lockout.isLocked}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#D11013] focus:ring-2 focus:ring-[#D11013]/20 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password field with Show/Hide Eye Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Contraseña
                </label>
                {/* Character requirement counter */}
                <span
                  className={`text-[11px] font-semibold ${
                    password.length >= 12 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {password.length}/12 caracteres {password.length >= 12 && '✓'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  disabled={lockout.isLocked}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres..."
                  className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#D11013] focus:ring-2 focus:ring-[#D11013]/20 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {/* Show/Hide Password Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-label="Alternar visibilidad de contraseña"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Validation helper note */}
              <p className="text-[10px] text-slate-500 mt-1">
                * Por política de seguridad, la contraseña debe poseer al menos 12 caracteres.
              </p>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña..."
                    className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#D11013] focus:ring-2 focus:ring-[#D11013]/20 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    aria-label="Alternar visibilidad de confirmación"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || lockout.isLocked}
              className="w-full py-3 px-4 bg-[#D11013] hover:bg-[#b50e10] text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {isLoading
                  ? 'Verificando credenciales...'
                  : mode === 'login'
                  ? 'Entrar a Mi Cuenta'
                  : 'Crear Mi Cuenta'}
              </span>
            </button>
          </form>

          {/* Quick Demo Helper Box */}
          {mode === 'login' && (
            <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Usuario de prueba preconfigurado:</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="font-bold text-[#D11013] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded border border-amber-300 shadow-2xs text-[11px]"
                >
                  Autocompletar
                </button>
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-mono">
                <div>Correo: {DEMO_CREDENTIALS.email}</div>
                <div>Contraseña: {DEMO_CREDENTIALS.password} (15 caracteres)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
