"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "../layout/Container";

type Props = {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    viewAllLink?: string;
    viewAllText?: string;
};

export function DynamicCategorySlider({ children, title, subtitle, viewAllLink, viewAllText = "Ver todos" }: Props) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

        setShowLeftArrow(scrollLeft > 20);
        // 5px tolerance for precision issues on some displays
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    };

    useEffect(() => {
        // Initial check in case children don't overflow
        handleScroll();
        window.addEventListener("resize", handleScroll);
        return () => window.removeEventListener("resize", handleScroll);
    }, [children]);

    const scrollByAmount = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;

        // Scroll by slightly less than the container width to keep context
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    return (
        <section className="relative w-full py-8">
            {/* Header section optional if title is provided */}
            {title && (
                <Container>
                    <div className="mb-6 flex items-end justify-between px-4 md:px-0">
                        <div>
                            {subtitle && <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-1">{subtitle}</p>}
                            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{title}</h2>
                        </div>
                        {viewAllLink && (
                            <a
                                href={viewAllLink}
                                className="hidden md:inline-flex text-sm font-semibold text-primary hover:underline"
                            >
                                {viewAllText}
                            </a>
                        )}
                    </div>
                </Container>
            )}

            {/* Main Slider Area */}
            <div className="relative mx-auto w-full">
                <Container className="relative">
                    {/* Navigation Arrows (Desktop mainly) */}
                    {showLeftArrow && (
                        <button
                            onClick={() => scrollByAmount("left")}
                            className="absolute left-0 md:-left-4 top-[40%] z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 text-slate-700 transition hover:bg-slate-50 hover:text-primary focus:outline-none"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {showRightArrow && (
                        <button
                            onClick={() => scrollByAmount("right")}
                            className="absolute right-0 md:-right-4 top-[40%] z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 text-slate-700 transition hover:bg-slate-50 hover:text-primary focus:outline-none"
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </Container>

                {/* Scrollable Container Wrapper */}
                <Container>
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {/* Custom CSS class to hide webkit scrollbar but it's simpler to inject it via style tags or global css, here we use inline styles for firefox/IE and a wrapper hack or global config for chrome */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
                div::-webkit-scrollbar {
                  display: none;
                }
              `}} />

                        {children}

                        {/* Spacer so the last item isn't flush against the right edge */}
                        <div className="w-1 shrink-0 snap-end sm:w-4" />
                    </div>
                </Container>
            </div>

            {viewAllLink && (
                <div className="mt-2 text-center md:hidden px-4">
                    <a
                        href={viewAllLink}
                        className="inline-block w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                        {viewAllText}
                    </a>
                </div>
            )}
        </section>
    );
}
