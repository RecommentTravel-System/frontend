import { useState } from "react";
import { useTranslation } from "~/providers/i18n-provider";

export function ItineraryBuilder({
  placesList,
  daysSchedule,
  onScheduleChange,
  onAddMorePlaces,
  onRemovePlaceFromList
}) {
  const { t } = useTranslation();
  const [activeDay, setActiveDay] = useState(1);
  const [totalDays, setTotalDays] = useState(() => {
    const existingDays = Object.keys(daysSchedule).map(Number);
    return existingDays.length > 0 ? Math.max(3, ...existingDays) : 3;
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState(null);

  // Places assigned to currently active day
  const assignedPlaceIdsForActiveDay = daysSchedule[activeDay] || [];
  const assignedPlacesForActiveDay = assignedPlaceIdsForActiveDay
    .map((id) => placesList.find((p) => (p.osmId || p.id) === id))
    .filter(Boolean);

  // Places that are not assigned to ANY day
  const allAssignedIds = new Set(
    Object.values(daysSchedule).flatMap((ids) => ids || [])
  );
  const unassignedPlaces = placesList.filter(
    (p) => !allAssignedIds.has(p.osmId || p.id)
  );

  // Handler: Add a place from pool into current active day
  const handleAddPlaceToActiveDay = (placeId) => {
    const currentList = daysSchedule[activeDay] || [];
    if (!currentList.includes(placeId)) {
      onScheduleChange({
        ...daysSchedule,
        [activeDay]: [...currentList, placeId]
      });
    }
  };

  // Handler: Remove place from active day (moves back to unassigned pool)
  const handleRemoveFromActiveDay = (placeId) => {
    const currentList = daysSchedule[activeDay] || [];
    onScheduleChange({
      ...daysSchedule,
      [activeDay]: currentList.filter((id) => id !== placeId)
    });
  };

  // Handler: Move place up in order within active day
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const currentList = [...(daysSchedule[activeDay] || [])];
    const temp = currentList[index - 1];
    currentList[index - 1] = currentList[index];
    currentList[index] = temp;
    onScheduleChange({
      ...daysSchedule,
      [activeDay]: currentList
    });
  };

  // Handler: Move place down in order within active day
  const handleMoveDown = (index) => {
    const currentList = [...(daysSchedule[activeDay] || [])];
    if (index >= currentList.length - 1) return;
    const temp = currentList[index + 1];
    currentList[index + 1] = currentList[index];
    currentList[index] = temp;
    onScheduleChange({
      ...daysSchedule,
      [activeDay]: currentList
    });
  };

  // Handler: Add new day tab
  const handleAddDay = () => {
    const newDay = totalDays + 1;
    setTotalDays(newDay);
    setActiveDay(newDay);
  };

  // Handler: Remove a day
  const handleRemoveDay = (dayNum) => {
    if (totalDays <= 1) return;
    const newSchedule = { ...daysSchedule };
    delete newSchedule[dayNum];
    // Reindex subsequent days if needed
    const updated = {};
    let newIdx = 1;
    for (let d = 1; d <= totalDays; d++) {
      if (d !== dayNum) {
        if (newSchedule[d]) {
          updated[newIdx] = newSchedule[d];
        }
        newIdx++;
      }
    }
    setTotalDays(totalDays - 1);
    setActiveDay((prev) => (prev >= totalDays ? Math.max(1, totalDays - 1) : prev));
    onScheduleChange(updated);
  };

  // Handler: Optimize Itinerary order for the active day (ready for WAYVEE auto optimization service)
  const handleOptimizeActiveDay = () => {
    setIsOptimizing(true);
    setOptimizeMessage(null);

    setTimeout(() => {
      const currentList = daysSchedule[activeDay] || [];
      if (currentList.length > 1) {
        // Sort/optimize heuristic: by rating or logical geo/review flow
        const sorted = [...currentList].sort((aId, bId) => {
          const placeA = placesList.find((p) => (p.osmId || p.id) === aId);
          const placeB = placesList.find((p) => (p.osmId || p.id) === bId);
          return (placeB?.rating || 0) - (placeA?.rating || 0);
        });
        onScheduleChange({
          ...daysSchedule,
          [activeDay]: sorted
        });
      }

      setIsOptimizing(false);
      setOptimizeMessage(t("tripCreate.itineraryBuilder.optimizedSuccess"));
      setTimeout(() => setOptimizeMessage(null), 3500);
    }, 800);
  };

  return (
    <div className="space-y-6" data-purpose="itinerary-builder">
      {/* Optimization Banner / CTA */}
      <div className="bg-gradient-to-r from-[#002d5b] via-[#003b6d] to-[#00a3e0] dark:from-slate-900 dark:via-sky-950 dark:to-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-sky-400/20">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center font-black text-lg shrink-0">
            ⚡
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white">
              {t("tripCreate.itineraryBuilder.optimizeButton")}
            </h4>
            <p className="text-xs text-sky-100 dark:text-slate-300">
              {t("tripCreate.itineraryBuilder.optimizeDesc")}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isOptimizing || assignedPlacesForActiveDay.length < 2}
          onClick={handleOptimizeActiveDay}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOptimizing
            ? t("tripCreate.itineraryBuilder.optimizing")
            : t("tripCreate.itineraryBuilder.optimizeDay", { day: activeDay })}
        </button>
      </div>

      {optimizeMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <span>✨</span>
          <span className="font-medium">{optimizeMessage}</span>
        </div>
      )}

      {/* Days Tabs Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const count = (daysSchedule[dayNum] || []).length;
            const isActive = activeDay === dayNum;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setActiveDay(dayNum)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-[#002d5b] dark:bg-sky-500 text-white dark:text-slate-950 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{t("tripCreate.itineraryBuilder.dayTab", { day: dayNum })}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleAddDay}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-[#002d5b] dark:hover:text-sky-400 hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            {t("tripCreate.itineraryBuilder.addDay")}
          </button>
        </div>

        {totalDays > 1 && (
          <button
            type="button"
            onClick={() => handleRemoveDay(activeDay)}
            className="text-[11px] text-rose-500 hover:underline px-2 py-1 cursor-pointer shrink-0"
            title={t("tripCreate.itineraryBuilder.removeDayBtn", { day: activeDay })}
          >
            {t("tripCreate.itineraryBuilder.removeDayBtn", { day: activeDay })}
          </button>
        )}
      </div>

      {/* Main Builder Area: 2 Columns (Assigned Places vs Available Pool) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Places scheduled for active Day (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📅</span>
              <span>
                {t("tripCreate.itineraryBuilder.assignedPlaces", {
                  day: activeDay,
                  count: assignedPlacesForActiveDay.length
                })}
              </span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {t("tripCreate.itineraryBuilder.reorderHint")}
            </span>
          </div>

          {assignedPlacesForActiveDay.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center text-lg">
                📍
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("tripCreate.itineraryBuilder.emptyAssigned", { day: activeDay })}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {t("tripCreate.itineraryBuilder.emptyAssignedPrompt")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedPlacesForActiveDay.map((place, index) => {
                const placeId = place.osmId || place.id;
                const isFirst = index === 0;
                const isLast = index === assignedPlacesForActiveDay.length - 1;

                return (
                  <div
                    key={placeId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex items-center gap-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Order Number Badge */}
                    <div className="w-7 h-7 rounded-lg bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    {place.image && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {place.name}
                        </h5>
                        {place.rating && (
                          <span className="text-[11px] text-amber-500 font-bold shrink-0">
                            ★ {place.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {place.location || place.address || "Địa điểm khám phá"}
                      </p>
                    </div>

                    {/* Actions (Move Up, Move Down, Remove from Day) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveUp(index)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveDown(index)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Di chuyển xuống"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromActiveDay(placeId)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title={t("tripCreate.itineraryBuilder.removeFromDay")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Unassigned Places Pool (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🗂️</span>
              <span>{t("tripCreate.itineraryBuilder.unassignedPool")}</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              {t("tripCreate.itineraryBuilder.unassignedCount", {
                count: unassignedPlaces.length
              })}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 max-h-[460px] overflow-y-auto">
            {unassignedPlaces.length === 0 ? (
              <div className="text-center py-6 px-3 text-slate-400 space-y-1">
                <p className="text-xs font-semibold">{t("tripCreate.itineraryBuilder.allAssigned")}</p>
                <p className="text-[11px]">{t("tripCreate.itineraryBuilder.allAssignedHint")}</p>
              </div>
            ) : (
              unassignedPlaces.map((place) => {
                const placeId = place.osmId || place.id;
                return (
                  <div
                    key={placeId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {place.image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {place.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate">
                          {place.location || place.address || "Địa điểm"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddPlaceToActiveDay(placeId)}
                        className="px-2.5 py-1.5 bg-[#002d5b] dark:bg-sky-500 text-white dark:text-slate-950 rounded-lg text-[11px] font-bold hover:bg-[#001f3b] dark:hover:bg-sky-600 transition-colors cursor-pointer"
                        title={t("tripCreate.itineraryBuilder.addToDayBtn", { day: activeDay })}
                      >
                        {t("tripCreate.itineraryBuilder.addToDayBtn", { day: activeDay })}
                      </button>

                      {onRemovePlaceFromList && (
                        <button
                          type="button"
                          onClick={() => onRemovePlaceFromList(placeId)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer text-xs"
                          title={t("tripCreate.itineraryBuilder.removeFromTrip")}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Button to add more places by browsing */}
            <button
              type="button"
              onClick={onAddMorePlaces}
              className="w-full py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t("tripCreate.itineraryBuilder.addMorePlaces")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
