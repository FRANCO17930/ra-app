"use client";

import { motion } from "framer-motion";
import { Camera, Beaker, Settings, Play } from "lucide-react";
import Link from "next/link";
import { LABORATORIES } from "@/lib/labs-config";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 md:p-24 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          <span className="text-gradient">Realidad Aumentada</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Explora la ciencia como nunca antes. Escanea marcadores y descubre contenido interactivo en cada laboratorio.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/laboratorios" className="glass p-8 rounded-3xl flex flex-col items-center gap-4 group transition-all hover:bg-white/5 border-blue-500/20 h-full">
            <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
              <Camera className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold">Escanear Realidad Aumentada</h2>
            <p className="text-slate-400 text-center">Inicia la cámara para detectar imágenes y reproducir videos interactivos.</p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-blue-400 font-semibold">
              Comenzar <Play className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/admin" className="glass p-8 rounded-3xl flex flex-col items-center gap-4 group transition-all hover:bg-white/5 border-amber-500/20 h-full">
            <div className="p-4 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
              <Settings className="w-12 h-12 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold">Panel de Administración</h2>
            <p className="text-slate-400 text-center">Gestiona fotos, videos y vincula contenido a cada laboratorio.</p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-amber-400 font-semibold">
              Configurar <Settings className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-slate-500 text-sm"
      >
        © 2026 Laboratorio Fuerza @ Franco.07 - Todos los derechos reservados
      </motion.div>
    </main>
  );
}
