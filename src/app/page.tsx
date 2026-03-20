"use client";

import { useAuth } from "@/context/AuthContext";
import Survey from "@/components/Survey";
import { motion } from "framer-motion";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-4xl z-10">
        {!user ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-slate-800 uppercase italic tracking-tighter">
                Bien<span className="text-brand-primary">venido</span>
              </h1>
              <p className="text-gray-500 uppercase font-bold text-sm tracking-widest">
                Bienvenido. Por favor, inicia sesión para comenzar la experiencia.
              </p>
            </div>

            <button
              onClick={signInWithGoogle}
              className="group relative inline-flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/wait.gif" className="hidden" alt="" />
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.63l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">
                Análisis de <span className="text-brand-primary">Perfil</span>
              </h1>
              <div className="flex items-center justify-center gap-3">
                <img 
                  src={user.photoURL || ""} 
                  alt={user.displayName || ""} 
                  className="w-8 h-8 rounded-full border border-brand-primary"
                />
                <p className="text-gray-500 uppercase font-bold text-xs tracking-widest">
                  Hola, {user.displayName?.split(" ")[0]}! Estamos listos.
                </p>
              </div>
            </motion.div>
            
            <Survey />
          </div>
        )}
      </div>
    </main>
  );
}
