"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  productName: string;
  className?: string;
}

export function ShareButton({ productName, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Mirá este ${productName} en Amobly`,
          url: url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard failed
      }
    }
  };

  return (
    <button 
      type="button"
      className={className}
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-[var(--success-600)]" />
          <span className="text-[var(--success-600)]">Copiado</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Compartir</span>
        </>
      )}
    </button>
  );
}
