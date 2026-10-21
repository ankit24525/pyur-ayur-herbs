"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react";

export interface ImageDropzoneProps {
  label: string;
  badge?: string;
  hint?: React.ReactNode;
  icon?: string;
  currentValue?: string;
  onFileSelect: (file: File) => void | Promise<void>;
  onUrlChange?: (url: string) => void;
  onClear?: () => void;
  isUploading?: boolean;
  accent?: "emerald" | "amber" | "green";
  previewAspectRatio?: "wide" | "square";
  actionButton?: React.ReactNode;
  urlAction?: React.ReactNode;
  placeholderUrl?: string;
  accept?: string;
}

export default function ImageDropzone({
  label,
  badge,
  hint,
  icon = "🖼️",
  currentValue = "",
  onFileSelect,
  onUrlChange,
  onClear,
  isUploading = false,
  accent = "emerald",
  previewAspectRatio = "wide",
  actionButton,
  urlAction,
  placeholderUrl = "https://res.cloudinary.com/.../banner.webp",
  accept = "image/*",
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAmber = accent === "amber";

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the root drop container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await onFileSelect(file);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileSelect(file);
      // Reset input value so re-uploading the same file still triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openFilePicker = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const hasImage = Boolean(currentValue && typeof currentValue === "string" && currentValue.trim().length > 0);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-3.5 space-y-2.5 shadow-2xs ${
        isAmber
          ? "border-dashed border-[#80a03c] bg-[#f8faf1]/60"
          : "border-[#ddddd9] bg-white"
      }`}
    >
      {/* Header with Title & Badge */}
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{icon}</span>
          <label className="block font-bold text-xs text-[#17231b]">{label}</label>
        </div>
        {badge && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
              isAmber
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-[#eef5df] text-[#244f31] border-[#80a03c]"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Helpful Dimension / Sizing Guidance */}
      {hint && (
        <div
          className={`rounded-lg border p-2 text-[11px] leading-relaxed flex items-center justify-between flex-wrap gap-2 ${
            isAmber
              ? "bg-amber-50/80 border-amber-200/80 text-amber-950"
              : "bg-[#f8faf1] border-[#ddddd9] text-[#244f31]"
          }`}
        >
          <div className="flex-1">{hint}</div>
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Interactive Drag & Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`relative group cursor-pointer rounded-xl border-2 border-dashed p-4 transition-all duration-200 flex flex-col items-center justify-center text-center select-none ${
          isDragging
            ? isAmber
              ? "border-amber-500 bg-amber-100/70 scale-[1.01] shadow-md ring-2 ring-amber-400/40"
              : "border-emerald-600 bg-emerald-50/80 scale-[1.01] shadow-md ring-2 ring-emerald-400/40"
            : hasImage
            ? "border-[#ddddd9] bg-gray-50/60 hover:border-[#244f31] hover:bg-emerald-50/20"
            : isAmber
            ? "border-amber-300 bg-amber-50/30 hover:border-amber-500 hover:bg-amber-100/40"
            : "border-[#ddddd9] bg-[#fdfdfb] hover:border-[#244f31] hover:bg-emerald-50/30"
        }`}
      >
        {isUploading ? (
          <div className="py-4 flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-8 text-[#244f31] animate-spin" />
            <div className="text-xs font-bold text-[#17231b]">Optimizing & Uploading to Cloudinary CDN...</div>
            <p className="text-[10px] text-gray-500">Applying AI smart sizing and WebP compression</p>
          </div>
        ) : hasImage ? (
          <div className="w-full flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            {/* Visual Thumbnail */}
            <div
              className={`relative overflow-hidden rounded-lg border border-[#ddddd9] bg-[#17231b] shadow-xs shrink-0 ${
                previewAspectRatio === "wide"
                  ? "w-36 sm:w-44 h-16 sm:h-20"
                  : "size-16 sm:size-20"
              }`}
            >
              <img
                src={currentValue}
                alt="Banner Preview"
                className="size-full object-contain drop-shadow-xs"
              />
              <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[8px] font-bold text-white backdrop-blur-xs flex items-center gap-0.5">
                <CheckCircle2 className="size-2 text-emerald-400" /> Active
              </div>
            </div>

            {/* Middle Info & Drag Prompt */}
            <div className="flex-1 text-left min-w-[140px]">
              <div className="text-xs font-bold text-[#17231b] flex items-center gap-1.5">
                <span>Image Loaded</span>
                <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">Ready</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 break-all">
                {currentValue.startsWith("data:") ? "Local preview (ready to save)" : currentValue}
              </p>
              <div className="mt-1 text-[10px] font-semibold text-[#244f31] group-hover:underline flex items-center gap-1">
                <UploadCloud className="size-3" />
                <span>Drag & drop a new photo here to replace, or click to browse</span>
              </div>
            </div>

            {/* Clear Button */}
            {onClear && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="shrink-0 p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition text-gray-500 shadow-2xs"
                title="Remove image"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center justify-center gap-1.5">
            <div
              className={`p-2.5 rounded-full transition-transform group-hover:scale-110 ${
                isAmber ? "bg-amber-100 text-amber-800" : "bg-emerald-100/80 text-[#244f31]"
              }`}
            >
              <UploadCloud className="size-6" />
            </div>
            <div className="text-xs font-bold text-[#17231b]">
              Drag & Drop your banner image here
            </div>
            <p className="text-[11px] text-gray-500">
              or <span className={`font-bold underline ${isAmber ? "text-amber-800" : "text-[#244f31]"}`}>browse from computer</span>
            </p>
            <span className="text-[9px] text-gray-400 font-medium">
              Supports PNG, JPG, WEBP, AVIF up to 15MB
            </span>
          </div>
        )}
      </div>

      {/* URL Input Section (For Pasting Existing CDN / Cloudinary Links) */}
      {onUrlChange && (
        <div className="pt-0.5">
          <div className="flex items-center justify-between mb-0.5">
            <label className="block font-bold text-[10px] text-gray-600">
              Or Paste Direct Image URL
            </label>
            {urlAction && <div>{urlAction}</div>}
          </div>
          <div className="relative">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder={placeholderUrl}
              className="w-full rounded-xl border border-[#ddddd9] p-2 pl-7.5 outline-none focus:border-[#244f31] bg-white text-[11px] font-mono text-gray-700 transition"
            />
            <ImageIcon className="size-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}
