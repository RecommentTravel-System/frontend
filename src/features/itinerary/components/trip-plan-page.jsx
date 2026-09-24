import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import { LocationMapModal } from "./location-map-modal";

const INITIAL_DAYS = [
  {
    dayId: "day-1",
    dayNum: 1,
    dayLabelVi: "Ngày 1 (14 Thg 8)",
    dayLabelEn: "Day 1 (Aug 14)",
    titleVi: "Phố Cổ & Check-in Cà phê",
    titleEn: "Old Quarter & Coffee Check-in",
    items: [
      {
        id: "d1-1",
        name: "Cộng Cà Phê Nhà Thờ",
        category: "coffee",
        categoryVi: "Cà phê",
        categoryEn: "Coffee",
        categoryColor: "bg-amber-50 text-amber-700 border-amber-200",
        barColor: "bg-amber-500",
        rating: 4.8,
        reviewsCount: "1,120",
        address: "27 Nhà Thờ, Hoàn Kiếm",
        tagVi: "Ghi chú",
        tagEn: "Notes",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDubrmT6I6G76VzNEsQTpx3ruw3s_1pXTpTCgcdi6NFXIi0LfVD-xywPD8zQXY5ZPCwZ0dR2Zc6qCOHEAc-dBNhg2pVZqDAF5tw9UGTVmG6cXbN6nk9v4YbOSxxatTlRWVLfxi29jgDF9XC4aq2wGU5ajWXX6BK5_9f_5N4gGU7k_Pt3BLr5uMI7E3C800MX65XYlMqSgBwDTWDiOWCcmBN8W4ekvmsmvbX_XYSWdc"
      },
      {
        id: "d1-2",
        name: "Nhà Thờ Lớn Hà Nội",
        category: "checkin",
        categoryVi: "Check-in",
        categoryEn: "Check-in",
        categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-500",
        rating: 4.9,
        reviewsCount: "4,500",
        address: "Hàng Trống, Hoàn Kiếm",
        tagVi: "Chụp ảnh kỷ niệm",
        tagEn: "Photo Spot",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAmbrUUkMXROP3mGEUUOi8_lWTi19bKO3PtxhEgMjk70OqqVKX48XWbKaoDFfRITBCWj5XYyYCM1QT9yuJWAjOZ9Mh9KWXj1n1xN0O0XUwJtkU9DMjqk84wouh7NIEa3gjNa4cMKEipuSYqdwnNz0rmu9fJv71k_mkeKZb0g4WfI9M0261IdlvyhcP2XKolmLtxzZsDp1MLcic9OTHR8b8bhEk8q13XRsqhdwYAMrg"
      },
      {
        id: "d1-3",
        name: "Bún Chả Hương Liên",
        category: "food",
        categoryVi: "Ẩm thực",
        categoryEn: "Food",
        categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        barColor: "bg-emerald-500",
        rating: 4.6,
        reviewsCount: "Bún Chả Obama",
        address: "24 Lê Văn Hưu, Hai Bà Trưng",
        tagVi: "Đã đặt bàn 12h",
        tagEn: "Booked 12:00",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCiiuQ2wsuR0njNGC8aEPWZn2HEUm7eDWlkrIFZ62t2IEJ5QgGny81oLlHFPPnZ2GcQq2TzhR5YHeOva4-9Q8Ph6ekhGbtAt59HhHu_HHjJkEiCJ2aPzGPFbhg1TfPEuKRLaWpI0GV4Hm0M7Zbox_nnD9w6vsekXcxa_UGWEj4k1k-0UrZ9Vx0W_DKok9UPSjAAmgtBWcfw7cZ3zd7VSrDK-8uqL5h0wFk4nYRP2J0"
      }
    ]
  },
  {
    dayId: "day-2",
    dayNum: 2,
    dayLabelVi: "Ngày 2 (15 Thg 8)",
    dayLabelEn: "Day 2 (Aug 15)",
    titleVi: "Văn hóa & Lịch sử Thủ Đô",
    titleEn: "Culture & Capital History",
    items: [
      {
        id: "d2-1",
        name: "Lăng Bác & Ba Đình",
        category: "culture",
        categoryVi: "Văn hóa",
        categoryEn: "Culture",
        categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-500",
        rating: 4.9,
        reviewsCount: "12,000+",
        address: "Số 2 Hùng Vương, Ba Đình",
        tagVi: "Đến sớm xem lễ đổi gác",
        tagEn: "Guard change ceremony",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD1GUjDo_Yuq9J22vlCLsz0ggPVTjYqk_8O6No1rOzdTpmWXq6vbzxk7F-n5naZiM8giseBPmTbsKJQ5tsAN6Bt0bL0AYDlqYYWfwKzVNpVF3UqwRPCeG1_tZ1uJDDEDrmlMCYC9mv3wsGdLAIrNUqvI7bcwuWGIGP1E1fFcHDlcxeu2ndibpei06uDoUBWAwCHumy4PliVI6yxig2_RiEL4HUZ6jCkuDcVamLEmRw"
      },
      {
        id: "d2-2",
        name: "Hoàng Thành Thăng Long",
        category: "culture",
        categoryVi: "Di tích",
        categoryEn: "Heritage",
        categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-500",
        rating: 4.7,
        reviewsCount: "3,200",
        address: "19C Hoàng Diệu, Quán Thánh",
        tagVi: "Check-in đường Hoàng Diệu",
        tagEn: "Hoang Dieu street walk",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAvv4bC3x_Ylsn7UBZgU7XB5DnwtuUKpSyBULC4Ftqq3o77LJK2AmagO-s9rFjg9JMSN8chQRCpE2lpOO8cs2fgHRjnaka7h5KX3WKvyTOaqh6lEE-rNYBI3ApYwKIaHfrPtPsNFpVMHsmp1kGo1Q8XJWmoMYfUZmWbY-TVPDZlydCJUrcMykYxrEAW5SLwuREjVmwQJhCOXsSOCuH3qB3F2lo5Kg3-Az7okmWUMMk"
      },
      {
        id: "d2-3",
        name: "Phố Cà Phê Đường Tàu",
        category: "checkin",
        categoryVi: "Check-in",
        categoryEn: "Check-in",
        categoryColor: "bg-amber-50 text-amber-700 border-amber-200",
        barColor: "bg-amber-500",
        rating: 4.8,
        reviewsCount: "Train Street",
        address: "Trần Phú / Phùng Hưng",
        tagVi: "Ngắm hoàng hôn tàu hỏa",
        tagEn: "Train sunset view",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB70E5HfPU8ywR6ZNEqbDdYkWOfNND-avIU-t11sHtQqEHvRqG0UJUina5VtlXczlJVDPDEvFfv9G1BuLbNc35dmmq6LYxh_sXA8noFWyDs4aDnQRkRuo34-eALVEKL66B_8tsrLkMCUE0T3XHG9J2b3xbm06R6rexV2EaatUHu-EwBFnEq-J9LOjGukGhQ4bVAkB4nCDfbfm3QXSwZzM0rhS-2WsVtj-MUYnBMuvY"
      },
      {
        id: "d2-4",
        name: "Chả Cá Thăng Long",
        category: "food",
        categoryVi: "Ẩm thực",
        categoryEn: "Food",
        categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        barColor: "bg-emerald-500",
        rating: 4.7,
        reviewsCount: "2,800",
        address: "6B Đường Thành, Cửa Đông",
        tagVi: "Khuyên dùng mắm tôm",
        tagEn: "Recommended with shrimp paste",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDsZfWuD9sO9UGcj-kA2oMRIGvzPlJLSMxvzGOfZpLTE7FhvI1OwV6iCoy2wBNk6JGQ6MWG4YmXiKUjfpTZnn6_bOoXs3V-RKvZNGmcCuWUmoOSx79jZTodSouJ_QJq8BQJgcBY2h2vvmu5QDwl27SC98Y0VFQvgjdL8Hmdq_TlqcPPEpn8dT4lEDOCyKHDHTTB_6-KHX7o2JO0GzXHkN1iJjz9LYPZlGknItgZj2M"
      }
    ]
  },
  {
    dayId: "day-3",
    dayNum: 3,
    dayLabelVi: "Ngày 3 (16 Thg 8)",
    dayLabelEn: "Day 3 (Aug 16)",
    titleVi: "Hồ Tây & Hoàng hôn lãng mạn",
    titleEn: "West Lake & Romantic Sunset",
    items: [
      {
        id: "d3-1",
        name: "Chùa Trấn Quốc",
        category: "culture",
        categoryVi: "Văn hóa",
        categoryEn: "Culture",
        categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-500",
        rating: 4.8,
        reviewsCount: "Trấn Quốc Pagoda",
        address: "Đường Thanh Niên, Yên Phụ",
        tagVi: "Cây bồ đề ngàn năm",
        tagEn: "Ancient Bodhi Tree",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAoBAmA2tpJp1vCGnspWpgml1dzrNpXT_jXT9e2ND1sk0Cu0fKD_8k2gau86OhiHirGBIQp-Wf6Vib2cfR9tGS67QMGbnFVDAQ0OVQu9dAO2n1znyqPK9wR5GWhSpHHEMmxa2smqwIBnzT8ybFrg7ghlv6NEVHU6lTfa9QzexXY8byiokoF7YmT3LeGrjxz-H56182zna7hRNAIOjiyUfPTj_8sq4uFMkZTtWrG_Sw"
      },
      {
        id: "d3-2",
        name: "SUP Ngắm Hoàng Hôn",
        category: "checkin",
        categoryVi: "Trải nghiệm",
        categoryEn: "Experience",
        categoryColor: "bg-teal-50 text-teal-700 border-teal-200",
        barColor: "bg-teal-500",
        rating: 4.9,
        reviewsCount: "Hanoi Kayak Club",
        address: "292 Lạc Long Quân, Tây Hồ",
        tagVi: "Đã có áo phao & HDV",
        tagEn: "Lifejacket & guide included",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAzZoB89scjJVg6A66pZgRt3IXx86zpoQGczoMrsGzsDYGyEBe4TXok4iz8mjN03dHFNuNp_z5KJXJ0k82SiWQWRGMNtmuWN25eVFGhYpn_r88RTPoKmhPBmg5tjEPC3BQI05JxNalJpRDfG4Lmmv9PyeFFWDdl65DVsG6mNmmuAXJb-JC2-i9DkNQdqTndW5WmsQIbc1kXgiwOnQ57oasCYAqhXtYuIDkcz1vn3rc"
      },
      {
        id: "d3-3",
        name: "Ốc Nóng & Ăn Vặt Hồ Tây",
        category: "food",
        categoryVi: "Ẩm thực",
        categoryEn: "Food",
        categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        barColor: "bg-emerald-500",
        rating: 4.6,
        reviewsCount: "Bà Già Trích Sài",
        address: "173 Trích Sài, Bưởi, Tây Hồ",
        tagVi: "Bàn view sát mép hồ",
        tagEn: "Lakeside view table",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDceVs92PWGDXydo8X87y9LEF6YXu5DhvAOtKpFOldF1IdeZZFTnwViKOUELh35obilLUmCiK99Qu-y5pFzgpeKFLH7TXmTpQV_qC-uUuIr7NbB9QNeAGcim1hmAB4pEgT42XoHwiTbLVnjs7HJRx7f8VsLSH_oJ79PYOz3G2sn795Otjoe0Zeoy4HfsSwarIg9Bkpog3HhP3XeReaBQArvVvsYNrO_SoUVwx7F2ZE"
      }
    ]
  },
  {
    dayId: "day-4",
    dayNum: 4,
    dayLabelVi: "Ngày 4 (17 Thg 8)",
    dayLabelEn: "Day 4 (Aug 17)",
    titleVi: "Bảo tàng & Nghệ thuật",
    titleEn: "Museums & Arts",
    items: [
      {
        id: "d4-1",
        name: "Bảo Tàng Dân Tộc Học",
        category: "culture",
        categoryVi: "Bảo tàng",
        categoryEn: "Museum",
        categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-500",
        rating: 4.8,
        reviewsCount: "54 Dân tộc",
        address: "Nguyễn Văn Huyên, Cầu Giấy",
        tagVi: "Xem múa rối nước",
        tagEn: "Water puppet show",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBr5BsrYxH2xVtUjhrtei3ZBXMCinH177AfOEMcJyYDdyKeq35jGwMJJpyZjFT78l5lWRTqY8g2u2wJzgyY5C7JTond-VVWQlkccpfKIY2cBC_E5HunWTcvLZYOZX5IF38wkp2UvgRFGPv8v83R3adlUaa9U18VmzOyWXr2XsGebNPVkhWBQAicti1sD7_ew6N9X8D6jfotmnxK7LR5L8Bc7Qq4cWa2tWNb5jj7EHI"
      },
      {
        id: "d4-2",
        name: "Bảo Tàng Mỹ Thuật VN",
        category: "culture",
        categoryVi: "Nghệ thuật",
        categoryEn: "Fine Arts",
        categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-500",
        rating: 4.7,
        reviewsCount: "Fine Arts",
        address: "66 Nguyễn Thái Học, Ba Đình",
        tagVi: "Tranh Thiếu nữ bên hoa huệ",
        tagEn: "Famous oil paintings",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAK9cmfu2ibCznRV0V0-h6OpzkZyPltk06cJAc-eLAPqDAF0F2QoWa-JLX7lRf0_VtAkWfMFLK33-hebn4jaJgUPmpMtJBIc6NSeAcRGxXLH0EwNK4GTm2Fhx0FKPT3OAVkZFXqdL9V7ENMxZGsUD8cRU3eP2-LpTy-ABEbAUEOF4WHPxtl-rdxGaDDYlKpt0c3cZA7nHTgKMsQmZcGHNrOWTjhbplt7oRAWnNAnAs"
      },
      {
        id: "d4-3",
        name: "Nhà Hát Lớn & Kem Tràng Tiền",
        category: "checkin",
        categoryVi: "Check-in",
        categoryEn: "Check-in",
        categoryColor: "bg-amber-50 text-amber-700 border-amber-200",
        barColor: "bg-amber-500",
        rating: 4.9,
        reviewsCount: "Hanoi Opera House",
        address: "01 Tràng Tiền, Phan Chu Trinh",
        tagVi: "Âm nhạc đường phố",
        tagEn: "Street music vibe",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD4XsGqhPQGXo6SK3ra6zs9rqxJ-tVxagIggYJ4MArop7JnmRUCAr_4x12-XJS95BSJa48T6ptzdRzBnu9si1ur6gb-xUb-9aCcmoIp8Hbk_Ahu2VsigoYgs4t8LprhDmcDzyOSkipcpRM9MTTHKCAAjIVi_D55ldNmbHq-DcNz9AP8XsLH0epHYA1Yi2bljG50ICCpBFn6SnsVKokjqZjyxAchnVIqSCW7eD4B6jU"
      }
    ]
  },
  {
    dayId: "day-5",
    dayNum: 5,
    dayLabelVi: "Ngày 5 (18 Thg 8)",
    dayLabelEn: "Day 5 (Aug 18)",
    titleVi: "Quà lưu niệm & Tạm biệt",
    titleEn: "Souvenirs & Departure",
    items: [
      {
        id: "d5-1",
        name: "Ô Mai Tiến Thịnh / Hồng Lam",
        category: "shopping",
        categoryVi: "Mua sắm",
        categoryEn: "Shopping",
        categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        barColor: "bg-emerald-500",
        rating: 4.8,
        reviewsCount: "Đặc sản quà biếu",
        address: "21 Hàng Đường, Hoàn Kiếm",
        tagVi: "Sấu xào gừng, mơ mận",
        tagEn: "Dried fruit specialties",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuApQU2bhUBtx1b0RRrBSzYKNMXxjI1mLzP71BPH64LVxgmgq_4SRTJZHTwpU-PlbFkuh_QLTzRUJa7nOLSL1w_a1tes9l0UTprppAxt7bjKzZYJahs6AMbYH8N6e0VY-1sUlhLe5nS5jO4H4Hk4ILHAke2HZRkdyrQrwuiV8u1xf4bgT5T7lwcyCwmRIdD0_bHtah7J2uFYzRDQvxpLMvtts59pxbTzYKRuLR4UI70"
      },
      {
        id: "d5-2",
        name: "Sân bay Quốc tế Nội Bài",
        category: "flight",
        categoryVi: "Chuyến bay",
        categoryEn: "Flight",
        categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-500",
        rating: 4.8,
        reviewsCount: "VN219 HAN ➔ SGN",
        address: "Nhà ga T1 - Cửa số 4",
        tagVi: "Đã check-in online",
        tagEn: "Online check-in done",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCUc6F5u5ApWbpnGqy9vrRo0JfQ8zc8o3f801p3JZF58410m3UyM0QRXD7IO4avpax_eV8T68dODKYS4AoDygE2sFLrQWXOl0JccH6XlD7KOTflhmXMsFPruZ3Ephmj1kqw8srLGxtwYLV-Gki9E8O0lK0l5Om2BM3u6c16eIbrlXXLIZQjhCPiR3vGWLrl_GO_Pum2S9ywi3AJ8cp2_yu6AkpySYJFmX2RIkon9G0"
      }
    ]
  }
];

