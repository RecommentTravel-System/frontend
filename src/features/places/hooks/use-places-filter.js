import { useState, useCallback, useMemo } from "react";
import {
  CATEGORY_FILTER_CONFIGS,
  COMMON_FILTER_DEFAULTS
} from "../config/filter-config";

/**
 * Custom hook managing the state of the unified FilterPanel.
 * Separates pendingFilters (user selections in progress) and appliedFilters (confirmed state triggering API calls).
 */
export function usePlacesFilter(initialValues = {}) {
  // 1. Pending Filters: User selections currently being modified in the UI (does NOT call API)
  const [pendingFilters, setPendingFilters] = useState(() => ({
    ...COMMON_FILTER_DEFAULTS,
    ...initialValues
  }));

  // 2. Applied Filters: Confirmed filter state used for API calls
  const [appliedFilters, setAppliedFilters] = useState(() => ({
    ...COMMON_FILTER_DEFAULTS,
    ...initialValues
  }));

  // Update category in pendingFilters
  const setCategory = useCallback((newCategory) => {
    setPendingFilters((prev) => ({
      ...prev,
      category: newCategory,
      selectedPreferences: [] // clear previous category-specific preferences
    }));
  }, []);

  // Update distanceKm in pendingFilters
  const setDistanceKm = useCallback((distanceKm) => {
    setPendingFilters((prev) => ({ ...prev, distanceKm }));
  }, []);

  // Update minRating in pendingFilters
  const setMinRating = useCallback((rating) => {
    setPendingFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === rating ? null : rating
    }));
  }, []);

  // Update priceLevel in pendingFilters
  const setPriceLevel = useCallback((price) => {
    setPendingFilters((prev) => ({
      ...prev,
      priceLevel: prev.priceLevel === price ? null : price
    }));
  }, []);

  // Toggle preference checkbox in pendingFilters
  const togglePreference = useCallback((prefId) => {
    setPendingFilters((prev) => {
      const exists = prev.selectedPreferences.includes(prefId);
      const next = exists
        ? prev.selectedPreferences.filter((id) => id !== prefId)
        : [...prev.selectedPreferences, prefId];
      return { ...prev, selectedPreferences: next };
    });
  }, []);

  // Keyword search input updates both immediately
  const setKeyword = useCallback((keyword) => {
    setPendingFilters((prev) => ({ ...prev, keyword }));
    setAppliedFilters((prev) => ({ ...prev, keyword }));
  }, []);

  // Apply button action: copies pendingFilters into appliedFilters
  const applyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
  }, [pendingFilters]);

  // Reset button action: resets both pending and applied filters to defaults
  const resetFilters = useCallback(() => {
    setPendingFilters(COMMON_FILTER_DEFAULTS);
    setAppliedFilters(COMMON_FILTER_DEFAULTS);
  }, []);

  // Count active pending filters for badge display
  const pendingFilterCount = useMemo(() => {
    let count = 0;
    if (pendingFilters.category) count++;
    if (pendingFilters.distanceKm !== COMMON_FILTER_DEFAULTS.distanceKm) count++;
    if (pendingFilters.minRating != null) count++;
    if (pendingFilters.priceLevel != null) count++;
    if (pendingFilters.selectedPreferences && pendingFilters.selectedPreferences.length > 0) {
      count += pendingFilters.selectedPreferences.length;
    }
    return count;
  }, [pendingFilters]);

  // Current category config based on pendingFilters
  const currentCategoryConfig = useMemo(() => {
    return CATEGORY_FILTER_CONFIGS[pendingFilters.category] || CATEGORY_FILTER_CONFIGS.RESTAURANT;
  }, [pendingFilters.category]);

  /**
   * Convert appliedFilters state into Spring Boot LocationFilterRequest payload
   */
  const toBackendPayload = useCallback(
    (coordinates) => {
      const lat = coordinates?.lat ?? 16.4637; // Default: Hue center
      const lng = coordinates?.lng ?? 107.5909;
      const radiusMeters = Math.min(10000, Math.max(500, Math.round(appliedFilters.distanceKm * 1000)));

      let categories = [];
      if (appliedFilters.category) {
        const backendCat = CATEGORY_FILTER_CONFIGS[appliedFilters.category]?.backendCategory;
        if (backendCat) {
          categories = [backendCat];
        }
      }

      const categoryConfig = CATEGORY_FILTER_CONFIGS[appliedFilters.category] || CATEGORY_FILTER_CONFIGS.RESTAURANT;
      const availablePrefs = categoryConfig.preferences || [];
      const selectedPrefObjects = availablePrefs.filter((p) =>
        appliedFilters.selectedPreferences.includes(p.id)
      );

      const cuisines = selectedPrefObjects
        .filter((p) => p.targetField === "cuisine")
        .map((p) => p.value.toUpperCase());

      const prefKeywords = selectedPrefObjects
        .filter((p) => p.targetField === "keyword" && p.value)
        .map((p) => p.value);

      const keywordParts = [];
      if (appliedFilters.keyword?.trim()) {
        keywordParts.push(appliedFilters.keyword.trim());
      }
      if (prefKeywords.length > 0) {
        keywordParts.push(...prefKeywords);
      }

      const combinedKeyword = keywordParts.length > 0 ? keywordParts.join(" ") : null;

      return {
        lat,
        lng,
        radiusMeters,
        ...(categories.length > 0 ? { categories } : {}),
        ...(cuisines.length > 0 ? { cuisines } : {}),
        ...(combinedKeyword ? { keyword: combinedKeyword } : {}),
        ...(appliedFilters.minRating ? { minRating: appliedFilters.minRating } : {})
      };
    },
    [appliedFilters]
  );

  return {
    pendingFilters,
    appliedFilters,
    pendingFilterCount,
    currentCategoryConfig,
    setCategory,
    setDistanceKm,
    setMinRating,
    setPriceLevel,
    togglePreference,
    setKeyword,
    applyFilters,
    resetFilters,
    toBackendPayload
  };
}

