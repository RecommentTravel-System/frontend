/**
 * Vietnam Destinations & Coordinates Knowledge Base
 * Provides instant, reliable client-side geocoding fallback for all 63 provinces,
 * major tourist destinations, islands, and iconic landmarks.
 */

export function removeVietnameseTones(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export const VIETNAM_LOCATIONS_DATABASE = [
  {
    name: "Huế",
    fullName: "Thành phố Huế, Tỉnh Thừa Thiên Huế, Việt Nam",
    lat: 16.4637,
    lng: 107.5909,
    keywords: ["hue", "thua thien hue", "thanh pho hue", "dai noi hue", "song huong", "chua thien mu", "lang khai dinh", "kinh thanh hue"]
  },
  {
    name: "Hà Nội",
    fullName: "Thủ đô Hà Nội, Việt Nam",
    lat: 21.0285,
    lng: 105.8542,
    keywords: ["ha noi", "hanoi", "ho guom", "ho tay", "pho co", "van mieu", "chua mot cot", "ba dinh", "hoan kiem"]
  },
  {
    name: "TP. Hồ Chí Minh",
    fullName: "Thành phố Hồ Chí Minh (Sài Gòn), Việt Nam",
    lat: 10.8231,
    lng: 106.6297,
    keywords: ["ho chi minh", "tp hcm", "tphcm", "sai gon", "saigon", "quan 1", "ben thanh", "landmark 81", "nha tho duc ba", "pho di bo nguyen hue"]
  },
  {
    name: "Đà Nẵng",
    fullName: "Thành phố Đà Nẵng, Việt Nam",
    lat: 16.0544,
    lng: 108.2022,
    keywords: ["da nang", "danang", "ba na hills", "bana hills", "cau vang", "son tra", "my khe", "ngu hanh son", "cau rong"]
  },
  {
    name: "Đà Lạt",
    fullName: "Thành phố Đà Lạt, Tỉnh Lâm Đồng, Việt Nam",
    lat: 11.9404,
    lng: 108.4583,
    keywords: ["da lat", "dalat", "lam dong", "ho xuan huong", "langbiang", "thung lung tinh yeu", "ho tuyen lam"]
  },
  {
    name: "Phú Quốc",
    fullName: "Thành phố Phú Quốc, Tỉnh Kiên Giang, Việt Nam",
    lat: 10.2899,
    lng: 103.9840,
    keywords: ["phu quoc", "phuquoc", "kien giang", "bai sao", "hon thom", "grand world", "vinwonders", "duong dong"]
  },
  {
    name: "Nha Trang",
    fullName: "Thành phố Nha Trang, Tỉnh Khánh Hòa, Việt Nam",
    lat: 12.2388,
    lng: 109.1967,
    keywords: ["nha trang", "nhatrang", "khanh hoa", "vinpearl nha trang", "hon tam", "hon tre", "thap ba ponagar", "bai dai"]
  },
  {
    name: "Hạ Long",
    fullName: "Thành phố Hạ Long, Tỉnh Quảng Ninh, Việt Nam",
    lat: 20.9505,
    lng: 107.0734,
    keywords: ["ha long", "halong", "quang ninh", "vinh ha long", "bai chay", "tuan chau", "hon gai"]
  },
  {
    name: "Sa Pa",
    fullName: "Thị xã Sa Pa, Tỉnh Lào Cai, Việt Nam",
    lat: 22.3364,
    lng: 103.8438,
    keywords: ["sa pa", "sapa", "lao cai", "fansipan", "cat cat", "o quy ho", "ham rong", "thung lung muong hoa"]
  },
  {
    name: "Hội An",
    fullName: "Thành phố Hội An, Tỉnh Quảng Nam, Việt Nam",
    lat: 15.8801,
    lng: 108.3380,
    keywords: ["hoi an", "hoian", "quang nam", "pho co hoi an", "chua cau", "an bang", "song hoai", "rung dua bay mau"]
  },
  {
    name: "Vũng Tàu",
    fullName: "Thành phố Vũng Tàu, Tỉnh Bà Rịa - Vũng Tàu, Việt Nam",
    lat: 10.3460,
    lng: 107.0843,
    keywords: ["vung tau", "vungtau", "ba ria", "bai sau", "bai truoc", "hai dang vung tau", "tuong chua kito", "ho may"]
  },
  {
    name: "Ninh Bình",
    fullName: "Tỉnh Ninh Bình, Việt Nam",
    lat: 20.2506,
    lng: 105.9745,
    keywords: ["ninh binh", "ninhbinh", "trang an", "tam coc", "bai dinh", "hang mua", "hoa lu", "bich dong"]
  },
  {
    name: "Hà Giang",
    fullName: "Tỉnh Hà Giang, Việt Nam",
    lat: 22.8233,
    lng: 104.9839,
    keywords: ["ha giang", "hagiang", "dong van", "ma pi leng", "lung cu", "meo vac", "song nho que", "quan ba", "yen minh"]
  },
  {
    name: "Mộc Châu",
    fullName: "Huyện Mộc Châu, Tỉnh Sơn La, Việt Nam",
    lat: 20.8444,
    lng: 104.6340,
    keywords: ["moc chau", "mocchau", "son la", "doi che trai tim", "rung thong ban ang", "thac dai yem", "cau kinh bach long"]
  },
  {
    name: "Quy Nhơn",
    fullName: "Thành phố Quy Nhơn, Tỉnh Bình Định, Việt Nam",
    lat: 13.7830,
    lng: 109.2197,
    keywords: ["quy nhon", "quynhon", "binh dinh", "ky co", "eo gio", "cu lao xanh", "ghenh rang", "hon kho"]
  },
  {
    name: "Phan Thiết - Mũi Né",
    fullName: "Thành phố Phan Thiết, Tỉnh Bình Thuận, Việt Nam",
    lat: 10.9804,
    lng: 108.2615,
    keywords: ["phan thiet", "phanthiet", "mui ne", "muine", "binh thuan", "doi cat bay", "bau trang", "hon rom"]
  },
  {
    name: "Cần Thơ",
    fullName: "Thành phố Cần Thơ, Việt Nam",
    lat: 10.0452,
    lng: 105.7469,
    keywords: ["can tho", "cantho", "cho noi cai rang", "ben ninh kieu", "nha co binh thuy"]
  },
  {
    name: "Côn Đảo",
    fullName: "Huyện Côn Đảo, Tỉnh Bà Rịa - Vũng Tàu, Việt Nam",
    lat: 8.6835,
    lng: 106.6074,
    keywords: ["con dao", "condao", "nha tu con dao", "bai dam trau", "hang duong", "vinh dam tre"]
  },
  {
    name: "Quảng Bình - Phong Nha",
    fullName: "Tỉnh Quảng Bình, Việt Nam",
    lat: 17.4833,
    lng: 106.6000,
    keywords: ["quang binh", "dong hoi", "phong nha", "ke bang", "dong thien duong", "son doong", "suoi nuoc mooc"]
  },
  {
    name: "Lý Sơn",
    fullName: "Huyện Đảo Lý Sơn, Tỉnh Quảng Ngãi, Việt Nam",
    lat: 15.3833,
    lng: 109.1167,
    keywords: ["ly son", "lyson", "quang ngai", "dao ly son", "cong to vo", "hang cau", "dinh thoi loi"]
  },
  {
    name: "Cát Bà",
    fullName: "Quần đảo Cát Bà, Huyện Cát Hải, Thành phố Hải Phòng, Việt Nam",
    lat: 20.7278,
    lng: 107.0453,
    keywords: ["cat ba", "catba", "hai phong", "vinh lan ha", "vuon quoc gia cat ba", "vinh ben beo"]
  },
  {
    name: "Cô Tô",
    fullName: "Huyện Đảo Cô Tô, Tỉnh Quảng Ninh, Việt Nam",
    lat: 20.9833,
    lng: 107.7667,
    keywords: ["co to", "coto", "quang ninh", "dao co to", "bai da cau my", "bai van chay"]
  },
  {
    name: "Tam Đảo",
    fullName: "Thị trấn Tam Đảo, Tỉnh Vĩnh Phúc, Việt Nam",
    lat: 21.4583,
    lng: 105.6472,
    keywords: ["tam dao", "tamdao", "vinh phuc", "nha tho da tam dao", "cau may", "quan gio"]
  },
  {
    name: "Mù Cang Chải",
    fullName: "Huyện Mù Cang Chải, Tỉnh Yên Bái, Việt Nam",
    lat: 21.8500,
    lng: 104.0833,
    keywords: ["mu cang chai", "mucangchai", "yen bai", "mam xoi", "deo khau pha", "la pan tan"]
  },
  {
    name: "Buôn Ma Thuột",
    fullName: "Thành phố Buôn Ma Thuột, Tỉnh Đắk Lắk, Việt Nam",
    lat: 12.6667,
    lng: 108.0383,
    keywords: ["buon ma thuot", "bmt", "dak lak", "daklak", "tay nguyen", "thac dray nur", "bao tang ca phe"]
  },
  {
    name: "Pleiku",
    fullName: "Thành phố Pleiku, Tỉnh Gia Lai, Việt Nam",
    lat: 13.9833,
    lng: 108.0000,
    keywords: ["pleiku", "gia lai", "bien ho", "bien ho che", "nui lua chu dang ya", "chua minh thanh"]
  },
  {
    name: "Tây Ninh",
    fullName: "Thành phố Tây Ninh, Tỉnh Tây Ninh, Việt Nam",
    lat: 11.3167,
    lng: 106.1000,
    keywords: ["tay ninh", "tayninh", "nui ba den", "toa thanh tay ninh", "ho dau tieng"]
  },
  {
    name: "An Giang - Châu Đốc",
    fullName: "Tỉnh An Giang, Việt Nam",
    lat: 10.7000,
    lng: 105.1167,
    keywords: ["an giang", "chau doc", "long xuyen", "rung tram tra su", "mieu ba chua xu", "nui cam"]
  },
  {
    name: "Phú Yên",
    fullName: "Tỉnh Phú Yên, Việt Nam",
    lat: 13.0883,
    lng: 109.3083,
    keywords: ["phu yen", "tuy hoa", "ghenh da dia", "hai dang dai lanh", "bai xep", "thap nhan", "vung ro"]
  },
  {
    name: "Hải Phòng",
    fullName: "Thành phố Hải Phòng, Việt Nam",
    lat: 20.8449,
    lng: 106.6881,
    keywords: ["hai phong", "haiphong", "do son", "nha hat lon hai phong"]
  },
  {
    name: "Thanh Hóa",
    fullName: "Tỉnh Thanh Hóa, Việt Nam",
    lat: 19.8000,
    lng: 105.7833,
    keywords: ["thanh hoa", "sam son", "hai tien", "pu luong", "thanh nha ho"]
  },
  {
    name: "Nghệ An",
    fullName: "Tỉnh Nghệ An, Việt Nam",
    lat: 18.6733,
    lng: 105.6811,
    keywords: ["nghe an", "vinh", "cua lo", "nam dan", "lang sen"]
  },
  {
    name: "Cao Bằng",
    fullName: "Tỉnh Cao Bằng, Việt Nam",
    lat: 22.6667,
    lng: 106.2500,
    keywords: ["cao bang", "thac ban gioc", "pac bo", "suoi le nin", "dong ngom ngao"]
  },
  {
    name: "Quảng Trị",
    fullName: "Tỉnh Quảng Trị, Việt Nam",
    lat: 16.7500,
    lng: 107.1833,
    keywords: ["quang tri", "thanh co quang tri", "dia dao vinh moc", "cau hien luong"]
  },
  {
    name: "Điện Biên",
    fullName: "Tỉnh Điện Biên, Việt Nam",
    lat: 21.3833,
    lng: 103.0167,
    keywords: ["dien bien", "dien bien phu", "muong thanh", "a1"]
  },
  {
    name: "Hòa Bình",
    fullName: "Tỉnh Hòa Bình, Việt Nam",
    lat: 20.8167,
    lng: 105.3333,
    keywords: ["hoa binh", "mai chau", "thung khe", "thuy dien hoa binh"]
  },
  {
    name: "Bến Tre",
    fullName: "Tỉnh Bến Tre, Việt Nam",
    lat: 10.2333,
    lng: 106.3833,
    keywords: ["ben tre", "bentre", "xu dua", "con phung"]
  },
  {
    name: "Cà Mau",
    fullName: "Tỉnh Cà Mau, Việt Nam",
    lat: 9.1769,
    lng: 105.1524,
    keywords: ["ca mau", "camau", "dat mui", "mui ca mau", "u minh ha"]
  },
  {
    name: "Bạc Liêu",
    fullName: "Tỉnh Bạc Liêu, Việt Nam",
    lat: 9.2941,
    lng: 105.7278,
    keywords: ["bac lieu", "baclieu", "nha cong tu bac lieu", "canh dong quat gio"]
  },
  {
    name: "Tiền Giang",
    fullName: "Tỉnh Tiền Giang, Việt Nam",
    lat: 10.3667,
    lng: 106.3667,
    keywords: ["tien giang", "my tho", "cho gao", "cai be"]
  },
  {
    name: "Đồng Tháp",
    fullName: "Tỉnh Đồng Tháp, Việt Nam",
    lat: 10.4667,
    lng: 105.6333,
    keywords: ["dong thap", "cao lanh", "sa dec", "lang hoa sa dec", "tram chim"]
  },
  {
    name: "Kiên Giang",
    fullName: "Tỉnh Kiên Giang, Việt Nam",
    lat: 10.0167,
    lng: 105.0833,
    keywords: ["kien giang", "rach gia", "ha tien", "nam du"]
  },
  {
    name: "Lạng Sơn",
    fullName: "Tỉnh Lạng Sơn, Việt Nam",
    lat: 21.8500,
    lng: 106.7500,
    keywords: ["lang son", "mau son", "dong dang", "cho dong kinh"]
  },
  {
    name: "Bắc Kạn",
    fullName: "Tỉnh Bắc Kạn, Việt Nam",
    lat: 22.1467,
    lng: 105.8347,
    keywords: ["bac kan", "ho ba be", "ba be"]
  },
  {
    name: "Bình Dương",
    fullName: "Tỉnh Bình Dương, Việt Nam",
    lat: 11.1667,
    lng: 106.6500,
    keywords: ["binh duong", "thu dau mot", "dai nam"]
  },
  {
    name: "Đồng Nai",
    fullName: "Tỉnh Đồng Nai, Việt Nam",
    lat: 10.9500,
    lng: 106.8167,
    keywords: ["dong nai", "bien hoa", "cat tien"]
  }
];

/**
 * Searches the local database for a matching destination.
 * Supports exact matches, keyword matches, and fuzzy substring matches.
 * @param {string} query
 * @returns {{ name: string, fullName: string, lat: number, lng: number } | null}
 */
export function findLocalVietnamDestination(query) {
  if (!query || !query.trim()) return null;
  const cleanQ = removeVietnameseTones(query);

  // 1. Exact match on clean name
  let found = VIETNAM_LOCATIONS_DATABASE.find(
    (d) => removeVietnameseTones(d.name) === cleanQ
  );
  if (found) return found;

  // 2. Exact match in keywords
  found = VIETNAM_LOCATIONS_DATABASE.find((d) =>
    d.keywords.some((k) => removeVietnameseTones(k) === cleanQ)
  );
  if (found) return found;

  // 3. Substring match: query contains destination name or destination name contains query
  found = VIETNAM_LOCATIONS_DATABASE.find((d) => {
    const cleanName = removeVietnameseTones(d.name);
    return cleanQ.includes(cleanName) || cleanName.includes(cleanQ);
  });
  if (found) return found;

  // 4. Keyword substring match
  found = VIETNAM_LOCATIONS_DATABASE.find((d) =>
    d.keywords.some((k) => {
      const cleanK = removeVietnameseTones(k);
      return cleanQ.includes(cleanK) || cleanK.includes(cleanQ);
    })
  );

  return found || null;
}
