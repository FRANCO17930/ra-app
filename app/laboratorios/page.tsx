"use client";

import { motion } from "framer-motion";
import { LABORATORIES } from "@/lib/labs-config";
import Link from "next/link";
import { ChevronRight, Beaker } from "lucide-react";

export default function LaboratoriosPage() {
    return (
        <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12"
            >
                <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors mb-4 inline-block">
                    ← Volver al inicio
                </Link>
                <h1 className="text-4xl font-bold mt-2">Selecciona un <span className="text-gradient">Laboratorio</span></h1>
                <p className="text-slate-400 mt-2">Cada laboratorio tiene sus propios marcadores de realidad aumentada.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LABORATORIES.map((lab, index) => (
                    <motion.div
                        key={lab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            href={`/escaneo/${encodeURIComponent(lab)}`}
                            className="glass p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all hover:bg-blue-500/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                    <Beaker className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-lg font-medium">{lab}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </main>
    );
}