const INITIAL_WISHLIST = [
  {
    id: "wish-1",
    name: "Cà Phê Giảng (1946)",
    category: "coffee",
    categoryVi: "Cà phê trứng",
    categoryEn: "Egg Coffee",
    categoryColor: "bg-amber-50 text-amber-700 border-amber-200",
    barColor: "bg-amber-500",
    rating: 4.9,
    reviewsCount: "4,100",
    address: "39 Nguyễn Hữu Huân",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChhjb3QmLl8cCoDFR5sgmHi2ipssQ6mxTfWbYulzTehcYBDky8PVAaQ6WyUqSTYx7gHz6PXbzTfzYiJHIs_NuX2jOG34erWjZ2pW-PzIMhzVt9dZY93pFOY41fgWscblAG837oHT8LkLzNJqaHLbtTYSE7jldtVGeOWQJtpGR0yqcYAB-MsMqFW2uRmznjfxuJC08t7e1kFduClSDuUslcW-My1rdgRQrz5mXs-Kk"
  },
  {
    id: "wish-2",
    name: "Cầu Long Biên Hoàng Hôn",
    category: "checkin",
    categoryVi: "Check-in",
    categoryEn: "Check-in",
    categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
    barColor: "bg-sky-500",
    rating: 4.8,
    reviewsCount: "8,000",
    address: "Cầu Long Biên, Hoàn Kiếm",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBE7Q8u4MrIegx-4iZnFWoMCz-Exgi4GKZ5udUDdOciAlFwU9y2JJBH1Ay5zYVx4tvH3RLXAzpRA0JQTDX7a1nLRxHfktwBUTq3K0RtJiVu-xBnUVVX4iE7JlUtY7LEpHFnfroAQz4jYAQQUeRTzvaKmbdCAOmjJ3JG-l46W4jRUz2-pwjGMt_EB9l-XkEL7OjDLs219R9MSyF83jhoJgyJL018rQ4Ex_JE3AfRTjI"
  },
  {
    id: "wish-3",
    name: "Phở Cuốn Hương Mai",
    category: "food",
    categoryVi: "Ẩm thực",
    categoryEn: "Food",
    categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500",
    rating: 4.6,
    reviewsCount: "1,900",
    address: "25 Ngũ Xã, Ba Đình",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDeByxo_DxogAq3IsAeOActdR-UkFRwnzs_jOyBc6OxHF6463Iy-GNiCKILKWdkXKTCkDEp9zfFAufUcfJaDmCI__fomLc8giGckqfO2Uun1znMYzkN9HTXhIYDaiLdYULOUKWyPXHEc6AqqqqokmYGi32KuGES4hohwz8YV9c3Ioh_hjIvqMU7XyLPMkIJyZP1fnupvYJFF6Do_2RPMm2Gx_-6jUptotISB0vCnY"
  },
  {
    id: "wish-4",
    name: "Di Tích Nhà Tù Hỏa Lò",
    category: "culture",
    categoryVi: "Di tích",
    categoryEn: "Heritage",
    categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
    barColor: "bg-sky-500",
    rating: 4.9,
    reviewsCount: "Đêm thiêng liêng",
    address: "1 Hoả Lò, Trần Hưng Đạo",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7taMeCVCw_sPcgGUo5Kw1qMAH9NMXVvlm32Kqq86Lp44I_y7S81eJDOxAKbKiXidcjqChiU8sqjJdhtYm_CMHUuizyKENTbZ51r5aQGAtRayemuies-X0MSo6byqiJvdnK_4GdP4DN3Ywknw1ow_v-_NQ68zWdEI-YaQ8ge5FHOxvjFd-ZMHVPpWD4RCTS-WAXJ_4UwwnORP7XdqKsGz8bcr2vMYISgcJ5OCcgYc"
  }
];

