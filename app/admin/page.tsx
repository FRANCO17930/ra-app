"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Lock, LogIn, Plus, Trash2, Video, Image as ImageIcon, Link as LinkIcon, Save, QrCode as QrIcon, HelpCircle, Upload, Loader2 } from "lucide-react";
import { LABORATORIES, ARAsset } from "@/lib/labs-config";
import { LabQR } from "@/components/lab-qr";
import { getAssets, saveAsset, deleteAsset, getLabConfig, saveLabConfig, LabConfig } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
    const { isAuthenticated, login, logout } = useAuth();
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // State for assets
    const [assets, setAssets] = useState<ARAsset[]>([]);

    useEffect(() => {
        if (isAuthenticated) {
            loadAssets();
        }
    }, [isAuthenticated]);

    async function loadAssets() {
        const data = await getAssets();
        setAssets(data);
    }

    const [labConfigs, setLabConfigs] = useState<{ [key: string]: LabConfig }>({});
    const [markerFiles, setMarkerFiles] = useState<{ [key: string]: File | null }>({});
    const [isUploadingMarker, setIsUploadingMarker] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadLabConfigs();
        }
    }, [isAuthenticated]);

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

    const handleUploadMarker = async (lab: string) => {
        const file = markerFiles[lab];
        if (!file) return;

        setIsUploadingMarker(lab);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${lab.toLowerCase().replace(/\s+/g, "_")}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
            const filePath = `markers/${fileName}`;

            const { data, error } = await supabase.storage
                .from('configs') // We'll use a 'configs' or similar bucket
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('configs')
                .getPublicUrl(filePath);

            await saveLabConfig({ labName: lab, markerUrl: publicUrl });
            await loadLabConfigs();
            setMarkerFiles({ ...markerFiles, [lab]: null });
            alert("Marcador (.mind) actualizado para " + lab);
        } catch (err: any) {
            console.error("Error uploading marker:", err);
            alert("Error: " + err.message);
        } finally {
            setIsUploadingMarker(null);
        }
    };

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

            // Upload files if present
            if (files.image) {
                finalImageUrl = await uploadFile(files.image, 'fotos');
            }
            if (files.video) {
                finalVideoUrl = await uploadFile(files.video, 'videos');
            }

            const asset: ARAsset = {
                id: Math.random().toString(36).substr(2, 9),
                lab: newAsset.lab as any,
                title: newAsset.title as string,
                imageName: newAsset.title!.toLowerCase().replace(/\s+/g, "_"),
                imageUrl: finalImageUrl,
                videoUrl: finalVideoUrl,
            };

            await saveAsset(asset);
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
            await deleteAsset(id);
            loadAssets();
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass p-8 rounded-3xl w-full max-w-md border-amber-500/20"
                >
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-4 bg-amber-500/10 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-bold">Acceso Administrativo</h1>
                        <p className="text-slate-400 text-sm text-center mt-2">Introduce la contraseña para gestionar los laboratorios.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className={`w-full bg-slate-900 border ${error ? "border-red-500" : "border-slate-700"} rounded-xl p-4 outline-none focus:border-amber-500 transition-colors`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" /> Entrar
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                <div>
                    <h1 className="text-4xl font-bold">Gestión de <span className="text-gradient">Contenido AR</span></h1>
                    <p className="text-slate-400 mt-1">Sube fotos y videos para el escaneo en tiempo real.</p>
                </div>
                <button
                    onClick={logout}
                    className="px-6 py-2 border border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl transition-all text-sm"
                >
                    Cerrar Sesión
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to add new asset */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6 rounded-2xl border-blue-500/20">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-400" /> Nuevo Vínculo
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Laboratorio</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500"
                                    value={newAsset.lab}
                                    onChange={(e) => setNewAsset({ ...newAsset, lab: e.target.value as any })}
                                >
                                    {LABORATORIES.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Título del Marcador</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Calibrador de Presión"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500"
                                    value={newAsset.title}
                                    onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Imagen del Marcador (Foto)</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="bg-slate-800 p-3 rounded-lg"><ImageIcon className="w-5 h-5 text-slate-400" /></div>
                                        <label className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-slate-950 text-slate-400 text-sm overflow-hidden text-ellipsis whitespace-nowrap px-4">
                                            {files.image ? files.image.name : "Seleccionar Archivo"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => setFiles({ ...files, image: e.target.files ? e.target.files[0] : null })}
                                            />
                                        </label>
                                    </div>
                                    <div className="text-[10px] text-slate-500 text-center">O introduce una URL:</div>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                                        value={newAsset.imageUrl}
                                        onChange={(e) => setNewAsset({ ...newAsset, imageUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Video de Realidad Aumentada</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="bg-slate-800 p-3 rounded-lg"><Video className="w-5 h-5 text-slate-400" /></div>
                                        <label className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-slate-950 text-slate-400 text-sm overflow-hidden text-ellipsis whitespace-nowrap px-4">
                                            {files.video ? files.video.name : "Seleccionar Archivo"}
                                            <input
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                onChange={(e) => setFiles({ ...files, video: e.target.files ? e.target.files[0] : null })}
                                            />
                                        </label>
                                    </div>
                                    <div className="text-[10px] text-slate-500 text-center">O introduce una URL:</div>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                                        value={newAsset.videoUrl}
                                        onChange={(e) => setNewAsset({ ...newAsset, videoUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddAsset}
                                disabled={isUploading}
                                className={`w-full ${isUploading ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"} text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4`}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" /> Guardar Vínculo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List of existing assets */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold px-2 mb-4 flex items-center gap-2">
                            <QrIcon className="w-5 h-5 text-blue-400" /> Accesos Rápidos (QR)
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {LABORATORIES.slice(0, 4).map(lab => (
                                <div key={lab} className="space-y-4">
                                    <LabQR labName={lab} />
                                    <div className="glass p-4 rounded-xl border-dashed border-slate-800">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Marcador (.mind)</div>
                                        <div className="flex flex-col gap-2">
                                            {labConfigs[lab]?.markerUrl ? (
                                                <div className="text-[10px] text-green-500 flex items-center gap-1 mb-1">
                                                    <Save className="w-3 h-3" /> Marcador personalizado activo
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-slate-500 italic mb-1">Usando marcador demo</div>
                                            )}
                                            <div className="flex gap-2">
                                                <label className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] cursor-pointer hover:border-blue-500 transition-all text-center overflow-hidden whitespace-nowrap">
                                                    {markerFiles[lab] ? markerFiles[lab]?.name : "Subir .mind"}
                                                    <input
                                                        type="file"
                                                        accept=".mind"
                                                        className="hidden"
                                                        onChange={(e) => setMarkerFiles({ ...markerFiles, [lab]: e.target.files ? e.target.files[0] : null })}
                                                    />
                                                </label>
                                                {markerFiles[lab] && (
                                                    <button
                                                        onClick={() => handleUploadMarker(lab)}
                                                        disabled={isUploadingMarker === lab}
                                                        className="bg-blue-600 px-3 rounded-lg hover:bg-blue-500 transition-all disabled:bg-slate-700"
                                                    >
                                                        {isUploadingMarker === lab ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 text-white" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 px-2 italic">
                            * Escanea estos QR con tu móvil para entrar directamente al escáner de cada laboratorio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold px-2 mb-4">Vínculos Existentes ({assets.length})</h2>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {assets.length === 0 ? (
                                    <div className="glass p-12 rounded-3xl text-center text-slate-500 border-dashed border-slate-800">
                                        No hay vínculos creados para ningún laboratorio todavía.
                                    </div>
                                ) : (
                                    assets.map((asset) => (
                                        <motion.div
                                            key={asset.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="glass p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center">
                                                    {asset.imageUrl ? (
                                                        <img src={asset.imageUrl} alt={asset.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-slate-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{asset.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{asset.lab}</span>
                                                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> AR Video</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                <a href={asset.videoUrl} target="_blank" className="p-2 text-slate-400 hover:text-white transition-colors">
                                                    <LinkIcon className="w-5 h-5" />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteAsset(asset.id)}
                                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors ml-auto md:ml-0"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    <section className="glass p-6 rounded-2xl border-slate-800">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-300">
                            <HelpCircle className="w-5 h-5" /> ¿Cómo funciona la AR?
                        </h2>
                        <ul className="text-sm text-slate-500 space-y-3">
                            <li className="flex gap-2">
                                <span className="text-blue-500 font-bold">1.</span>
                                <div>Añade una <strong className="text-slate-400">Imagen (Foto)</strong> que servirá como activador.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-500 font-bold">2.</span>
                                <div>Añade el <strong className="text-slate-400">Video</strong> que quieres que aparezca sobre la imagen.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-500 font-bold">3.</span>
                                <div>Escanea el QR del laboratorio con tu móvil y apunta a la imagen física.</div>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
