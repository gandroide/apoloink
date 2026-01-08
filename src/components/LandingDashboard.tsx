import { BarChart3, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export const LandingDashboard = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto perspective-1000">
      {/* Efecto de Brillo/Resplandor detrás */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-2xl blur-xl opacity-50 animate-pulse"></div>

      {/* Contenedor Principal (La Tarjeta) */}
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
        
        {/* --- HEADER DEL DASHBOARD --- */}
        <div className="border-b border-white/10 p-4 md:p-6 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resumen Financiero • Enero 2026</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">En vivo</span>
          </div>
        </div>

        {/* --- BODY CON KPIS Y GRÁFICO --- */}
        <div className="p-6 md:p-8 space-y-8">
          
          {/* 1. KPIs (Números Grandes) */}
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="space-y-1">
              <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Ingresos Totales</p>
              <div className="flex items-center gap-2">
                 <h3 className="text-xl md:text-3xl font-black text-white">$ 12.450</h3>
                 <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">+15%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Gastos Operativos</p>
               <div className="flex items-center gap-2">
                 <h3 className="text-xl md:text-3xl font-black text-white">$ 3.200</h3>
                 <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded font-bold">-2%</span>
              </div>
            </div>
            <div className="space-y-1 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
              <p className="text-[10px] md:text-xs text-emerald-500 uppercase font-bold tracking-wider">Ganancia Neta</p>
              <h3 className="text-xl md:text-3xl font-black text-emerald-400">$ 9.250</h3>
            </div>
          </div>

          {/* 2. EL GRÁFICO SVG (Arte Vectorial Fake) */}
          <div className="relative h-48 md:h-64 w-full bg-gradient-to-b from-white/[0.02] to-transparent rounded-xl border border-white/5 p-4 overflow-hidden group">
            
            {/* Grid Lines (Fondo) */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10 pointer-events-none">
               <div className="w-full h-px bg-white border-dashed"></div>
               <div className="w-full h-px bg-white border-dashed"></div>
               <div className="w-full h-px bg-white border-dashed"></div>
               <div className="w-full h-px bg-white border-dashed"></div>
               <div className="w-full h-px bg-white border-dashed"></div>
            </div>

            {/* CURVA 1: INGRESOS (Verde) */}
            <svg className="absolute inset-0 w-full h-full pt-8 px-2" preserveAspectRatio="none" viewBox="0 0 100 50">
               {/* Gradiente de relleno */}
               <defs>
                 <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                   <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                   <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                 </linearGradient>
               </defs>
               <path 
                 d="M0,45 C10,40 20,20 30,25 C40,30 50,10 60,15 C70,20 80,5 90,10 L100,5 V50 H0 Z" 
                 fill="url(#incomeGradient)" 
               />
               <path 
                 d="M0,45 C10,40 20,20 30,25 C40,30 50,10 60,15 C70,20 80,5 90,10 L100,5" 
                 fill="none" 
                 stroke="#10b981" 
                 strokeWidth="0.5"
                 className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"
               />
            </svg>

            {/* CURVA 2: GASTOS (Naranja/Rojo - Más baja) */}
            <svg className="absolute inset-0 w-full h-full pt-8 px-2" preserveAspectRatio="none" viewBox="0 0 100 50">
               <path 
                 d="M0,48 C10,46 20,40 30,42 C40,44 50,35 60,38 C70,40 80,30 90,32 L100,28" 
                 fill="none" 
                 stroke="#f59e0b" 
                 strokeWidth="0.5"
                 strokeDasharray="1,1"
                 className="opacity-50"
               />
            </svg>

            {/* TOOLTIP FLOTANTE (Simulado) */}
            <div className="absolute top-[20%] right-[20%] bg-[#1a1a1a] border border-white/20 p-2 rounded-lg shadow-xl flex flex-col gap-1 animate-bounce duration-[3000ms]">
                <p className="text-[8px] text-gray-400 font-bold uppercase">Sábado 24</p>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-white">$850</span>
                </div>
            </div>

          </div>

          {/* 3. Footer de lista pequeña */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded text-blue-400"><TrendingUp size={16} /></div>
                <div>
                    <p className="text-[9px] text-gray-400 uppercase">Proyección</p>
                    <p className="text-xs font-bold text-white">Crecimiento estable</p>
                </div>
             </div>
             <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded text-purple-400"><Wallet size={16} /></div>
                <div>
                    <p className="text-[9px] text-gray-400 uppercase">Caja Chica</p>
                    <p className="text-xs font-bold text-white">Saludable</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};