function parseDateRange(dateStr) {
  if (!dateStr) return { start: null, end: null };
  const parts = dateStr.split("-").map((s) => s.trim());
  const parsePart = (str) => {
    if (!str) return null;
    const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      return new Date(year, month, day);
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };
  const start = parsePart(parts[0]);
  const end = parts[1] ? parsePart(parts[1]) : null;
  return { start, end };
}

function generateDynamicDays(tripDatesStr, initialPlacesList) {
  const parsed = parseDateRange(tripDatesStr);
  let totalDays = 5; // default
  let startDate = parsed.start || new Date();

  if (parsed.start && parsed.end) {
    const diffTime = Math.abs(parsed.end.getTime() - parsed.start.getTime());
    totalDays = Math.max(1, Math.min(30, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1));
  }

  const defaultThemes = [
    { vi: "Phố Cổ & Check-in Cà phê", en: "Old Quarter & Coffee Check-in" },
    { vi: "Văn hóa & Lịch sử Thủ Đô", en: "Culture & Capital History" },
    { vi: "Hồ Tây & Hoàng hôn lãng mạn", en: "West Lake & Romantic Sunset" },
    { vi: "Bảo tàng & Nghệ thuật", en: "Museums & Arts" },
    { vi: "Ẩm thực đường phố & Mua sắm", en: "Street Food & Souvenirs" },
    { vi: "Trải nghiệm thiên nhiên & Ngoại ô", en: "Nature & Suburb Excursion" },
    { vi: "Thư giãn & Tự do khám phá", en: "Relax & Free Exploration" }
  ];

  const generated = [];
  for (let i = 1; i <= totalDays; i++) {
    const currentDayDate = new Date(startDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000);
    const day = currentDayDate.getDate();
    const month = currentDayDate.getMonth() + 1;
    const theme = defaultThemes[(i - 1) % defaultThemes.length];

    generated.push({
      dayId: `day-${i}`,
      dayNum: i,
      dayLabelVi: `Ngày ${i} (${day} Thg ${month})`,
      dayLabelEn: `Day ${i} (Month ${month}/${day})`,
      titleVi: theme.vi,
      titleEn: theme.en,
      items: []
    });
  }

  // Pre-fill initial sample places or user-selected places into days
  if (initialPlacesList && initialPlacesList.length > 0) {
    initialPlacesList.forEach((p, idx) => {
      const dayTarget = generated[idx % generated.length];
      if (dayTarget) {
        dayTarget.items.push({
          id: p.id || `place-${idx}`,
          name: p.name,
          category: p.category || "checkin",
          categoryVi: p.category || "Tham quan",
          categoryEn: p.category || "Sightseeing",
          categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
          barColor: "bg-sky-500",
          rating: p.rating || 4.8,
          reviewsCount: p.reviewCount || p.reviewsCount || "Được yêu thích",
          address: p.address || "Điểm đến trung tâm",
          tagVi: p.specs || "Điểm tham quan nổi bật",
          tagEn: p.specs || "Top Attraction",
          image: p.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"
        });
      }
    });
  } else {
    // Default fallback initial items
    INITIAL_DAYS.forEach((initDay, idx) => {
      if (generated[idx]) {
        generated[idx].items = initDay.items;
      }
    });
  }

  return generated;
}

