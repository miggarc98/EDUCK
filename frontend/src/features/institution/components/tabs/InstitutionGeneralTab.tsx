import React from "react";
import { Building2, Upload, Trash2, Info } from "lucide-react";

interface InstitutionGeneralTabProps {
  institutionName: string;
  setInstitutionName: (val: string) => void;
  daneNit: string;
  setDaneNit: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  logoPreview: string | null;
  setLogoPreview: (val: string | null) => void;
  isFormalEducation: boolean;
  setIsFormalEducation: (val: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function InstitutionGeneralTab({
  institutionName,
  setInstitutionName,
  daneNit,
  setDaneNit,
  address,
  setAddress,
  phone,
  setPhone,
  email,
  setEmail,
  logoPreview,
  setLogoPreview,
  isFormalEducation,
  setIsFormalEducation,
  fileInputRef,
}: InstitutionGeneralTabProps) {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Identidad Institucional
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Información oficial que aparecerá en boletines y certificados
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subida de Logo */}
        <div className="md:col-span-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
          {logoPreview ? (
            <div className="relative group w-32 h-32 mb-4">
              <img
                src={logoPreview}
                alt="Logo Institucional"
                className="w-full h-full object-contain rounded-xl p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={() => setLogoPreview(null)}
                className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 mb-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
            >
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
              <span className="text-[11px] font-semibold text-slate-500 group-hover:text-blue-500">
                Cargar Logo
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
          <span className="text-[10px] text-slate-400 text-center">
            Formato PNG o JPG (Máx. 2MB). Recomendado 512x512px con fondo transparente.
          </span>
        </div>

        {/* Formulario de Campos */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Oficial de la Institución
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código DANE / NIT
              </label>
              <input
                type="text"
                value={daneNit}
                onChange={(e) => setDaneNit(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dirección Sede Principal
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Toggle Switch para Currículo Oficial / Régimen Ley 115 */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="relative group shrink-0 mt-0.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 cursor-help">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs rounded-xl shadow-xl z-30 border border-slate-700 leading-relaxed pointer-events-none">
                    Activa esta opción si la institución es un colegio de educación formal regido por la Ley 115 de 1994. Esto precargará las áreas obligatorias exigidas por el Ministerio de Educación. Desactívalo para academias, cursos libres o institutos con currículos personalizados.
                  </div>
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                    Currículo Oficial / Régimen Ley 115 (Colombia)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Habilita áreas y asignaturas obligatorias exigidas por el Ministerio de Educación Nacional (MEN).
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isFormalEducation}
                  onChange={(e) => setIsFormalEducation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
