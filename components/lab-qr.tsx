"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, ExternalLink } from "lucide-react";

export function LabQR({ labName }: { labName: string }) {
    const [qrUrl, setQrUrl] = useState("");
    const [copied, setCopied] = useState(false);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const labUrl = labName === "Universal" ? `${baseUrl}/escaneo` : `${baseUrl}/escaneo/${encodeURIComponent(labName)}`;

    useEffect(() => {
        QRCode.toDataURL(labUrl, {
            width: 200,
            margin: 2,
            color: {
                dark: "#3b82f6",
                light: "#ffffff"
            }
        }).then(setQrUrl);
    }, [labUrl]);

    const copyUrl = () => {
        navigator.clipboard.writeText(labUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="bg-white p-2 rounded-xl">
                {qrUrl && <img src={qrUrl} alt={`QR Code for ${labName}`} className="w-32 h-32" />}
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-slate-300">{labName}</p>
                <p className="text-[10px] text-slate-500 max-w-[150px] truncate">{labUrl}</p>
            </div>
            <div className="flex gap-2 w-full">
                <button
                    onClick={copyUrl}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors"
                >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copiado" : "Copiar Link"}
                </button>
                <a
                    href={labUrl}
                    target="_blank"
                    className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