export function TripPlanPage() {
  const { t, language } = useTranslation();
  const isEn = language === "en";
  const navigate = useNavigate();
  const locationState = useLocation().state || {};

  // Trip Metadata
  const [tripName, setTripName] = useState(
    locationState.tripName || "Chuyến đi Hà Nội mùa thu - Khám phá"
  );
  const [tripDates, setTripDates] = useState(
    locationState.tripDates || "14/08/2025 - 18/08/2025"
  );
  const [destination] = useState(
    locationState.destination || "Hà Nội, Việt Nam"
  );
  const [passengerCount] = useState(
    locationState.passengerCount || locationState.memberCount || 2
  );

  // Days and Wishlist state
  const [days, setDays] = useState(() => {
    if (locationState.daysSchedule && locationState.daysSchedule.length > 0) {
      return locationState.daysSchedule;
    }
    return generateDynamicDays(locationState.tripDates, locationState.placesList);
  });
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);

  // Pagination (3 days per page)
  const DAYS_PER_PAGE = 3;
  const [dayPageIndex, setDayPageIndex] = useState(0);
  const totalDayPages = Math.max(1, Math.ceil(days.length / DAYS_PER_PAGE));
  const visibleDays = useMemo(() => {
    const startIdx = dayPageIndex * DAYS_PER_PAGE;
    return days.slice(startIdx, startIdx + DAYS_PER_PAGE);
  }, [days, dayPageIndex]);

  const [authModal, setAuthModal] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [wishlistInput, setWishlistInput] = useState("");

  // Date Changer Popover Modal state
  const [dateChangeMenu, setDateChangeMenu] = useState(null); // { item, currentColId }

  // Drag state (with source index & target index for same-day reordering)
  const [draggedData, setDraggedData] = useState(null); // { item, sourceColId, sourceIndex }
  const [dragOverColId, setDragOverColId] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, item, sourceColId, sourceIndex) => {
    setDraggedData({ item, sourceColId, sourceIndex });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ itemId: item.id, sourceColId, sourceIndex }));
  };

  const handleDragOverCol = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
      setDragOverItemIndex(null);
    }
  };

  const handleDragOverItem = (e, colId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverColId(colId);
    setDragOverItemIndex(targetIndex);
  };

  const handleDragLeave = (e, colId) => {
    if (dragOverColId === colId && e.currentTarget === e.target) {
      setDragOverColId(null);
      setDragOverItemIndex(null);
    }
  };

  const handleDrop = (e, targetColId, targetIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColId(null);
    setDragOverItemIndex(null);
    if (!draggedData) return;

    const { item, sourceColId, sourceIndex } = draggedData;

    // 1. REORDERING WITHIN THE SAME DAY / COLUMN
    if (sourceColId === targetColId) {
      if (targetIndex === null || targetIndex === sourceIndex) {
        setDraggedData(null);
        return;
      }

      if (sourceColId === "wishlist") {
        setWishlist((prev) => {
          const next = [...prev];
          const [removed] = next.splice(sourceIndex, 1);
          const insertIdx = targetIndex >= next.length ? next.length : targetIndex;
          next.splice(insertIdx, 0, removed);
          return next;
        });
      } else {
        setDays((prev) =>
          prev.map((d) => {
            if (d.dayId !== sourceColId) return d;
            const nextItems = [...d.items];
            const [removed] = nextItems.splice(sourceIndex, 1);
            const insertIdx = targetIndex >= nextItems.length ? nextItems.length : targetIndex;
            nextItems.splice(insertIdx, 0, removed);
            return { ...d, items: nextItems };
          })
        );
      }
      showToast(isEn ? `Reordered "${item.name}"` : `Đã đổi thứ tự "${item.name}"`);
      setDraggedData(null);
      return;
    }

    // 2. MOVING ACROSS DIFFERENT DAYS / FROM WISHLIST
    // Remove from source
    if (sourceColId === "wishlist") {
      setWishlist((prev) => prev.filter((p) => p.id !== item.id));
    } else {
      setDays((prev) =>
        prev.map((d) =>
          d.dayId === sourceColId
            ? { ...d, items: d.items.filter((p) => p.id !== item.id) }
            : d
        )
      );
    }

    // Add to target
    if (targetColId === "wishlist") {
      setWishlist((prev) => {
        const next = [...prev];
        const destIdx = targetIndex != null ? targetIndex : 0;
        next.splice(destIdx, 0, item);
        return next;
      });
      showToast(isEn ? `Moved "${item.name}" to Wishlist` : `Đã chuyển "${item.name}" vào danh sách chờ`);
    } else {
      setDays((prev) =>
        prev.map((d) => {
          if (d.dayId !== targetColId) return d;
          const nextItems = [...d.items];
          const destIdx = targetIndex != null ? targetIndex : nextItems.length;
          nextItems.splice(destIdx, 0, item);
          return { ...d, items: nextItems };
        })
      );
      const targetDay = days.find((d) => d.dayId === targetColId);
      const dayName = targetDay ? (isEn ? targetDay.dayLabelEn : targetDay.dayLabelVi) : targetColId;
      showToast(isEn ? `Moved "${item.name}" to ${dayName}` : `Đã chuyển "${item.name}" sang ${dayName}`);
    }

    setDraggedData(null);
  };

  // Move item directly to a specific day or wishlist
  const handleAssignToDay = (item, targetDayId) => {
    // Remove from current
    setWishlist((prev) => prev.filter((p) => p.id !== item.id));
    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        items: d.items.filter((p) => p.id !== item.id)
      }))
    );

    if (targetDayId === "wishlist") {
      setWishlist((prev) => [item, ...prev]);
      showToast(isEn ? `Moved "${item.name}" to Wishlist` : `Đã chuyển "${item.name}" vào danh sách chờ`);
      return;
    }

    // Add to target day
    setDays((prev) =>
      prev.map((d) =>
        d.dayId === targetDayId
          ? { ...d, items: [...d.items, item] }
          : d
      )
    );
    const targetDay = days.find((d) => d.dayId === targetDayId);
    const dayName = targetDay ? (isEn ? targetDay.dayLabelEn : targetDay.dayLabelVi) : "";
    showToast(isEn ? `Assigned "${item.name}" to ${dayName}` : `Đã gán "${item.name}" vào ${dayName}`);
  };

  // Delete item
  const handleDeleteItem = (colId, itemId) => {
    if (colId === "wishlist") {
      setWishlist((prev) => prev.filter((p) => p.id !== itemId));
    } else {
      setDays((prev) =>
        prev.map((d) =>
          d.dayId === colId
            ? { ...d, items: d.items.filter((p) => p.id !== itemId) }
            : d
        )
      );
    }
    showToast(isEn ? "Activity removed" : "Đã xóa địa điểm");
  };

  // Quick Add Stop to Day
  const handleAddStopToDay = (dayId) => {
    const promptName = window.prompt(isEn ? "Enter place or stop name:" : "Nhập tên điểm dừng chân:");
    if (!promptName || !promptName.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name: promptName.trim(),
      category: "checkin",
      categoryVi: "Check-in",
      categoryEn: "Check-in",
      categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
      barColor: "bg-sky-500",
      rating: 5.0,
      reviewsCount: "Mới thêm",
      address: destination,
      tagVi: "Điểm tham quan mới",
      tagEn: "New place",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
    };

    setDays((prev) =>
      prev.map((d) => (d.dayId === dayId ? { ...d, items: [...d.items, newItem] } : d))
    );
    showToast(isEn ? `Added "${promptName}"` : `Đã thêm "${promptName}"`);
  };

  // Quick Add to Wishlist
  const handleAddToWishlist = (e) => {
    if (e.key === "Enter" && wishlistInput.trim()) {
      const newItem = {
        id: `wish-${Date.now()}`,
        name: wishlistInput.trim(),
        category: "checkin",
        categoryVi: "Check-in",
        categoryEn: "Check-in",
        categoryColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-500",
        rating: 5.0,
        reviewsCount: "Mới thêm",
        address: destination,
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"
      };
      setWishlist((prev) => [newItem, ...prev]);
      setWishlistInput("");
      showToast(isEn ? "Added to wishlist" : "Đã thêm vào danh sách chờ");
    }
  };

  // AI Optimize simulation
  const handleOptimizeAI = () => {
    showToast(isEn ? "✨ AI algorithm optimized itinerary order smoothly!" : "✨ AI đã tối ưu hóa thứ tự các điểm dừng!");
  };

  // Filter items matching search and category
  const filterItems = (items) => {
    return items.filter((item) => {
      const matchesCat =
        activeCategoryFilter === "all" ||
        item.category === activeCategoryFilter ||
        (activeCategoryFilter === "cafe" && item.category === "coffee") ||
        (activeCategoryFilter === "food" && item.category === "food") ||
        (activeCategoryFilter === "checkin" && item.category === "checkin") ||
        (activeCategoryFilter === "culture" && item.category === "culture");

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.categoryVi.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  };

  // CONTINUE TO STEP 3 DIRECTLY
  const handleContinueToStep3 = () => {
    const confirmedPlaces = days.flatMap((d) =>
      d.items.map((it) => ({
        id: it.id,
        name: it.name,
        address: it.address,
        category: it.categoryVi,
        image: it.image
      }))
    );

    navigate("/trip/confirm", {
      state: {
        tripName,
        tripDates,
        destination,
        passengerCount,
        placesList: confirmedPlaces.length > 0 ? confirmedPlaces : locationState.placesList,
        daysSchedule: days
      }
    });
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 font-sans min-h-screen flex flex-col antialiased selection:bg-[#00a3e0] selection:text-white overflow-x-hidden">
      {/* App Header */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#002b49] text-white rounded-xl shadow-xl border border-sky-400/30 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-[#56f9f9] text-base">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col w-full relative overflow-hidden">
        {/* TRIP SUB-HEADER & QUICK CONTROLS */}
        <section className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Title & Badges */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#00a3e0] text-[22px]">
                  flight_takeoff
                </span>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    autoFocus
                    className="text-base sm:text-lg font-bold text-[#002b49] border border-[#00a3e0] rounded px-2 py-0.5 outline-none"
                  />
                ) : (
                  <h1 className="text-base sm:text-lg font-bold text-[#002b49] tracking-tight">
                    {tripName} ({tripDates})
                  </h1>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(!isEditingTitle)}
                  className="text-slate-400 hover:text-[#00658d] transition-colors p-1 cursor-pointer"
                  title="Đổi tên chuyến đi"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>

              {/* Meta Attributes Tags (No distance or duration estimates as requested) */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  <span className="material-symbols-outlined text-[13px]">group</span>
                  <span>{passengerCount} {isEn ? "members" : "thành viên"}</span>
                </div>
                <span className="text-slate-300 text-xs hidden sm:inline">•</span>
                <span className="text-slate-500">{isEn ? "Auto sync active" : "Cập nhật 2 phút trước"}</span>
              </div>
            </div>

            {/* Toolbar & Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              {/* Category Filter Pills */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("all")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeCategoryFilter === "all"
                      ? "bg-white text-[#002b49] font-bold shadow-xs"
                      : "text-slate-600 hover:text-[#002b49]"
                  }`}
                >
                  {isEn ? "All" : "Tất cả"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("cafe")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeCategoryFilter === "cafe"
                      ? "bg-white text-[#002b49] font-bold shadow-xs"
                      : "text-slate-600 hover:text-[#002b49]"
                  }`}
                >
                  {isEn ? "Cafe" : "Cà phê"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("checkin")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeCategoryFilter === "checkin"
                      ? "bg-white text-[#002b49] font-bold shadow-xs"
                      : "text-slate-600 hover:text-[#002b49]"
                  }`}
                >
                  Check-in
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("food")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeCategoryFilter === "food"
                      ? "bg-white text-[#002b49] font-bold shadow-xs"
                      : "text-slate-600 hover:text-[#002b49]"
                  }`}
                >
                  {isEn ? "Food" : "Ẩm thực"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("culture")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeCategoryFilter === "culture"
                      ? "bg-white text-[#002b49] font-bold shadow-xs"
                      : "text-slate-600 hover:text-[#002b49]"
                  }`}
                >
                  {isEn ? "Culture" : "Văn hóa & Di tích"}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  title="Xem bản đồ vị trí các điểm"
                >
                  <span className="material-symbols-outlined text-[#00a3e0] text-[16px]">splitscreen</span>
                  <span className="hidden sm:inline">{isEn ? "Map View" : "Xem Bản đồ"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOptimizeAI}
                  className="flex items-center gap-1 bg-[#00a3e0] hover:bg-[#008ec4] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs hover:shadow active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <span>{isEn ? "AI Optimize" : "Tối ưu AI"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN BOARD SECTION: LEFT WISHLIST + RIGHT 3-DAY PAGINATED STREAM */}
        <section className="flex-1 p-4 flex flex-col lg:flex-row gap-5 min-h-[calc(100vh-190px)] w-full pb-20 overflow-x-auto">
          {/* 1. LEFT COLUMN: WISHLIST / ĐỊA ĐIỂM CHỜ SẮP XẾP */}
          <div
            onDragOver={(e) => handleDragOverCol(e, "wishlist")}
            onDragLeave={(e) => handleDragLeave(e, "wishlist")}
            onDrop={(e) => handleDrop(e, "wishlist", null)}
            className={`w-full lg:w-80 lg:min-w-[320px] lg:max-w-[320px] flex flex-col bg-white rounded-2xl border shadow-xs transition-all shrink-0 ${
              dragOverColId === "wishlist" && dragOverItemIndex === null
                ? "border-[#00a3e0] ring-2 ring-[#00a3e0]/30 bg-sky-50/50"
                : "border-sky-200 dark:border-slate-800"
            }`}
          >
            {/* Wishlist Header */}
            <div className="p-3.5 border-b border-sky-100 dark:border-slate-800 bg-sky-50/70 dark:bg-slate-800/60 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#00a3e0] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <span className="material-symbols-outlined text-[16px]">bookmark</span>
                </span>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#002b49] dark:text-sky-300">
                    {isEn ? "Wishlist & AI Pool" : "Địa điểm chờ sắp xếp"}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isEn ? "Unassigned places" : "Kéo thả hoặc bấm gán ngày"}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00a3e0] text-white text-xs font-bold shadow-xs">
                {wishlist.length} {isEn ? "places" : "điểm"}
              </span>
            </div>

            {/* Wishlist Cards Stack */}
            <div className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-[calc(100vh-320px)]">
              {wishlist.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs border-2 border-dashed border-sky-200 dark:border-slate-800 rounded-xl">
                  <p className="font-semibold">{isEn ? "No wishlist items" : "Chưa có địa điểm chờ"}</p>
                  <p className="mt-1 text-[11px]">{isEn ? "Drag places here or add below." : "Kéo thả địa điểm vào đây hoặc nhập thêm bên dưới."}</p>
                </div>
              ) : (
                wishlist.map((item, itemIdx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item, "wishlist", itemIdx)}
                    onDragOver={(e) => handleDragOverItem(e, "wishlist", itemIdx)}
                    onDrop={(e) => handleDrop(e, "wishlist", itemIdx)}
                    className={`group relative bg-white dark:bg-slate-900 rounded-xl border transition-all p-3 shadow-2xs cursor-grab active:cursor-grabbing hover:shadow-md ${
                      dragOverColId === "wishlist" && dragOverItemIndex === itemIdx
                        ? "border-[#00a3e0] ring-2 ring-[#00a3e0]/40 -translate-y-0.5 bg-sky-50/50"
                        : "border-slate-200 dark:border-slate-800 hover:border-[#00a3e0]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[14px] select-none group-hover:text-[#00a3e0]">⋮⋮</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.categoryColor || "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                          {isEn ? item.categoryEn || item.categoryVi : item.categoryVi}
                        </span>
                      </div>

                      {/* Gán ngày / Đổi ngày button */}
                      <button
                        type="button"
                        onClick={() => setDateChangeMenu({ item, currentColId: "wishlist" })}
                        className="text-[#00a3e0] hover:text-[#007ba8] bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Chọn ngày để gán địa điểm này"
                      >
                        <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                        <span>+ {isEn ? "Assign Day" : "Gán ngày"}</span>
                      </button>
                    </div>

                    <div className="flex gap-2.5">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-[#002b49] dark:text-white truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                          <span
                            className="material-symbols-outlined text-[12px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="font-semibold">{item.rating || 4.8}</span>
                          <span className="text-slate-400">({item.reviewsCount || "Được yêu thích"})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.address}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Quick Add to Wishlist input */}
              <div className="pt-2">
                <input
                  type="text"
                  value={wishlistInput}
                  onChange={(e) => setWishlistInput(e.target.value)}
                  onKeyDown={handleAddToWishlist}
                  placeholder={isEn ? "+ Enter place name & press Enter..." : "+ Thêm địa điểm & nhấn Enter..."}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 placeholder:text-slate-400 focus:border-[#00a3e0] focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* 2. RIGHT SECTION: PAGINATED DAYS STREAM (3 Days Per Page) */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Pagination Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 mb-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a3e0]"></span>
                <span className="text-xs sm:text-sm font-bold text-[#002b49] dark:text-sky-300">
                  {isEn
                    ? `Showing Days ${dayPageIndex * 3 + 1} - ${Math.min((dayPageIndex + 1) * 3, days.length)} of ${days.length}`
                    : `Lịch trình: Ngày ${dayPageIndex * 3 + 1} - ${Math.min((dayPageIndex + 1) * 3, days.length)} (Tổng ${days.length} ngày)`}
                </span>
              </div>

              {/* Day page chips & Navigation buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: totalDayPages }).map((_, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setDayPageIndex(pIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dayPageIndex === pIdx
                        ? "bg-[#002b49] text-white shadow-xs scale-105"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isEn ? `Days ${pIdx * 3 + 1}-${Math.min((pIdx + 1) * 3, days.length)}` : `Ngày ${pIdx * 3 + 1} - ${Math.min((pIdx + 1) * 3, days.length)}`}
                  </button>
                ))}

                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                  <button
                    type="button"
                    disabled={dayPageIndex === 0}
                    onClick={() => setDayPageIndex((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    title="Trang ngày trước"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    disabled={dayPageIndex >= totalDayPages - 1}
                    onClick={() => setDayPageIndex((prev) => Math.min(totalDayPages - 1, prev + 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    title="Trang ngày tiếp theo"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Day Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 items-start">
              {visibleDays.map((day) => {
                const visibleItems = filterItems(day.items);
                const isDragOver = dragOverColId === day.dayId;

                return (
                  <div
                    key={day.dayId}
                    onDragOver={(e) => handleDragOverCol(e, day.dayId)}
                    onDragLeave={(e) => handleDragLeave(e, day.dayId)}
                    onDrop={(e) => handleDrop(e, day.dayId, null)}
                    className={`flex flex-col bg-[#f0f7fb] dark:bg-slate-900/90 rounded-2xl border transition-all shadow-xs w-full min-h-[520px] ${
                      isDragOver && dragOverItemIndex === null
                        ? "border-[#00a3e0] ring-2 ring-[#00a3e0]/30 bg-sky-50 dark:bg-sky-950/40"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {/* Day Column Header */}
                    <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between rounded-t-2xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-[#00658d] dark:text-sky-300 flex items-center justify-center font-extrabold text-xs border border-sky-200 dark:border-sky-800 shrink-0">
                          D{day.dayNum}
                        </span>
                        <div className="min-w-0">
                          <h2 className="text-xs font-bold text-[#002b49] dark:text-white truncate">
                            {isEn ? day.dayLabelEn : day.dayLabelVi}
                          </h2>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {isEn ? day.titleEn : day.titleVi}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-sky-700 dark:text-sky-400 px-2 py-0.5 bg-sky-50 dark:bg-sky-950/50 rounded-full border border-sky-200 dark:border-sky-800">
                          {day.items.length} {isEn ? "stops" : "điểm"}
                        </span>
                      </div>
                    </div>

                    {/* Cards Stack with Same-Day Reordering & Cross-Day Drag */}
                    <div className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-[calc(100vh-340px)]">
                      {visibleItems.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          <p className="font-semibold">{isEn ? "Drag places here" : "Kéo thả địa điểm vào đây"}</p>
                          <p className="mt-1 text-[11px]">{isEn ? "or add custom stop below" : "hoặc thêm điểm dừng bên dưới"}</p>
                        </div>
                      ) : (
                        visibleItems.map((item, itemIdx) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item, day.dayId, itemIdx)}
                            onDragOver={(e) => handleDragOverItem(e, day.dayId, itemIdx)}
                            onDrop={(e) => handleDrop(e, day.dayId, itemIdx)}
                            className={`group relative bg-white dark:bg-slate-800/90 rounded-xl border transition-all p-3 shadow-2xs cursor-grab active:cursor-grabbing hover:shadow-md ${
                              dragOverColId === day.dayId && dragOverItemIndex === itemIdx
                                ? "border-[#00a3e0] ring-2 ring-[#00a3e0]/40 -translate-y-0.5 bg-sky-50/60 dark:bg-sky-950/50"
                                : "border-slate-200 dark:border-slate-700/80 hover:border-[#00a3e0]"
                            }`}
                          >
                            {/* Colored Left Strip Indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.barColor || "bg-[#00a3e0]"} rounded-l-xl`} />

                            {/* Top Bar: Drag Handle + Category Tag + Actions */}
                            <div className="flex items-center justify-between mb-2 pl-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-[14px] leading-none select-none group-hover:text-[#00a3e0]">
                                  ⋮⋮
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.categoryColor || "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300"}`}>
                                  {isEn ? item.categoryEn || item.categoryVi : item.categoryVi}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                {/* ĐỔI NGÀY POPOVER BUTTON (Shows all actual input dates) */}
                                <button
                                  type="button"
                                  onClick={() => setDateChangeMenu({ item, currentColId: day.dayId })}
                                  className="text-slate-400 hover:text-[#00a3e0] hover:bg-sky-50 dark:hover:bg-slate-700 p-1 rounded-lg cursor-pointer transition-colors"
                                  title="Đổi sang ngày khác"
                                >
                                  <span className="material-symbols-outlined text-[17px]">calendar_month</span>
                                </button>

                                {/* Delete stop */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(day.dayId, item.id)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-1 rounded-lg cursor-pointer transition-colors"
                                  title="Xóa điểm dừng"
                                >
                                  <span className="material-symbols-outlined text-[17px]">delete</span>
                                </button>
                              </div>
                            </div>

                            {/* Main Content & Media */}
                            <div className="flex gap-2.5 pl-1.5">
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-[#002b49] dark:text-white truncate">
                                  {item.name}
                                </h3>
                                <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                                  <span
                                    className="material-symbols-outlined text-[12px]"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                  >
                                    star
                                  </span>
                                  <span className="font-semibold">{item.rating || 4.8}</span>
                                  <span className="text-slate-400">({item.reviewsCount || "Được yêu thích"})</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {item.address}
                                </p>
                              </div>
                            </div>

                            {/* Action Bar Bottom (Ghi chú) */}
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 pl-1.5">
                              <span className="text-sky-700 dark:text-sky-400 font-semibold truncate max-w-[170px]">
                                {isEn ? item.tagEn || item.tagVi : item.tagVi}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newNote = window.prompt(isEn ? "Add note:" : "Thêm ghi chú:", item.tagVi || "");
                                  if (newNote !== null) {
                                    setDays((prev) =>
                                      prev.map((d) =>
                                        d.dayId === day.dayId
                                          ? {
                                              ...d,
                                              items: d.items.map((p) =>
                                                p.id === item.id ? { ...p, tagVi: newNote, tagEn: newNote } : p
                                              )
                                            }
                                          : d
                                      )
                                    );
                                  }
                                }}
                                className="flex items-center gap-0.5 text-[#00658d] dark:text-sky-400 hover:underline font-semibold cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                <span>{isEn ? "Note" : "Ghi chú"}</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Quick Add Stop in Column */}
                      <button
                        type="button"
                        onClick={() => handleAddStopToDay(day.dayId)}
                        className="w-full py-2.5 bg-white/90 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:text-[#00658d] hover:border-[#00a3e0] hover:bg-white transition-all flex items-center justify-center gap-1.5 font-bold shadow-2xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>
                          {isEn ? `Add stop to Day ${day.dayNum}` : `Thêm điểm dừng Ngày ${day.dayNum}`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* DATE CHANGER POPUP MODAL (Lists all input dates + wishlist option) */}
      {dateChangeMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setDateChangeMenu(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#002b49] dark:text-sky-300">
                  {isEn ? "Select Target Day" : "Chọn ngày chuyển đến"}
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-[240px] mt-0.5 font-medium">
                  {dateChangeMenu.item?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDateChangeMenu(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List of all input days */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {days.map((d) => {
                const isCurrent = dateChangeMenu.currentColId === d.dayId;
                return (
                  <button
                    key={d.dayId}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => {
                      handleAssignToDay(dateChangeMenu.item, d.dayId);
                      setDateChangeMenu(null);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                        : "bg-slate-50 dark:bg-slate-800/70 hover:bg-[#e6f6fd] dark:hover:bg-sky-950/60 border border-slate-200 dark:border-slate-700 text-[#002b49] dark:text-slate-200 hover:text-[#00a3e0]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-6 h-6 rounded-lg bg-[#00a3e0] text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                        D{d.dayNum}
                      </span>
                      <span className="truncate">{isEn ? d.dayLabelEn : d.dayLabelVi}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] text-slate-400 italic">Hiện tại</span>
                    ) : (
                      <span className="text-xs text-[#00a3e0] font-bold">Chuyển →</span>
                    )}
                  </button>
                );
              })}

              {/* Option to move back to Wishlist */}
              <button
                type="button"
                disabled={dateChangeMenu.currentColId === "wishlist"}
                onClick={() => {
                  handleAssignToDay(dateChangeMenu.item, "wishlist");
                  setDateChangeMenu(null);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  dateChangeMenu.currentColId === "wishlist"
                    ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                    : "bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">bookmark</span>
                  <span>{isEn ? "Move to Wishlist" : "Chuyển về Danh sách chờ"}</span>
                </div>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">Lưu lại →</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* STICKY SUMMARY BOTTOM BAR - Clicking CONTINUE goes straight to STEP 3 */}
      <footer className="fixed bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur border-t border-slate-200 px-6 flex items-center justify-between z-40 select-none shadow-md">
        {/* Left Back / Summary info */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => navigate("/trip/create", { state: locationState })}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{isEn ? "Back to Step 2" : "Quay lại Bước 2"}</span>
          </button>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-500">
            {isEn ? "Total scheduled places: " : "Tổng số điểm đã phân bổ: "}
            <strong className="text-[#002b49]">
              {days.reduce((acc, d) => acc + d.items.length, 0)} {isEn ? "places" : "điểm"}
            </strong>
          </span>
        </div>

        {/* Right Global Actions - Goes directly to Step 3 */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleContinueToStep3}
            className="flex items-center gap-2 bg-[#00a3e0] hover:bg-[#008ec4] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow hover:shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              rocket_launch
            </span>
            <span>{isEn ? "Continue to Step 3 (Confirmation)" : "Xác nhận & Tiếp tục sang Bước 3"}</span>
          </button>
        </div>
      </footer>

      {/* Map Modal */}
      {isMapModalOpen && (
        <LocationMapModal
          initialQuery={destination}
          onClose={() => setIsMapModalOpen(false)}
          onConfirm={(locName) => {
            setIsMapModalOpen(false);
            showToast(`${isEn ? "Selected location" : "Đã chọn tọa độ"}: ${locName}`);
          }}
        />
      )}

      {/* Auth Modals */}
      {authModal === "login" && (
        <LoginCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onSignUp={() => setAuthModal("register")}
        />
      )}

      {authModal === "register" && (
        <RegisterCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onLogin={() => setAuthModal("login")}
        />
      )}
    </div>
  );
}
