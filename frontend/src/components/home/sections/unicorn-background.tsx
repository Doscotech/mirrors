'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

// Types for the UnicornStudio global
interface UnicornStudioScene {
    element: HTMLElement;
    destroy: () => void;
    contains?: (element: HTMLElement | null) => boolean;
}

interface UnicornStudioConfig {
    scale: number;
    dpi: number;
}

interface UnicornStudio {
    isInitialized: boolean;
    init: (config?: UnicornStudioConfig) => Promise<UnicornStudioScene[] | undefined>;
}

// Load UnicornStudio once
function useUnicornStudio() {
    const [isLoaded, setIsLoaded] = useState(false);
    const scriptRef = useRef<HTMLScriptElement | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const version = '1.4.25';
        const scriptUrl = `https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v${version}/dist/unicornStudio.umd.js`;

        const existing = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement | null;
        if (existing) {
            if ((window as any).UnicornStudio) setIsLoaded(true);
            else existing.addEventListener('load', () => setIsLoaded(true));
            scriptRef.current = existing;
            return;
        }

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error('Failed to load UnicornStudio script');
        document.body.appendChild(script);
        scriptRef.current = script;

        return () => {
            if (scriptRef.current && !existing) {
                document.body.removeChild(scriptRef.current);
            }
        };
    }, []);

    const unicorn = typeof window !== 'undefined' ? (window as any).UnicornStudio as UnicornStudio | undefined : undefined;
    return { isLoaded, UnicornStudio: unicorn };
}

export function UnicornBackground() {
    const [isBackgroundVisible, setIsBackgroundVisible] = useState(false);
    const sceneRef = useRef<UnicornStudioScene | null>(null);
    const { isLoaded, UnicornStudio } = useUnicornStudio();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    useEffect(() => {
        if (!isLoaded) return;

        // In light mode, ensure any existing scene is destroyed and remain hidden
        if (!isDark) {
            if (sceneRef.current?.destroy) {
                sceneRef.current.destroy();
                sceneRef.current = null;
            }
            setIsBackgroundVisible(false);
            return;
        }

        const init = async () => {
            const container = document.querySelector('[data-us-project="Gr1LmwbKSeJOXhpYEdit"]');
            if (!container) return;

            if (sceneRef.current?.destroy) sceneRef.current.destroy();

            try {
                const scenes = await UnicornStudio?.init({ scale: 1, dpi: 1.5 });
                const ourScene = scenes?.find(s => s.element === container || s.element.contains(container as HTMLElement));
                if (ourScene) {
                    sceneRef.current = ourScene;
                    setTimeout(() => setIsBackgroundVisible(true), 800);
                }
            } catch (e) {
                console.error('UnicornStudio init failed', e);
                setTimeout(() => setIsBackgroundVisible(true), 800);
            }
        };

        void init();
        return () => {
            if (sceneRef.current?.destroy) {
                sceneRef.current.destroy();
                sceneRef.current = null;
            }
        };
    }, [isLoaded, UnicornStudio, isDark]);

    return (
        <div className="absolute inset-0 w-full h-screen overflow-hidden">
            <motion.div
                data-us-project="Gr1LmwbKSeJOXhpYEdit"
                className="absolute inset-0 w-full h-[calc(100vh+80px)] z-0"
                style={{ pointerEvents: 'none', willChange: 'opacity', transform: 'translateZ(0)', backgroundColor: 'transparent' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isDark && isBackgroundVisible ? 1 : 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                aria-hidden={!isDark}
            />
        </div>
    );
}
