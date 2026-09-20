import { useState, useRef, useEffect } from "react";
import { useTranslation } from "~/providers/i18n-provider";

export function DateRangePicker({
  startDate = null,
  endDate = null,
  onChange,
  className = "",
  startPlaceholder = "DD/MM/YYYY",
  endPlaceholder = "DD/MM/YYYY",
  checkInLabel = "Ngày đi",
  checkOutLabel = "Ngày về",
  dateFormat = "DD/MM/YYYY" // "DD/MM/YYYY" | "MM/DD/YYYY"
}) {
  const { language } = useTranslation();
  const [activePicker, setActivePicker] = useState(null); // null | "start" | "end"
  const [internalStart, setInternalStart] = useState(() => (startDate ? new Date(startDate) : null));
  const [internalEnd, setInternalEnd] = useState(() => (endDate ? new Date(endDate) : null));
  const [hoverDate, setHoverDate] = useState(null);

  // Month view for the single calendar
  const [viewDate, setViewDate] = useState(() => {
    if (startDate) return new Date(startDate);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const pickerRef = useRef(null);

  // Sync with props
  useEffect(() => {
    if (startDate) setInternalStart(new Date(startDate));
    if (endDate) setInternalEnd(new Date(endDate));
  }, [startDate, endDate]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setActivePicker(null);
      }
    };
    if (activePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePicker]);

  const formatDateString = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    if (dateFormat === "MM/DD/YYYY") {
      return `${month}/${day}/${year}`;
    }
    return `${day}/${month}/${year}`;
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateBetween = (date, start, end) => {
    if (!date || !start || !end) return false;
    const time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return time > startTime && time < endTime;
  };

  const handleDateClick = (clickedDate) => {
    if (activePicker === "start") {
      // Pick start date
      setInternalStart(clickedDate);
      // If end date exists and is before start date, reset end date
      let newEnd = internalEnd;
      if (internalEnd && clickedDate.getTime() > internalEnd.getTime()) {
        newEnd = null;
        setInternalEnd(null);
      }

      if (onChange) {
        onChange({
          startDate: clickedDate,
          endDate: newEnd,
          formattedStart: formatDateString(clickedDate),
          formattedEnd: formatDateString(newEnd),
          rangeString: newEnd
            ? `${formatDateString(clickedDate)} - ${formatDateString(newEnd)}`
            : formatDateString(clickedDate)
        });
      }
      // Automatically open end date picker for smooth UX
      setActivePicker("end");
      // Advance view date if end date is in next month
      if (newEnd) {
        setViewDate(new Date(newEnd.getFullYear(), newEnd.getMonth(), 1));
      }
    } else if (activePicker === "end") {
      // Pick end date
      if (internalStart && clickedDate.getTime() < internalStart.getTime()) {
        // If clicked date is earlier than start date, treat as new start date
        setInternalStart(clickedDate);
        setInternalEnd(null);
        if (onChange) {
          onChange({
            startDate: clickedDate,
            endDate: null,
            formattedStart: formatDateString(clickedDate),
            formattedEnd: "",
            rangeString: formatDateString(clickedDate)
          });
        }
      } else {
        setInternalEnd(clickedDate);
        setActivePicker(null);
        if (onChange) {
          onChange({
            startDate: internalStart,
            endDate: clickedDate,
            formattedStart: formatDateString(internalStart),
            formattedEnd: formatDateString(clickedDate),
            rangeString: internalStart
              ? `${formatDateString(internalStart)} - ${formatDateString(clickedDate)}`
              : formatDateString(clickedDate)
          });
        }
      }
    }
  };

  // Render single month calendar
  const renderSingleMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Monday-first offset: 0 for Monday, 6 for Sunday
    const startDayIndex = (firstDay.getDay() + 6) % 7;

    const monthNamesVi = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    const monthNamesEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthNames = language === "en" ? monthNamesEn : monthNamesVi;
    const weekDays = language === "en" ? ["M", "T", "W", "T", "F", "S", "S"] : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const days = [];
    for (let i = 0; i < startDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }

    return (
      <div className="w-[280px] sm:w-[300px]">
        {/* Month Header with Prev / Next */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Tháng trước"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="font-bold text-sm text-slate-900 dark:text-white">
            {monthNames[month]} <span className="font-semibold text-slate-600 dark:text-slate-400 ml-1.5">{year}</span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Tháng sau"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Week Days Row */}
        <div className="grid grid-cols-7 text-center mb-1.5">
          {weekDays.map((wd, i) => (
            <div key={i} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Days Grid - Clean day numbers without prices */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="h-9 w-full" />;
            }

            const isStart = isSameDay(date, internalStart);
            const isEnd = isSameDay(date, internalEnd);
            const effectiveEnd =
              internalEnd ||
              (activePicker === "end" && internalStart && hoverDate && hoverDate > internalStart ? hoverDate : null);
            const isInRange = internalStart && effectiveEnd && isDateBetween(date, internalStart, effectiveEnd);

            let cellClass = "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg";

            if (isStart && isEnd) {
              cellClass = "bg-[#0b2545] dark:bg-sky-500 text-white font-bold rounded-lg shadow-xs";
            } else if (isStart) {
              cellClass = "bg-[#0b2545] dark:bg-sky-500 text-white font-bold rounded-l-lg";
            } else if (isEnd) {
              cellClass = "bg-[#0b2545] dark:bg-sky-500 text-white font-bold rounded-r-lg";
            } else if (isInRange) {
              cellClass = "bg-[#e0f2fe] dark:bg-sky-950/70 text-[#0b2545] dark:text-sky-200 font-semibold";
            }

            return (
              <button
                key={date.toISOString()}
                type="button"
                className={`h-9 w-full flex items-center justify-center text-xs transition-colors cursor-pointer font-medium ${cellClass}`}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => {
                  if (internalStart && !internalEnd) {
                    setHoverDate(date);
                  }
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Action helper footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {activePicker === "start" ? "Chọn ngày đi" : "Chọn ngày về"}
          </span>
          <button
            type="button"
            onClick={() => setActivePicker(null)}
            className="text-[#0b2545] dark:text-sky-400 font-bold hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  };

  return (
    <div ref={pickerRef} className={`relative select-none ${className}`}>
      {/* 2 Field Triggers: Check-in & Check-out */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-slate-800 h-full">
        {/* Check-in Trigger */}
        <div
          onClick={() => {
            if (internalStart) {
              setViewDate(new Date(internalStart.getFullYear(), internalStart.getMonth(), 1));
            }
            setActivePicker((prev) => (prev === "start" ? null : "start"));
          }}
          className={`px-4 py-3 cursor-pointer transition-colors h-full flex flex-col justify-center ${
            activePicker === "start"
              ? "bg-sky-50/50 dark:bg-slate-800/60"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
            <svg
              className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[11px] font-bold tracking-tight text-slate-600 dark:text-slate-300">
              {checkInLabel}
            </span>
            <svg className="w-3 h-3 text-slate-400 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {internalStart ? formatDateString(internalStart) : startPlaceholder}
          </p>
        </div>

        {/* Check-out Trigger */}
        <div
          onClick={() => {
            if (internalEnd) {
              setViewDate(new Date(internalEnd.getFullYear(), internalEnd.getMonth(), 1));
            } else if (internalStart) {
              setViewDate(new Date(internalStart.getFullYear(), internalStart.getMonth(), 1));
            }
            setActivePicker((prev) => (prev === "end" ? null : "end"));
          }}
          className={`px-4 py-3 cursor-pointer transition-colors h-full flex flex-col justify-center ${
            activePicker === "end"
              ? "bg-sky-50/50 dark:bg-slate-800/60"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
            <svg
              className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[11px] font-bold tracking-tight text-slate-600 dark:text-slate-300">
              {checkOutLabel}
            </span>
            <svg className="w-3 h-3 text-slate-400 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {internalEnd ? formatDateString(internalEnd) : endPlaceholder}
          </p>
        </div>
      </div>

      {/* Single Month Popover Calendar */}
      {activePicker && (
        <div
          className={`absolute top-full mt-2 bg-white dark:bg-[#111a2e] rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            activePicker === "start" ? "left-0" : "left-0 sm:left-1/2"
          }`}
        >
          {renderSingleMonth()}
        </div>
      )}
    </div>
  );
}
