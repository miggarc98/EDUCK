
export const LoginBranding = () => {
    return (
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-8 md:p-12 text-white flex flex-col relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-30" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            {/* Brand Logo */}
            <div className="relative z-10 flex items-center gap-3 mb-12">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/30">
                    <img src="/public/LogoSinTexto.png" alt="Logo" className="w-10 h-10" />
                </div>
                <span className="font-bold text-xl tracking-tight">Educk-Panel</span>
            </div>

            {/* Marketing Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                    Gestión educativa{' '}
                    <br />
                    <span className="text-blue-200">simplificada.</span>
                </h1>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
                    Accede a la plataforma para gestionar convivencias, calificaciones,
                    horarios y la comunicación con estudiantes y acudientes desde un solo lugar.
                </p>

                {/* Social Proof */}
                <div className="flex items-center gap-4 text-sm font-medium text-blue-100">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-10 h-10 rounded-full border-2 border-blue-600 bg-gradient-to-br from-slate-200 to-slate-300"
                            />
                        ))}
                    </div>
                    <p>+2,000 instituciones confían en nosotros</p>
                </div>
            </div>
        </div>
    );
};