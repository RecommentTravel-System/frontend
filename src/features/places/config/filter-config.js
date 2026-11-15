/**
 * @typedef {Object} FilterPreferenceOption
 * @property {string} id - Unique identifier
 * @property {string} labelKey - i18n translation key
 * @property {string} defaultLabel - Default fallback label (Vietnamese)
 * @property {("cuisine" | "keyword" | "category")} targetField - Target field in backend request
 * @property {string} value - Value sent to backend
 * @property {boolean} [isFutureFeature] - True if OSM/backend has partial/limited data support
 */

/**
 * @typedef {Object} CategoryFilterConfig
 * @property {string} categoryId - Category identifier (matches backend or UI)
 * @property {string} backendCategory - Category mapped to Spring Boot backend
 * @property {string} labelKey - i18n translation key
 * @property {string} defaultLabel - Default fallback label
 * @property {FilterPreferenceOption[]} preferences - Dynamic category-specific preferences
 */

/**
 * Configuration for all categories and their dynamic preferences.
 * When adding a new category in the future, simply add an entry here
 * without modifying any UI component!
 *
 * @type {Record<string, CategoryFilterConfig>}
 */
export const CATEGORY_FILTER_CONFIGS = {
  RESTAURANT: {
    categoryId: "RESTAURANT",
    backendCategory: "RESTAURANT",
    labelKey: "places.categories.restaurant",
    defaultLabel: "Quán ăn / Nhà hàng",
    preferences: [
      {
        id: "vietnamese",
        labelKey: "places.preferences.vietnamese",
        defaultLabel: "Món Việt",
        targetField: "cuisine",
        value: "vietnamese"
      },
      {
        id: "korean",
        labelKey: "places.preferences.korean",
        defaultLabel: "Món Hàn",
        targetField: "cuisine",
        value: "korean"
      },
      {
        id: "japanese",
        labelKey: "places.preferences.japanese",
        defaultLabel: "Món Nhật",
        targetField: "cuisine",
        value: "japanese"
      },
      {
        id: "fast_food",
        labelKey: "places.preferences.fastFood",
        defaultLabel: "Thức ăn nhanh",
        targetField: "cuisine",
        value: "fast_food"
      },
      {
        id: "vegetarian",
        labelKey: "places.preferences.vegetarian",
        defaultLabel: "Món chay / Thuần chay",
        targetField: "cuisine",
        value: "vegetarian"
      },
      {
        id: "family_friendly",
        labelKey: "places.preferences.familyFriendly",
        defaultLabel: "Gia đình thân thiện",
        targetField: "keyword",
        value: "family",
        isFutureFeature: false
      },
      {
        id: "romantic",
        labelKey: "places.preferences.romantic",
        defaultLabel: "Hẹn hò / Lãng mạn",
        targetField: "keyword",
        value: "romantic",
        isFutureFeature: true
      }
    ]
  },
  CAFE: {
    categoryId: "CAFE",
    backendCategory: "CAFE",
    labelKey: "places.categories.cafe",
    defaultLabel: "Quán cà phê",
    preferences: [
      {
        id: "quiet",
        labelKey: "places.preferences.quiet",
        defaultLabel: "Yên tĩnh",
        targetField: "keyword",
        value: "quiet"
      },
      {
        id: "study_work",
        labelKey: "places.preferences.studyWork",
        defaultLabel: "Học bài & Làm việc",
        targetField: "keyword",
        value: "work"
      },
      {
        id: "outdoor",
        labelKey: "places.preferences.outdoor",
        defaultLabel: "Không gian mở / Ngoài trời",
        targetField: "keyword",
        value: "outdoor"
      },
      {
        id: "pet_friendly",
        labelKey: "places.preferences.petFriendly",
        defaultLabel: "Thú cưng thân thiện",
        targetField: "keyword",
        value: "pet",
        isFutureFeature: true
      },
      {
        id: "checkin",
        labelKey: "places.preferences.checkIn",
        defaultLabel: "Check-in sống ảo",
        targetField: "keyword",
        value: "coffee"
      }
    ]
  },
  ENTERTAINMENT: {
    categoryId: "ENTERTAINMENT",
    backendCategory: "BAR", // Map to OSM leisure/bar or entertainment
    labelKey: "places.categories.entertainment",
    defaultLabel: "Khu vui chơi / Giải trí",
    preferences: [
      {
        id: "indoor",
        labelKey: "places.preferences.indoor",
        defaultLabel: "Trong nhà",
        targetField: "keyword",
        value: "indoor"
      },
      {
        id: "outdoor_activity",
        labelKey: "places.preferences.outdoor",
        defaultLabel: "Ngoài trời",
        targetField: "keyword",
        value: "outdoor"
      },
      {
        id: "family_ent",
        labelKey: "places.preferences.familyFriendly",
        defaultLabel: "Gia đình",
        targetField: "keyword",
        value: "family"
      },
      {
        id: "group_activity",
        labelKey: "places.preferences.groupActivity",
        defaultLabel: "Hoạt động nhóm",
        targetField: "keyword",
        value: "group"
      },
      {
        id: "night_life",
        labelKey: "places.preferences.nightLife",
        defaultLabel: "Hoạt động về đêm",
        targetField: "keyword",
        value: "night"
      }
    ]
  },
  ATTRACTION: {
    categoryId: "ATTRACTION",
    backendCategory: "ATTRACTION",
    labelKey: "places.categories.attraction",
    defaultLabel: "Điểm tham quan",
    preferences: [
      {
        id: "historical",
        labelKey: "places.preferences.historical",
        defaultLabel: "Di tích lịch sử",
        targetField: "keyword",
        value: "historical"
      },
      {
        id: "cultural",
        labelKey: "places.preferences.cultural",
        defaultLabel: "Văn hóa & Nghệ thuật",
        targetField: "keyword",
        value: "museum"
      },
      {
        id: "nature_outdoor",
        labelKey: "places.preferences.nature",
        defaultLabel: "Thiên nhiên & Công viên",
        targetField: "keyword",
        value: "park"
      },
      {
        id: "family_sightseeing",
        labelKey: "places.preferences.familySightseeing",
        defaultLabel: "Phù hợp gia đình",
        targetField: "keyword",
        value: "family"
      }
    ]
  },
  SHOPPING: {
    categoryId: "SHOPPING",
    backendCategory: "SHOPPING",
    labelKey: "places.categories.shopping",
    defaultLabel: "Mua sắm",
    preferences: [
      {
        id: "mall",
        labelKey: "places.preferences.mall",
        defaultLabel: "Trung tâm thương mại",
        targetField: "keyword",
        value: "mall"
      },
      {
        id: "supermarket",
        labelKey: "places.preferences.supermarket",
        defaultLabel: "Siêu thị & Cửa hàng tiện lợi",
        targetField: "keyword",
        value: "supermarket"
      },
      {
        id: "souvenirs",
        labelKey: "places.preferences.souvenirs",
        defaultLabel: "Đặc sản & Quà lưu niệm",
        targetField: "keyword",
        value: "souvenir"
      }
    ]
  }
};

/**
 * Common filter constants
 */
export const COMMON_FILTER_DEFAULTS = {
  category: "RESTAURANT",
  distanceKm: 2.0, // 2000 meters default
  minRating: null, // null = any
  priceLevel: null, // null = any
  keyword: "",
  selectedPreferences: []
};

export const DISTANCE_OPTIONS = {
  min: 0.5,
  max: 10,
  step: 0.5,
  defaultVal: 2.0
};

export const RATING_OPTIONS = [
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
  { value: 3.5, label: "3.5+" },
  { value: 3.0, label: "3.0+" }
];

export const PRICE_OPTIONS = [
  { value: "$", label: "$", descKey: "places.price.budget" },
  { value: "$$", label: "$$", descKey: "places.price.moderate" },
  { value: "$$$", label: "$$$", descKey: "places.price.expensive" },
  { value: "$$$$", label: "$$$$", descKey: "places.price.luxury" }
];
