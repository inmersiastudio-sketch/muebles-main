"use client";

import { useState } from "react";
import { ColorImageCarousel, type ImageWithType } from "../media/ColorImageCarousel";
import { ProductInfoTabs } from "./ProductInfoTabs";

type Props = {
    images: ImageWithType[];
    alt: string;
    initialColor?: string | null;
    arUrl?: string;
    glbUrl?: string;
    usdzUrl?: string;
    // ProductInfoTabs props
    description?: string | null;
    category?: string | null;
    room?: string | null;
    style?: string | null;
    material?: string | null;
    color?: string | null;
    widthCm?: number | null;
    depthCm?: number | null;
    heightCm?: number | null;
    weightKg?: number | null;
    // Slots for additional content after tabs (CTA buttons, store info, etc.)
    children?: React.ReactNode;
};

/**
 * Client wrapper that connects ColorImageCarousel with ProductInfoTabs,
 * so selecting a color swatch updates the "Color" field in the specs tab.
 */
export function ProductDetailView({
    images,
    alt,
    initialColor,
    arUrl,
    glbUrl,
    usdzUrl,
    description,
    category,
    room,
    style,
    material,
    color,
    widthCm,
    depthCm,
    heightCm,
    weightKg,
    children,
}: Props) {
    const [activeColor, setActiveColor] = useState<string | null>(initialColor ?? color ?? null);

    return (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <ColorImageCarousel
                images={images}
                alt={alt}
                initialColor={initialColor}
                arUrl={arUrl}
                glbUrl={glbUrl}
                usdzUrl={usdzUrl}
                onColorChange={(col) => setActiveColor(col)}
            />

            <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
                {children}

                <ProductInfoTabs
                    description={description}
                    category={category}
                    room={room}
                    style={style}
                    material={material}
                    color={activeColor}
                    widthCm={widthCm}
                    depthCm={depthCm}
                    heightCm={heightCm}
                    weightKg={weightKg}
                />
            </div>
        </div>
    );
}
