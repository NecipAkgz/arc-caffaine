"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Download, QrCode } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
}

/**
 * QR Code Modal Component
 *
 * Displays a branded QR code for the user's profile with download capability.
 * Features a gradient border and coffee icon overlay.
 */
export default function QRCodeModal({
  isOpen,
  onClose,
  profileUrl,
  username,
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateBrandedQR();
    }
  }, [isOpen, profileUrl]);

  const generateBrandedQR = async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size (QR + padding for border)
      const qrSize = 220;
      const padding = 18;
      const totalSize = qrSize + padding * 2;
      canvas.width = totalSize;
      canvas.height = totalSize;

      // Draw gradient border
      const gradient = ctx.createLinearGradient(0, 0, totalSize, totalSize);
      gradient.addColorStop(0, "#a855f7"); // Purple
      gradient.addColorStop(1, "#f97316"); // Orange
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, totalSize, totalSize);

      // Draw white inner background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(padding - 4, padding - 4, qrSize + 8, qrSize + 8);

      // Generate QR code to a temporary canvas
      const tempCanvas = document.createElement("canvas");
      await QRCode.toCanvas(tempCanvas, profileUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H", // High error correction for logo overlay
      });

      // Draw QR code onto main canvas
      ctx.drawImage(tempCanvas, padding, padding, qrSize, qrSize);

      // Draw coffee icon in center with subtle transparency
      const iconSize = 36;

      // Semi-transparent white backdrop (very subtle)
      ctx.beginPath();
      ctx.arc(totalSize / 2, totalSize / 2, iconSize / 2 + 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fill();

      // Draw coffee emoji
      ctx.font = `${iconSize - 6}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☕", totalSize / 2, totalSize / 2 + 2);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = `arccaffeine-${username}-qr.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-secondary/95 border border-border rounded-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg shadow-primary/20">
            <canvas
              ref={canvasRef}
              className={isGenerating ? "opacity-50" : ""}
            />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Scan to visit{" "}
            <span className="font-mono text-foreground">@{username}</span>
          </p>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
