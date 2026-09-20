import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CONTAINER_WIDTH_PRESETS, LAYOUT_DENSITY_PRESETS, DEFAULT_LAYOUT_CONFIG } from "~/shared/config/layout-presets";
import { STORAGE_KEYS } from "~/shared/config/site";
import { storage } from "~/shared/lib/storage";

const LayoutContext = createContext({
  config: DEFAULT_LAYOUT_CONFIG,
  updateConfig: () => {},
  setMode: () => {},
  setCustomWidth: () => {},
  setDensity: () => {},
  toggleAutoAdapt: () => {},
  resetLayout: () => {},
  effectiveWidthPx: 1280
});

export function LayoutProvider({ children }) {
  const [config, setConfig] = useState(() => {
    const saved = storage.get(STORAGE_KEYS.layoutConfig, null);
    return saved ? { ...DEFAULT_LAYOUT_CONFIG, ...saved } : DEFAULT_LAYOUT_CONFIG;
  });

  const [effectiveWidthPx, setEffectiveWidthPx] = useState(1280);

  // Apply CSS variables to :root / document element
  const applyLayoutToDOM = useCallback((currentConfig) => {
    if (typeof document === "undefined") return;

    let targetMaxWidth = "1280px";
    let widthNumber = 1280;

    if (currentConfig.autoAdapt) {
      const windowWidth = window.innerWidth;
      if (windowWidth < 640) {
        targetMaxWidth = "100%";
        widthNumber = windowWidth;
      } else if (windowWidth <= 1024) {
        targetMaxWidth = "1024px";
        widthNumber = 1024;
      } else if (windowWidth <= 1440) {
        targetMaxWidth = "1280px";
        widthNumber = 1280;
      } else {
        targetMaxWidth = "1440px";
        widthNumber = 1440;
      }
    } else {
      if (currentConfig.mode === "custom") {
        targetMaxWidth = `${currentConfig.customWidth}px`;
        widthNumber = currentConfig.customWidth;
      } else {
        const foundPreset = CONTAINER_WIDTH_PRESETS.find((p) => p.id === currentConfig.mode);
        if (foundPreset) {
          targetMaxWidth = typeof foundPreset.maxWidth === "number" ? `${foundPreset.maxWidth}px` : foundPreset.maxWidth;
          widthNumber = typeof foundPreset.maxWidth === "number" ? foundPreset.maxWidth : window.innerWidth;
        }
      }
    }

    const densityPreset = LAYOUT_DENSITY_PRESETS.find((d) => d.id === currentConfig.density) || LAYOUT_DENSITY_PRESETS[1];

    document.documentElement.style.setProperty("--container-max-width", targetMaxWidth);
    document.documentElement.style.setProperty("--container-padding", densityPreset.padding);

    setEffectiveWidthPx(widthNumber);
  }, []);

  // Update layout when config changes
  useEffect(() => {
    applyLayoutToDOM(config);
    storage.set(STORAGE_KEYS.layoutConfig, config);
  }, [config, applyLayoutToDOM]);

  // Handle window resize when autoAdapt is active
  useEffect(() => {
    if (!config.autoAdapt) return;

    const handleResize = () => {
      applyLayoutToDOM(config);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [config, applyLayoutToDOM]);

  const updateConfig = (newPartial) => {
    setConfig((prev) => ({ ...prev, ...newPartial }));
  };

  const setMode = (mode) => updateConfig({ mode, autoAdapt: false });
  const setCustomWidth = (customWidth) => updateConfig({ customWidth, mode: "custom", autoAdapt: false });
  const setDensity = (density) => updateConfig({ density });
  const toggleAutoAdapt = () => updateConfig({ autoAdapt: !config.autoAdapt });
  const resetLayout = () => setConfig(DEFAULT_LAYOUT_CONFIG);

  return (
    <LayoutContext.Provider
      value={{
        config,
        updateConfig,
        setMode,
        setCustomWidth,
        setDensity,
        toggleAutoAdapt,
        resetLayout,
        effectiveWidthPx
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
