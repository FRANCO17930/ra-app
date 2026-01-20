"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ARAsset } from "@/lib/labs-config";
import { Loader2, Camera, RefreshCw, X } from "lucide-react";
import { getAssets } from "@/lib/db";

export default function EscaneoPage() {
    const params = useParams();
    const router = useRouter();
    const labName = decodeURIComponent(params.labName as string);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState<ARAsset[]>([]);
    const [arReady, setArReady] = useState(false);

    useEffect(() => {
        async function loadData() {
            const data = await getAssets();
            setAssets(data.filter((a: ARAsset) => a.lab === labName));
        }
        loadData();

        // Load Scripts for A-Frame and Mind-AR
        const sceneScript = document.createElement("script");
        sceneScript.src = "https://aframe.io/releases/1.5.0/aframe.min.js";
        sceneScript.async = true;

        const mindArScript = document.createElement("script");
        mindArScript.src = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js";
        mindArScript.async = true;

        sceneScript.onload = () => {
            document.body.appendChild(mindArScript);
        };

        document.body.appendChild(sceneScript);

        const checkReady = setInterval(() => {
            if ((window as any).AFRAME && (window as any).MINDAR) {
                setArReady(true);
                setLoading(false);
                clearInterval(checkReady);
            }
        }, 500);

        return () => {
            clearInterval(checkReady);
            // Clean up A-Frame artifacts
            const scenes = document.querySelectorAll("a-scene");
            scenes.forEach(s => s.remove());
            const video = document.querySelector("video");
            if (video) video.remove();
        };
    }, [labName]);


    return (
        <div className="relative w-full h-screen bg-black overflow-hidden" ref={containerRef}>
            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
                <button
                    onClick={() => router.push("/laboratorios")}
                    className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-black/70 transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-full text-blue-400 text-sm font-bold">
                    {labName}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-black/70 transition-all"
                >
                    <RefreshCw className="w-6 h-6" />
                </button>
            </div>

            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-[100]">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-blue-400 font-bold animate-pulse">Iniciando Cámara AR...</p>
                    <p className="text-slate-500 text-xs mt-2 text-center max-w-[200px]">
                        Asegúrate de conceder permisos de cámara cuando se solicite.
                    </p>
                </div>
            )}

            {!loading && !arReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-[110]">
                    <div className="p-8 bg-slate-900 border border-white/10 rounded-3xl text-center max-w-sm mx-auto shadow-2xl">
                        <Camera className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">¿Listo para Escanear?</h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Para ver el contenido AR, necesitamos activar la cámara y el audio.
                            Apunta al marcador una vez iniciada.
                        </p>
                        <button
                            onClick={() => setArReady(true)}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all scale-100 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
                        >
                            Iniciar Experiencia AR
                        </button>
                    </div>
                </div>
            )}

            {arReady && (
                <div className="w-full h-full">
                    <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{
                            __html: `
                        <a-scene
                            mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: yes;"
                            color-space="sRGB"
                            embedded
                            renderer="colorManagement: true, physicallyCorrectLights"
                            vr-mode-ui="enabled: false"
                            device-orientation-permission-ui="enabled: false"
                            class="w-full h-full"
                        >
                            <a-assets>
                                ${assets.map((asset, i) => `
                                    <video
                                        id="vid-${i}"
                                        src="${asset.videoUrl}"
                                        preload="auto"
                                        loop
                                        crossorigin="anonymous"
                                        muted
                                        playsinline
                                    ></video>
                                `).join('')}
                                <video id="vid-demo" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mp4" preload="auto" loop crossorigin="anonymous" muted playsinline></video>
                            </a-assets>

                            <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" raycaster="far: 10000; objects: .clickable"></a-camera>

                            <a-entity mindar-image-target="targetIndex: 0">
                                <a-video
                                    src="#vid-demo"
                                    position="0 0 0"
                                    height="0.552"
                                    width="1"
                                    rotation="0 0 0"
                                    class="clickable"
                                    data-video-id="vid-demo"
                                ></a-video>
                            </a-entity>

                            ${assets.slice(0, 5).map((asset, i) => `
                                <a-entity mindar-image-target="targetIndex: ${i + 1}">
                                    <a-video
                                        src="#vid-${i}"
                                        position="0 0 0"
                                        height="1"
                                        width="1"
                                        rotation="0 0 0"
                                        class="clickable"
                                        data-video-id="vid-${i}"
                                    ></a-video>
                                </a-entity>
                            `).join('')}
                        </a-scene>
                        `}}
                    />
                    <script dangerouslySetInnerHTML={{
                        __html: `
                        document.addEventListener('click', (e) => {
                            const arVideo = e.target.closest('.clickable');
                            if (arVideo) {
                                const videoId = arVideo.getAttribute('data-video-id');
                                const v = document.querySelector('#' + videoId);
                                if (v) {
                                    if (v.paused) {
                                        v.play().catch(err => console.error("Error playing video:", err));
                                    } else {
                                        v.pause();
                                    }
                                }
                            }
                        });
                        `
                    }} />
                </div>
            )}

            {/* Guide UI */}
            {!loading && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 text-center pointer-events-none w-full px-6">
                    <div className="glass-accent p-4 rounded-2xl inline-block max-w-sm">
                        <p className="text-white text-sm font-medium">Apunta la cámara al marcador del laboratorio</p>
                        <p className="text-blue-300 text-[10px] mt-1 uppercase tracking-widest">Escaneando Marcadores...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

