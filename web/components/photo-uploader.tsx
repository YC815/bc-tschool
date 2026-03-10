"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";
import { resizeAndEncodePhoto } from "@/lib/photo-utils";

interface PhotoUploaderProps {
  onPhotoSelect: (dataUrl: string | null) => void;
  dataUrl?: string | null;
}

export function PhotoUploader({ onPhotoSelect, dataUrl }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    const encoded = await resizeAndEncodePhoto(file);
    onPhotoSelect(encoded);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) await processFile(file);
  };

  const handleClear = () => {
    onPhotoSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (dataUrl) {
    return (
      <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-[#C9A84C]/30 group">
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#C9A84C]/60 z-10" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#C9A84C]/60 z-10" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#C9A84C]/60 z-10" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#C9A84C]/60 z-10" />

        <Image
          src={dataUrl}
          alt="預覽"
          fill
          className="object-cover photo-aged"
          unoptimized
        />

        <button
          onClick={handleClear}
          className="absolute top-3 right-3 w-9 h-9 bg-black/70 hover:bg-black/90 text-[#C9A84C] rounded-full flex items-center justify-center transition-colors z-20"
          aria-label="移除照片"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 z-10">
          <p className="text-[#C9A84C] text-xs font-display tracking-widest">證物已封存</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full aspect-video rounded-sm border border-dashed
        flex flex-col items-center justify-center gap-3
        cursor-pointer transition-all duration-200
        ${isDragging
          ? "border-[#C9A84C]/60 bg-[#C9A84C]/10"
          : "border-[#C9A84C]/25 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5"
        }
      `}
    >
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#C9A84C]/40" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#C9A84C]/40" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#C9A84C]/40" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#C9A84C]/40" />

      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center transition-colors
        ${isDragging ? "bg-[#C9A84C]/20 text-[#C9A84C]" : "bg-[#C9A84C]/10 text-[#C9A84C]/50"}
      `}>
        <Camera className="w-6 h-6" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm text-[#E8D5A3]/70 font-manuscript">
          點擊上傳證物照片
        </p>
        <p className="text-xs text-[#E8D5A3]/30 font-manuscript">
          放入物品欄 · JPG / PNG
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
