import { useTranslation } from "~/providers/i18n-provider";

export function SavedLocationsSummary({
  destination,
  placesList,
  onCreateItineraryNow,
  onExploreMore,
  onRemovePlace
}) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="saved-locations-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-6"
    >
      {/* Success Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
            🎉
          </div>
          <div>
            <h3
              id="saved-locations-heading"
              className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200"
            >
              {t("tripCreate.savedLocations.badge")}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium mt-0.5">
              {t("tripCreate.savedLocations.message", {
                count: placesList.length,
                destination: destination || "điểm đến"
              })}
            </p>
          </div>
        </div>

        {/* Quick CTA to switch to Itinerary Builder */}
        <button
          type="button"
          onClick={onCreateItineraryNow}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          {t("tripCreate.savedLocations.createItineraryNow")}
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t("tripCreate.savedLocations.subtitle")}
      </p>

      {/* Places List Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {t("tripCreate.savedLocations.placesCount", { count: placesList.length })}
        </h4>

        {placesList.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <p className="text-xs text-slate-500">{t("tripCreate.savedLocations.noPlaces")}</p>
            <button
              type="button"
              onClick={onExploreMore}
              className="text-xs text-[#002d5b] dark:text-sky-400 font-bold hover:underline cursor-pointer"
            >
              {t("tripCreate.savedLocations.exploreNow")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {placesList.map((place) => {
              const placeId = place.osmId || place.id;
              return (
                <div
                  key={placeId}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {place.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {place.name}
                        </h5>
                        {place.rating && (
                          <span className="text-[10px] text-amber-500 font-bold shrink-0">
                            ★ {place.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {place.location || place.address || "Địa điểm"}
                      </p>
                    </div>
                  </div>

                  {onRemovePlace && (
                    <button
                      type="button"
                      onClick={() => onRemovePlace(placeId)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs shrink-0"
                      title="Xóa địa điểm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExploreMore}
          className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>🔍</span>
          <span>{t("tripCreate.savedLocations.exploreMore")}</span>
        </button>

        <button
          type="button"
          onClick={onCreateItineraryNow}
          className="px-5 py-2.5 bg-gradient-to-r from-[#002d54] to-sky-700 dark:from-sky-500 dark:to-sky-600 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>✨</span>
          <span>{t("tripCreate.savedLocations.createItineraryNow")}</span>
        </button>
      </div>
    </section>
  );
}
