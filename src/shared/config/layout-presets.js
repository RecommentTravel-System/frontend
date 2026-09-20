export const CONTAINER_WIDTH_PRESETS = [
  { id: "compact", label: "Gọn gàng (1024px)", maxWidth: 1024, desc: "Tối ưu cho laptop nhỏ và tablet ngang" },
  { id: "standard", label: "Tiêu chuẩn (1280px)", maxWidth: 1280, desc: "Bố cục cân đối mặc định cho đa số màn hình" },
  { id: "wide", label: "Rộng rãi (1440px)", maxWidth: 1440, desc: "Tối ưu cho màn hình Desktop 2K/Monitor lớn" },
  { id: "full", label: "Tràn viền (Fluid 100%)", maxWidth: "100%", desc: "Mở rộng 100% khung hình Ultra-wide" },
  { id: "custom", label: "Tùy chỉnh Pixel", maxWidth: null, desc: "Điều chỉnh thủ công theo từng độ rộng mong muốn" }
];

export const LAYOUT_DENSITY_PRESETS = [
  { id: "compact", label: "Gọn (16px)", padding: "1rem" },
  { id: "comfortable", label: "Vừa vặn (24px)", padding: "1.5rem" },
  { id: "spacious", label: "Thoải mái (40px)", padding: "2.5rem" }
];

export const DEFAULT_LAYOUT_CONFIG = {
  mode: "standard", // "compact" | "standard" | "wide" | "full" | "custom"
  customWidth: 1320, // in px (960 to 1920)
  density: "comfortable", // "compact" | "comfortable" | "spacious"
  autoAdapt: true // Automatically adapt to user's device screen resolution
};
