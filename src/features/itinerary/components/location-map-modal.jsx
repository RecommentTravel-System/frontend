import { useEffect, useRef, useState } from "react";
import { api } from "~/shared/lib/api";
import { useDelayedLoading } from "~/shared/lib/use-delayed-loading";
import { Spinner } from "~/shared/ui/loading";
import { findLocalVietnamDestination } from "./vietnam-locations-data";

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
  const autoGeocodeTimerRef = useRef(null);
  const searchContainerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    name: initialQuery || "Huế",
    fullName: initialQuery || "Huế, Thừa Thiên Huế, Việt Nam",
    lat: 16.4637,
    lng: 107.5909
  });
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchSuccess, setSearchSuccess] = useState(null);

  const { visible: showSearchLoading } = useDelayedLoading(isSearching, { delay: 200 });
  const { visible: showLocatingLoading } = useDelayedLoading(isLocating, { delay: 200 });

  // Dynamic load of Leaflet CSS & JS
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Move marker & map view helper
  const moveMapAndMarker = (lat, lng, zoom = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
  };

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

          moveMapAndMarker(lat, lng, 14);
          return;
        }
      } catch (err) {
        console.warn("Initial query geocode failed:", err);
      }

      // Fallback to local knowledge base
      if (isMounted) {
        const localMatch = findLocalVietnamDestination(initialQuery);
        if (localMatch) {
          setSelectedLocation({
            name: localMatch.name,
            fullName: localMatch.fullName,
            lat: localMatch.lat,
            lng: localMatch.lng
          });
          moveMapAndMarker(localMatch.lat, localMatch.lng, 14);
        }
      }
    };

    geocodeInitial();
    return () => {
      isMounted = false;
    };
  }, [isLeafletReady, initialQuery]);

  // Reverse geocode: converts (lat, lng) -> Address and updates search input
  const handleReverseGeocode = async (lat, lng, updateInputField = true) => {
    try {
      let displayName = "";

      // 1. Try Backend API first
      try {
        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng)
        });
        const result = await api.get(`/api/location/reverse?${params.toString()}`);
        const data = result.data || result;
        displayName = data.display_name || data.displayName || data.name || "";
      } catch (backendErr) {
        console.warn("Backend reverse geocode fallback:", backendErr);
      }

      // 2. Fallback to Nominatim OSM if backend does not return full address
      if (!displayName) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
        );
        const data = await res.json();
        displayName = data.display_name || "";
      }

      if (!displayName) {
        displayName = `Vị trí (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      }

      const shortName = displayName.split(",")[0] || displayName;

      setSelectedLocation({
        lat,
        lng,
        name: shortName,
        fullName: displayName
      });

      if (updateInputField) {
        setSearchQuery(displayName);
      }
    } catch (error) {
      console.error("Reverse geocode failed:", error);
      const fallbackName = `Vị trí (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      setSelectedLocation({
        lat,
        lng,
        name: fallbackName,
        fullName: fallbackName
      });
      if (updateInputField) {
        setSearchQuery(fallbackName);
      }
    }
  };

  // Initialize Leaflet Map Instance
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

    const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY;

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoApiKey}`,
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 20
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
        handleReverseGeocode(lat, lng, true);
      }, 500);
    };

    // Map click event: moves marker & immediately auto-fills input
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      debouncedReverseGeocode(lat, lng);
    });

    // Marker drag event: auto-fills input upon release
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      debouncedReverseGeocode(pos.lat, pos.lng);
    });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (autoGeocodeTimerRef.current) {
        clearTimeout(autoGeocodeTimerRef.current);
      }
      timers.forEach(clearTimeout);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady]);

  // Search location via Nominatim and auto-point map
  const handleSearch = (query) => {
    setSearchQuery(query);
    setSearchError(null);
    setSearchSuccess(null);

    if (autoGeocodeTimerRef.current) {
      clearTimeout(autoGeocodeTimerRef.current);
    }

    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    // Debounced search to show suggestions and automatically point map to top result
    autoGeocodeTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      let foundItems = [];

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query.trim()
          )}&countrycodes=vn&accept-language=vi&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            foundItems = data;
          }
        }
      } catch (err) {
        console.warn("Search location error:", err);
      }

      // Check local database if Nominatim returns nothing
      if (foundItems.length === 0) {
        const localMatch = findLocalVietnamDestination(query.trim());
        if (localMatch) {
          foundItems = [
            {
              place_id: `local-${localMatch.name}`,
              name: localMatch.name,
              display_name: localMatch.fullName,
              lat: String(localMatch.lat),
              lon: String(localMatch.lng)
            }
          ];
        }
      }

      setSearchResults(foundItems);

      // Auto point marker & map to the best match as user types an address
      if (foundItems.length > 0) {
        const topItem = foundItems[0];
        const lat = parseFloat(topItem.lat);
        const lng = parseFloat(topItem.lon);
        const shortName = topItem.name || topItem.display_name.split(",")[0];

        setSelectedLocation({
          name: shortName,
          fullName: topItem.display_name,
          lat,
          lng
        });
        moveMapAndMarker(lat, lng, 13);
      }

      setIsSearching(false);
    }, 450);
  };

  // Immediate geocode when user hits Enter or clicks search icon
  const handleDirectSearch = async () => {
    const rawQuery = searchQuery?.trim();
    if (!rawQuery) {
      setSearchError("Vui lòng nhập tên địa điểm hoặc thành phố cần tìm kiếm.");
      setSearchSuccess(null);
      return;
    }

    if (autoGeocodeTimerRef.current) {
      clearTimeout(autoGeocodeTimerRef.current);
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchSuccess(null);

    let foundItems = [];

    // 1. Try Nominatim with countrycodes=vn
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          rawQuery
        )}&countrycodes=vn&accept-language=vi&limit=5`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          foundItems = data;
        }
      }
    } catch (err) {
      console.warn("Direct search Nominatim failed:", err);
    }

    // 2. Fallback: Try Nominatim with appended ', Việt Nam' if empty
    if (foundItems.length === 0) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            rawQuery + ", Việt Nam"
          )}&accept-language=vi&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            foundItems = data;
          }
        }
      } catch (err) {
        console.warn("Direct search fallback Nominatim failed:", err);
      }
    }

    // 3. Fallback: Try built-in Vietnam Locations Database
    if (foundItems.length === 0) {
      const localMatch = findLocalVietnamDestination(rawQuery);
      if (localMatch) {
        foundItems = [
          {
            place_id: `local-${localMatch.name}`,
            name: localMatch.name,
            display_name: localMatch.fullName,
            lat: String(localMatch.lat),
            lon: String(localMatch.lng)
          }
        ];
      }
    }

    setIsSearching(false);

    if (foundItems.length > 0) {
      setSearchResults(foundItems);
      handleSelectSearchResult(foundItems[0]);
      setSearchSuccess(`Đã tìm thấy: ${foundItems[0].name || foundItems[0].display_name}`);
      setSearchError(null);
      setTimeout(() => setSearchSuccess(null), 3500);
    } else {
      setSearchResults([]);
      setSearchError(
        `Không tìm thấy địa điểm phù hợp cho "${rawQuery}". Vui lòng kiểm tra lại chính tả hoặc nhấp trực tiếp trên bản đồ bên dưới để chọn vị trí.`
      );
    }
  };

  // Get user geolocation -> Point marker & Auto-fill address into search input
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // 1. Point marker & fly map immediately to user's location
        moveMapAndMarker(latitude, longitude, 15);

        // 2. Reverse geocode and auto-fill address into input box
        await handleReverseGeocode(latitude, longitude, true);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation failed:", err);
        setIsLocating(false);
        alert("Không thể lấy vị trí hiện tại. Vui lòng cho phép quyền truy cập vị trí trên trình duyệt.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle dropdown item click
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

    setSearchQuery(item.display_name);
    setSearchResults([]);

    moveMapAndMarker(lat, lng, 14);
  };

  const handleConfirm = () => {
    onConfirm(selectedLocation.fullName || selectedLocation.name || searchQuery, {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <style>{LEAFLET_OVERRIDE_STYLES}</style>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-modal-enter">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-[#002d54] dark:text-white flex items-center gap-2">
              <span>📍</span> Chọn vị trí địa điểm trên bản đồ
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gõ tên tìm kiếm hoặc ghim vị trí trực tiếp trên bản đồ bên dưới
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDirectSearch();
          }}
          className="flex flex-col gap-2"
          ref={searchContainerRef}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Gõ tìm địa điểm (ví dụ: Hà Nội, Huế, đà Nẵng, Phú Quốc...)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleDirectSearch();
                  }
                }}
                className="w-full pl-9 pr-16 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              {showSearchLoading ? (
                <span className="absolute left-3 top-2.5 flex items-center justify-center pointer-events-none" aria-label="Đang tìm kiếm vị trí">
                  <Spinner size="xs" variant="primary" />
                </span>
              ) : (
                <button
                  type="submit"
                  className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                  title="Tìm kiếm vị trí"
                >
                  🔍
                </button>
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setSearchError(null);
                    setSearchSuccess(null);
                  }}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}

              {/* Search Dropdown Results */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.place_id}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-start gap-2 cursor-pointer transition-colors"
                    >
                      <span className="text-sky-500 mt-0.5">📍</span>
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nút Tìm kiếm */}
            <button
              type="submit"
              disabled={isSearching}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
              title="Tìm kiếm địa điểm (Enter)"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Tìm</span>
            </button>

            {/* Vị trí của tôi Button */}
            <button
              type="button"
              onClick={handleGetMyLocation}
              disabled={isLocating}
              aria-busy={isLocating}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {showLocatingLoading ? <Spinner size="xs" variant="cyan" /> : <span>🎯</span>}
              <span className="hidden sm:inline">
                {isLocating ? "Đang định vị..." : "Vị trí của tôi"}
              </span>
            </button>
          </div>

          {/* Search Error / Not Found Alert */}
          {searchError && (
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-bold text-sm shrink-0">⚠️</span>
                <span>{searchError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchError(null)}
                className="text-rose-400 hover:text-rose-600 p-0.5 rounded cursor-pointer shrink-0"
                title="Đóng thông báo"
              >
                ✕
              </button>
            </div>
          )}

          {/* Search Success Notification */}
          {searchSuccess && !searchError && (
            <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span className="truncate">{searchSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchSuccess(null)}
                className="text-emerald-400 hover:text-emerald-600 p-0.5 rounded cursor-pointer shrink-0"
                title="Đóng thông báo"
              >
                ✕
              </button>
            </div>
          )}
        </form>

        {/* Leaflet Map Area */}
        <div className="pb-map-wrapper relative w-full h-72 sm:h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
          {!isLeafletReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 z-10 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xs">
              <Spinner size="sm" variant="primary" />
              <span>Đang tải bản đồ...</span>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Selected Location Summary & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 w-full sm:w-auto">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Đã chọn:</span>{" "}
            {selectedLocation.fullName || selectedLocation.name || "Chưa có địa điểm"}
          </div>

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
    </div>
  );
}
