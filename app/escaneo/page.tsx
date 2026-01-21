"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ARAsset } from "@/lib/labs-config";
import { Loader2, Camera, RefreshCw, X, Play } from "lucide-react";
import { getAssets, getLabConfig } from "@/lib/db";

export default function UnifiedEscaneoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState<ARAsset[]>([]);
    const [arReady, setArReady] = useState(false);
    const [markerUrl, setMarkerUrl] = useState("https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind");

    useEffect(() => {
        async function loadData() {
            try {
                const [assetsData, globalConfig] = await Promise.all([
                    getAssets(),
                    getLabConfig("Global")
                ]);
                setAssets(assetsData);
                if (globalConfig?.markerUrl) {
                    setMarkerUrl(globalConfig.markerUrl);
                }
            } catch (err) {
                console.error("Error loading assets:", err);
            }
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
            const scenes = document.querySelectorAll("a-scene");
            scenes.forEach(s => s.remove());
            const video = document.querySelector("video");
            if (video) video.remove();
        };
    }, []);

    const startAR = () => {
        setArReady(true);
        // "Unlock" all videos for mobile browsers
        const videos = document.querySelectorAll('video');
        videos.forEach(v => {
            v.play().then(() => {
                v.pause();
                v.currentTime = 0;
            }).catch(e => console.log("Video unlock prevented:", e));
        });
    };


    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            <div className="ar-bg"><div className="ar-grid"></div></div>

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
                <button
                    onClick={() => router.push("/")}
                    className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-blue-500/20 transition-all border border-white/10"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-full text-blue-400 text-sm font-bold tracking-widest uppercase">
                    Scanner RA
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-blue-500/20 transition-all border border-white/10"
                >
                    <RefreshCw className="w-6 h-6" />
                </button>
            </div>

            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-[100]">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-blue-500/30 animate-pulse"></div>
                    </div>
                    <p className="text-blue-400 font-bold mt-8 tracking-widest animate-pulse">CARGANDO SISTEMA AR...</p>
                </div>
            )}

            {!loading && !arReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-[110]">
                    <div className="p-8 glass rounded-3xl text-center max-w-sm mx-auto shadow-2xl border-blue-500/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-progress"></div>
                        <Camera className="w-20 h-20 text-blue-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        <h2 className="text-3xl font-bold text-white mb-2">Visión AR Lista</h2>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Apunta a cualquier marcador de laboratorio para activar la realidad aumentada.
                        </p>
                        <button
                            onClick={startAR}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all scale-100 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            INICIAR EXPERIENCIA
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
                            mindar-image="imageTargetSrc: ${markerUrl}; autoStart: true; uiLoading: no; uiError: no; uiScanning: yes;"
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

                            ${assets.map((asset, i) => `
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
                        // Event listeners for MindAR
                        const sceneEl = document.querySelector('a-scene');
                        sceneEl.addEventListener("targetFound", (event) => {
                            console.log("Target found", event.detail.targetIndex);
                            const targetIndex = event.detail.targetIndex;
                            let videoId = targetIndex === 0 ? "vid-demo" : "vid-" + (targetIndex - 1);
                            const v = document.querySelector('#' + videoId);
                            if (v) {
                                v.muted = false; // Unmute on detection
                                v.play().catch(err => console.error("Auto-play failed:", err));
                            }
                        });

                        sceneEl.addEventListener("targetLost", (event) => {
                            console.log("Target lost", event.detail.targetIndex);
                            const targetIndex = event.detail.targetIndex;
                            let videoId = targetIndex === 0 ? "vid-demo" : "vid-" + (targetIndex - 1);
                            const v = document.querySelector('#' + videoId);
                            if (v) v.pause();
                        });

                        // Manual toggle
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
                    <div className="glass-accent p-4 rounded-2xl inline-block max-w-sm border-blue-500/30">
                        <p className="text-white text-sm font-medium tracking-wide">Busca el marcador de laboratorio</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                            <p className="text-blue-300 text-[10px] uppercase tracking-[0.2em] font-bold">Escaneando...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
