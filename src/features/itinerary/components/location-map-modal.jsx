import { useEffect, useRef, useState } from "react";

const LEAFLET_OVERRIDE_STYLES = `
  .pb-map-wrapper {
    position: relative !important;
    overflow: hidden !important;
  }
  .pb-map-wrapper .leaflet-container {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    border-radius: inherit;
  }
`;

export function LocationMapModal({ initialQuery = "", onConfirm, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080/wayvee";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({
    name: initialQuery || "Huế",
    lat: 16.4637,
    lng: 107.5909
  });
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Dynamic load of Leaflet CSS & JS matching address-picker-page.tsx pattern
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.L) {
      setIsLeafletReady(true);
      return;
    }

    let cssLoaded = false;
    let jsLoaded = false;

    const checkBothLoaded = () => {
      if (cssLoaded && jsLoaded) setIsLeafletReady(true);
    };

    let link = document.querySelector("link[data-leaflet]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      link.setAttribute("data-leaflet", "true");
      link.onload = () => {
        cssLoaded = true;
        checkBothLoaded();
      };
      document.head.appendChild(link);
    } else {
      cssLoaded = true;
    }

    let script = document.querySelector("script[data-leaflet]");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.crossOrigin = "";
      script.setAttribute("data-leaflet", "true");
      script.onload = () => {
        jsLoaded = true;
        checkBothLoaded();
      };
      document.body.appendChild(script);
    } else if (window.L) {
      jsLoaded = true;
    }

    checkBothLoaded();
  }, []);

  // Auto geocode initialQuery on mount if provided
  useEffect(() => {
    if (!isLeafletReady || !initialQuery || !initialQuery.trim()) return;

    let isMounted = true;
    const geocodeInitial = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            initialQuery
          )}&countrycodes=vn&accept-language=vi&limit=1`
        );
        const data = await res.json();
        if (isMounted && data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const fullName = data[0].display_name;
          const shortName = data[0].name || initialQuery;

          setSelectedLocation({
            name: shortName,
            fullName,
            lat,
            lng
          });

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 13);
            markerRef.current.setLatLng([lat, lng]);
            setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
          }
        }
      } catch (err) {
        console.warn("Initial query geocode failed:", err);
      }
    };

    geocodeInitial();
    return () => {
      isMounted = false;
    };
  }, [isLeafletReady, initialQuery]);

  // Initialize Leaflet Map Instance matching address-picker-page.tsx
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current || typeof window === "undefined") return;

    const L = window.L;
    if (!L || mapInstanceRef.current) return;

    // Clean stale _leaflet_id to avoid "Map container is already initialized"
    const container = mapContainerRef.current;
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const initialLat = selectedLocation.lat;
    const initialLng = selectedLocation.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      scrollWheelZoom: true
    });

    const leafletEl = map.getContainer();
    const forcedStyles = {
      position: "relative",
      top: "auto",
      left: "auto",
      right: "auto",
      bottom: "auto",
      inset: "auto",
      width: "100%",
      height: "100%",
      "max-width": "100%",
      "max-height": "100%",
      "z-index": "0"
    };
    Object.entries(forcedStyles).forEach(([prop, value]) => {
      leafletEl.style.setProperty(prop, value, "important");
    });

    // OpenStreetMap standard tiles
    const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY;

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoApiKey}`,
      {
        attribution:
          '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: DefaultIcon
    }).addTo(map);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    const timers = [
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50),
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200),
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 500)
    ];

    const debouncedReverseGeocode = (lat, lng) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        handleReverseGeocode(lat, lng);
      }, 1000);
    };

    // Map click event
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      debouncedReverseGeocode(lat, lng);
    });

    // Marker drag event
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      debouncedReverseGeocode(pos.lat, pos.lng);
    });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      timers.forEach(clearTimeout);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady]);

  // Reverse geocode via Wayvee Spring Boot Backend
  const handleReverseGeocode = async (lat, lng) => {
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng)
      });

      const response = await fetch(
        `${API_BASE_URL}/api/location/reverse?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocode HTTP ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result;

      console.log("Reverse geocode response:", data);

      const displayName = data.display_name || data.displayName || "Vị trí đã chọn";

      setSelectedLocation({
        lat,
        lng,
        name: displayName,
        fullName: displayName
      });
    } catch (error) {
      console.error("Reverse geocode failed:", error);

      // Quan trọng: vẫn cho phép user chọn tọa độ
      setSelectedLocation({
        lat,
        lng,
        name: "Vị trí đã chọn"
      });
    }
  };

  // Search location via Nominatim
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=vn&accept-language=vi&limit=5`
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.warn("Search location failed:", err);
    }
  };

  // Get user geolocation
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await handleReverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  // Handle dropdown selection
  const handleSelectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const address = item.address || {};
    const shortName =
      item.name ||
      address.city ||
      address.town ||
      item.display_name.split(",")[0];

    setSelectedLocation({
      name: shortName,
      fullName: item.display_name,
      lat,
      lng
    });
    setSearchQuery(shortName);
    setSearchResults([]);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 13);
      markerRef.current.setLatLng([lat, lng]);
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedLocation.fullName || selectedLocation.name || searchQuery, {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <style>{LEAFLET_OVERRIDE_STYLES}</style>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-[#002d54] dark:text-white flex items-center gap-2">
              <span>📍</span> Chọn vị trí địa điểm trên bản đồ Leaflet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gõ tên tìm kiếm hoặc ghim vị trí trực tiếp trên bản đồ Leaflet bên dưới
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search Input & GPS Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Gõ tìm địa điểm (ví dụ: Hà Nội, Huế, Đà Nẵng, Phú Quốc...)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 text-slate-800 dark:text-slate-100"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>

            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-start gap-2 cursor-pointer"
                  >
                    <span className="text-sky-500 mt-0.5">📍</span>
                    <span className="truncate">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGetMyLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>🎯</span>
            <span className="hidden sm:inline">{isLocating ? "Đang định vị..." : "Vị trí của tôi"}</span>
          </button>
        </div>

        {/* Leaflet Map Area matching pb-map-wrapper pattern */}
        <div className="pb-map-wrapper relative w-full h-72 sm:h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
          {!isLeafletReady && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 z-10 bg-slate-100 dark:bg-slate-800">
              Đang tải bản đồ Leaflet...
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Selected Location Summary & Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Xác nhận vị trí
            </button>
          </div>
        </div>
      </div>
  );
}
