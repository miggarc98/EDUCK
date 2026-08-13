import { useState } from 'react';
import { ShieldAlert, Copy, Check, Download, ArrowRight, Loader2, Key } from 'lucide-react';
import { authApi } from '../services/api';

interface TwoFactorModalProps {
  isOpen: boolean;
  setupRequired: boolean;
  twoFactorToken: string;
  qrCode?: string;
  secret?: string;
  onSuccess: (data: { token: string; refresh: string; user: any; backup_codes?: string[] }) => void;
  onCancel: () => void;
}

export function TwoFactorModal({
  isOpen,
  setupRequired,
  twoFactorToken,
  qrCode,
  secret,
  onSuccess,
  onCancel,
}: TwoFactorModalProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (backupCodes) {
      const element = document.createElement("a");
      const file = new Blob([
        "CÓDIGOS DE RECUPERACIÓN DE EDUCK\n",
        "Guarda estos códigos en un lugar seguro. Solo pueden ser usados una vez.\n\n",
        backupCodes.join("\n")
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "educk_codigos_respaldo.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Por favor ingresa un código válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (setupRequired && !backupCodes) {
        // Modo Onboarding: Activación inicial
        const response = await authApi.activate2FA(twoFactorToken, code);
        if (response.token && response.refresh && response.user) {
          if (response.backup_codes && response.backup_codes.length > 0) {
            setBackupCodes(response.backup_codes);
            // No llamamos onSuccess aún, dejamos que el usuario vea y descargue los códigos de respaldo
          } else {
            onSuccess({
              token: response.token,
              refresh: response.refresh,
              user: response.user
            });
          }
        } else {
          throw new Error('Error al activar el doble factor.');
        }
      } else {
        // Modo Normal: Verificación
        const response = await authApi.verify2FA(twoFactorToken, code);
        if (response.token && response.refresh && response.user) {
          onSuccess({
            token: response.token,
            refresh: response.refresh,
            user: response.user
          });
        } else {
          throw new Error('Error al verificar el doble factor.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Código de verificación incorrecto. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">
        
        {/* Encabezado */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Autenticación de Doble Factor (2FA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {setupRequired ? 'Configura tu segundo factor de seguridad' : 'Introduce tu código de verificación'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl text-sm leading-relaxed">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* CASO: Mostrar Códigos de Respaldo después del Onboarding */}
          {setupRequired && backupCodes ? (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">¡2FA Activado Correctamente!</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Guarda estos códigos de recuperación de un solo uso. Te permitirán acceder a tu cuenta si pierdes tu dispositivo móvil.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl font-mono text-center text-sm font-semibold tracking-wider text-slate-700 dark:text-slate-300">
                {backupCodes.map((bCode, idx) => (
                  <div key={idx} className="py-1.5 px-3 border border-dashed border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900">
                    {bCode}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  <Download className="w-4 h-4" />
                  Descargar Códigos
                </button>
                <button
                  type="button"
                  onClick={onCancel} // Recargará o cerrará modal y se considerará autenticado
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
                >
                  Entendido, Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : setupRequired ? (
            /* CASO: Onboarding inicial con QR y Clave Manual */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  1. Escanea este código QR con tu aplicación de autenticación (ej. Google Authenticator, Authy, Microsoft Authenticator):
                </p>

                {qrCode && (
                  <div className="flex justify-center p-4 bg-white border border-slate-100 rounded-xl max-w-[200px] mx-auto">
                    <img src={qrCode} alt="Código QR de Configuración 2FA" className="w-full h-auto" />
                  </div>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                  ¿No puedes escanear el código QR? Ingresa esta clave secreta manualmente en tu app:
                </p>

                <div className="flex items-center gap-2 max-w-sm mx-auto p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl font-mono text-xs select-all text-slate-800 dark:text-slate-200 justify-between">
                  <span className="truncate pr-2 font-bold tracking-wider">{secret}</span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all shrink-0"
                    title="Copiar Clave"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="pt-2">
                  2. Una vez agregada la cuenta a tu app de autenticación, escribe el código de 6 dígitos aquí abajo para confirmar la activación:
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Ej: 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-xl font-bold tracking-[0.4em] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:tracking-normal"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Activar y Confirmar'}
                </button>
              </div>
            </form>
          ) : (
            /* CASO: Verificación Normal del 2FA */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Introduce el código de verificación temporal de tu app de autenticación o uno de tus códigos de respaldo de 8 dígitos.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Código de 6 u 8 dígitos"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-xl font-bold tracking-[0.2em] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:tracking-normal"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar e Ingresar'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
