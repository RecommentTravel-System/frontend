import { useState } from "react";
import { Pill } from "~/shared/ui/pill";
import { useTranslation } from "~/providers/i18n-provider";

export function PlacesCategoryBar({ onSelectCategory }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState("ALL");

  const categories = [
    { id: "ALL", label: t("allPlaces") },
    { id: "RESTAURANT", label: t("restaurants") },
    { id: "CAFE", label: t("cafes") },
    { id: "ENTERTAINMENT", label: t("entertainment") },
    { id: "ATTRACTION", label: t("attractions") },
    { id: "SHOPPING", label: t("shopping") },
    { id: "OTHER", label: t("other") }
  ];

  const handleSelect = (id) => {
    setSelected(id);
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
      {categories.map((cat) => (
        <Pill key={cat.id} active={cat.id === selected} onClick={() => handleSelect(cat.id)}>
          {cat.label}
        </Pill>
      ))}
    </div>
  );
}
