"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Lock, LogIn, Plus, Trash2, Video, Image as ImageIcon, Link as LinkIcon, Save, QrCode as QrIcon, HelpCircle, Upload, Loader2, LogOut, ChevronRight, Check } from "lucide-react";
import { LABORATORIES, ARAsset } from "@/lib/labs-config";
import { LabQR } from "@/components/lab-qr";
import { getAssets, getLabConfig, LabConfig } from "@/lib/db";
import { serverSaveAsset, serverDeleteAsset, serverSaveLabConfig } from "@/lib/actions";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
    const { isAuthenticated, login, logout } = useAuth();
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [assets, setAssets] = useState<ARAsset[]>([]);
    const [labConfigs, setLabConfigs] = useState<{ [key: string]: LabConfig }>({});
    const [markerFiles, setMarkerFiles] = useState<{ [key: string]: File | null }>({});
    const [isUploadingMarker, setIsUploadingMarker] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadAssets();
            loadLabConfigs();
        }
    }, [isAuthenticated]);

    async function loadAssets() {
        const data = await getAssets();
        setAssets(data);
    }

    async function loadLabConfigs() {
        const configs: { [key: string]: LabConfig } = {};
        for (const lab of LABORATORIES) {
            const config = await getLabConfig(lab);
            if (config) {
                configs[lab] = config;
            }
        }
        setLabConfigs(configs);
    }

    const [newAsset, setNewAsset] = useState<Partial<ARAsset>>({
        lab: LABORATORIES[0],
        title: "",
        imageUrl: "",
        videoUrl: "",
        imageName: ""
    });

    const [files, setFiles] = useState<{ image: File | null, video: File | null }>({
        image: null,
        video: null
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    const uploadFile = async (file: File, bucket: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleAddAsset = async () => {
        if (!newAsset.title || (!newAsset.imageUrl && !files.image) || (!newAsset.videoUrl && !files.video)) {
            alert("Por favor completa todos los campos o selecciona archivos.");
            return;
        }

        setIsUploading(true);
        try {
            let finalImageUrl = newAsset.imageUrl || "";
            let finalVideoUrl = newAsset.videoUrl || "";

            if (files.image) finalImageUrl = await uploadFile(files.image, 'fotos');
            if (files.video) finalVideoUrl = await uploadFile(files.video, 'videos');

            const asset: ARAsset = {
                id: Math.random().toString(36).substr(2, 9),
                lab: newAsset.lab as any,
                title: newAsset.title as string,
                imageName: newAsset.title!.toLowerCase().replace(/\s+/g, "_"),
                imageUrl: finalImageUrl,
                videoUrl: finalVideoUrl,
            };

            await serverSaveAsset(asset);
            await loadAssets();
            setNewAsset({ lab: LABORATORIES[0], title: "", imageUrl: "", videoUrl: "" });
            setFiles({ image: null, video: null });
        } catch (err: any) {
            console.error("Error adding asset:", err);
            alert("Error al guardar: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAsset = async (id: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este vínculo?")) {
            await serverDeleteAsset(id);
            await loadAssets();
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6 relative">
                <div className="ar-bg"><div className="ar-grid"></div></div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass p-10 rounded-[2.5rem] w-full max-w-md border-blue-500/20 shadow-2xl"
                >
                    <div className="flex flex-col items-center mb-10">
                        <div className="p-5 bg-blue-500/10 rounded-3xl mb-6 relative group">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:blur-2xl transition-all"></div>
                            <Lock className="w-10 h-10 text-blue-400 relative z-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Panel Control</h1>
                        <p className="text-slate-400 text-sm text-center mt-2 font-medium">Gestión de Realidad Aumentada</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Contraseña de acceso"
                                className={`w-full bg-slate-900/50 border ${error ? "border-red-500/50" : "border-white/10"} rounded-2xl p-4 outline-none focus:border-blue-500/50 transition-all font-medium text-center`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                            <LogIn className="w-5 h-5" /> Iniciar Sesión
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <div className="ar-bg"><div className="ar-grid"></div></div>

            <div className="max-w-7xl mx-auto p-6 md:p-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <div>
                        <h1 className="text-5xl font-extrabold tracking-tighter mb-2"><span className="text-gradient">Content</span> Manager</h1>
                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Sistema Operativo AR Activo
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="px-6 py-3 glass hover:bg-red-500/10 hover:border-red-500/30 rounded-2xl transition-all text-sm font-bold flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Salir del Sistema
                    </button>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-4 space-y-8">
                        {/* QR Section */}
                        <div className="glass p-8 rounded-[2rem] border-blue-500/10">
                            <div className="flex items-center gap-3 mb-6">
                                <QrIcon className="w-6 h-6 text-blue-400" />
                                <h2 className="text-xl font-bold">Escáner Universal</h2>
                            </div>
                            <div className="bg-white p-6 rounded-3xl mb-4 group cursor-pointer transition-transform hover:scale-[1.02]">
                                <LabQR labName="Universal" />
                            </div>
                            <p className="text-xs text-slate-400 text-center leading-relaxed">
                                Este QR abre el escáner para <strong>todos</strong> los laboratorios simultáneamente.
                            </p>
                        </div>

                        {/* Global Marker Config */}
                        <div className="glass p-8 rounded-[2rem] border-blue-500/10">
                            <div className="flex items-center gap-3 mb-4">
                                <Save className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg font-bold">Archivo de Marcadores</h2>
                            </div>

                            <div className="space-y-4">
                                {labConfigs["Global"]?.markerUrl ? (
                                    <div className="text-[10px] text-green-500 flex items-center gap-1 font-bold">
                                        <Check className="w-3 h-3" /> Marcador .mind activo
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-slate-500 italic">Usando marcador por defecto</div>
                                )}

                                <div className="flex gap-2">
                                    <label className="flex-1 bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] cursor-pointer hover:border-blue-500/50 transition-all text-center overflow-hidden whitespace-nowrap text-slate-400 font-bold">
                                        {markerFiles["Global"] ? markerFiles["Global"]?.name : "Seleccionar .mind"}
                                        <input
                                            type="file"
                                            accept=".mind"
                                            className="hidden"
                                            onChange={(e) => setMarkerFiles({ ...markerFiles, Global: e.target.files ? e.target.files[0] : null })}
                                        />
                                    </label>
                                    {markerFiles["Global"] && (
                                        <button
                                            onClick={async () => {
                                                const file = markerFiles["Global"];
                                                if (!file) return;
                                                setIsUploadingMarker("Global");
                                                try {
                                                    const filePath = `markers/global_${Math.random().toString(36).substr(2, 5)}.mind`;
                                                    const { data, error } = await supabase.storage.from('configs').upload(filePath, file);
                                                    if (error) throw error;
                                                    const { data: { publicUrl } } = supabase.storage.from('configs').getPublicUrl(filePath);
                                                    await serverSaveLabConfig("Global", publicUrl);
                                                    await loadLabConfigs();
                                                    setMarkerFiles({ ...markerFiles, Global: null });
                                                    alert("Marcador global actualizado");
                                                } catch (err: any) {
                                                    alert("Error: " + err.message);
                                                } finally {
                                                    setIsUploadingMarker(null);
                                                }
                                            }}
                                            disabled={isUploadingMarker === "Global"}
                                            className="bg-blue-600 px-4 rounded-xl hover:bg-blue-500 transition-all disabled:bg-slate-800"
                                        >
                                            {isUploadingMarker === "Global" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* New Asset Form */}
                        <div className="glass p-8 rounded-[2rem] border-blue-500/10">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-400" /> Nuevo Recurso
                            </h2>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Laboratorio</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-3.5 outline-none focus:border-blue-500/50 transition-all font-medium"
                                        value={newAsset.lab}
                                        onChange={(e) => setNewAsset({ ...newAsset, lab: e.target.value as any })}
                                    >
                                        {LABORATORIES.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Título</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Calibrador Digital"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-3.5 outline-none focus:border-blue-500/50 transition-all font-medium"
                                        value={newAsset.title}
                                        onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Activador (Imágen)</label>
                                    <label className="flex items-center justify-between bg-slate-900/50 border border-white/5 rounded-2xl p-3.5 cursor-pointer hover:border-blue-500/30 transition-all group">
                                        <span className="text-sm text-slate-400 truncate max-w-[150px]">{files.image ? files.image.name : "Subir Foto"}</span>
                                        <ImageIcon className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setFiles({ ...files, image: e.target.files ? e.target.files[0] : null })}
                                        />
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Capa AR (Video)</label>
                                    <label className="flex items-center justify-between bg-slate-900/50 border border-white/5 rounded-2xl p-3.5 cursor-pointer hover:border-blue-500/30 transition-all group">
                                        <span className="text-sm text-slate-400 truncate max-w-[150px]">{files.video ? files.video.name : "Subir Video"}</span>
                                        <Video className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={(e) => setFiles({ ...files, video: e.target.files ? e.target.files[0] : null })}
                                        />
                                    </label>
                                </div>

                                <button
                                    onClick={handleAddAsset}
                                    disabled={isUploading}
                                    className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 mt-4 \${isUploading ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95"}`}
                                >
                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isUploading ? "Guardando..." : "Guardar Recurso"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-8 space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-2xl font-bold tracking-tight">Recursos Guardados <span className="text-blue-500 ml-2 text-sm bg-blue-500/10 px-3 py-1 rounded-full">{assets.length}</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto">
                            <AnimatePresence>
                                {assets.length === 0 ? (
                                    <div className="col-span-full glass p-20 rounded-[2.5rem] text-center border-dashed border-white/5 space-y-4">
                                        <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                            <Video className="w-8 h-8 text-slate-600" />
                                        </div>
                                        <p className="text-slate-500 font-medium">Aún no has creado ningún recurso de realidad aumentada.</p>
                                    </div>
                                ) : (
                                    assets.map((asset) => (
                                        <motion.div
                                            key={asset.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="glass p-5 rounded-[2rem] border-white/5 hover:bg-white/[0.05] transition-all group relative"
                                        >
                                            <div className="flex gap-5">
                                                <div className="w-24 h-24 rounded-2xl bg-slate-900 overflow-hidden shrink-0 relative group-hover:ring-2 ring-blue-500/20 transition-all">
                                                    {asset.imageUrl ? (
                                                        <img src={asset.imageUrl} alt={asset.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <ImageIcon className="w-8 h-8 text-slate-700 m-auto mt-8" />
                                                    )}
                                                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ChevronRight className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-400 transition-colors">{asset.title}</h3>
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-500/70 bg-blue-500/5 px-2 py-0.5 rounded-md border border-blue-500/10">{asset.lab}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a href={asset.videoUrl} target="_blank" className="p-2.5 glass rounded-xl text-slate-400 hover:text-blue-400 transition-all">
                                                            <Video className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteAsset(asset.id)}
                                                            className="p-2.5 glass rounded-xl text-slate-400 hover:text-red-400 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="glass p-8 rounded-[2.5rem] border-blue-500/5 bg-gradient-to-br from-blue-500/[0.02] to-transparent">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <HelpCircle className="w-6 h-6 text-blue-400" /> Guía de Implementación
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { step: "01", title: "Captura", desc: "Toma una foto clara del instrumento o área." },
                                    { step: "02", title: "Enlaza", desc: "Sube el video explicativo que se superpondrá." },
                                    { step: "03", title: "Escanea", desc: "Usa el QR universal para ver la magia." }
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="text-2xl font-black text-blue-500/20 tracking-tighter">{item.step}</div>
                                        <h4 className="font-bold text-sm text-slate-200">{item.title}</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
