import { X, Briefcase, Mail, Phone, Calendar, BookOpen, Clock, Award, Users, FileText, HeartPulse } from 'lucide-react';
import type { Teacher } from '../types';

const evaluationData = [
  { category: 'Pedagogía', score: 4.5 },
  { category: 'Puntualidad', score: 4.8 },
  { category: 'Innovación', score: 4.2 },
  { category: 'Convivencia', score: 4.7 },
  { category: 'Planeación', score: 4.6 },
];

export function TeacherProfile({ teacher, onBack }: { teacher: Teacher, onBack: () => void }) {
  const teacherName = `${teacher.first_name} ${teacher.last_name}`;
  const status = teacher.is_active ? 'active' : 'inactive';
  const area = teacher.id % 2 === 0 ? 'Ciencias Exactas' : 'Humanidades y Lenguas';
  const load = 12 + (teacher.id % 3) * 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-50 dark:bg-slate-800 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            Expediente del Docente
          </h2>
          <button 
            onClick={onBack} 
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-105 dark:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* Header Profile */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-950/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-450 flex items-center justify-center font-bold text-4xl shadow-sm border border-emerald-205 dark:border-emerald-800 shrink-0">
                {teacher.first_name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-805 dark:text-slate-100">{teacherName}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50' : 
                    'bg-amber-100 text-amber-700 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50'
                  }`}>
                    {status === 'active' ? 'Docente Activo' : 'En Licencia'}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400" /> ID: {teacher.id}</div>
                  <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-400" /> Área: {area}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {load} horas/semana</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">
                  <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Ver Hoja de Vida
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 border border-transparent rounded-lg text-sm font-medium text-white transition-colors shadow-sm cursor-pointer">
                  <Mail className="w-4 h-4" /> Enviar Mensaje
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Info & Contact */}
            <div className="space-y-6">
              {/* Contact Data */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-slate-400" /> Contacto Oficial
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-655 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate" title={teacher.email}>{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-655 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400" />
                    +57 315 987 6543
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Escalafón Docente</p>
                    <p className="text-sm font-semibold text-slate-805 dark:text-slate-100">Grado 2 - Nivel A</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-rose-50 dark:bg-rose-950/10 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-900/30 p-6">
                <h3 className="font-bold text-rose-900 dark:text-rose-400 mb-4 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-rose-500" /> Contacto de Emergencia
                </h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-100 dark:border-rose-900/20">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Cónyuge</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Carlos Mendoza</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      +57 310 555 1234
                    </div>
                  </div>
                  <div className="text-xs text-rose-700 dark:text-rose-455 bg-rose-100/50 dark:bg-rose-950/20 p-2 rounded-lg font-medium">
                    Grupo Sanguíneo: O+ <br/> EPS: Sanitas
                  </div>
                </div>
              </div>

              {/* Assigned Groups */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" /> Grupos Asignados
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="font-bold text-sm text-slate-700 dark:text-slate-200">Grado 6A</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Director de Grupo</div>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-1 rounded">4 hrs</span>
                  </li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="font-bold text-sm text-slate-700 dark:text-slate-200">Grado 6B</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{area}</div>
                    </div>
                    <span className="text-xs font-semibold bg-slate-200 text-slate-705 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded">4 hrs</span>
                  </li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="font-bold text-sm text-slate-700 dark:text-slate-200">Grado 7A</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{area}</div>
                    </div>
                    <span className="text-xs font-semibold bg-slate-200 text-slate-705 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded">4 hrs</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Performance & Schedule */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" /> Evaluación de Desempeño
                  </h3>
                  <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">Última eval: 92%</span>
                </div>
                
                {/* Horizontal progress bar mockup for Recharts evaluation data */}
                <div className="space-y-4 py-2">
                  {evaluationData.map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-205">{item.category}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.score} / 5.0</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 dark:bg-emerald-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(item.score / 5.0) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 min-h-[200px]">
                 <Calendar className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-650" />
                 <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">Horario Semanal</p>
                 <p className="text-sm">El módulo de horarios detallados está en mantenimiento.</p>
                 <button className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer">
                   Descargar Horario (PDF)
                 </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
