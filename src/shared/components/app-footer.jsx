import { SITE } from "~/shared/config/site";
import { useTranslation } from "~/providers/i18n-provider";

export function AppFooter() {
  const { t } = useTranslation();

  const footerColumns = [
    {
      title: t("footer.navigation"),
      links: ["Trang chủ", "Điểm đến hot", "Blog du lịch", "Đánh giá chuyến đi", "Khám phá ngay"]
    },
    {
      title: t("footer.explore"),
      links: ["Địa điểm nổi bật", "Quản lý chuyến đi thích", "Xu hướng du lịch", "Gợi ý theo mùa"]
    },
    {
      title: t("footer.support"),
      links: ["Trung tâm hỗ trợ", "Trò chuyện ngay", "Góp ý phản hồi", "Liên hệ chúng tôi"]
    }
  ];

  return (
    <footer className="bg-[#0b2545] text-white mt-16 border-t border-slate-800">
      <div className="wayvee-container py-12 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8">
        <div>
          <p className="font-extrabold text-xl mb-2 tracking-tight text-white">{SITE.name}</p>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs">{t("footer.description")}</p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold mb-3.5 text-white">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link} className="text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-sm font-semibold mb-3.5 text-white">{t("footer.contact")}</p>
          <p className="text-sm text-slate-300 mb-1">{SITE.supportPhone}</p>
          <p className="text-sm text-slate-300 mb-4">{SITE.supportEmail}</p>
          <div className="flex gap-3 text-slate-300">
            <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">◎</span>
            <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">▣</span>
            <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">✉</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wayvee-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {SITE.name}. {t("footer.rights")}</p>
          <p className="text-[11px] opacity-80">Kiến trúc Feature-Sliced Design • Dynamic Responsive Layout</p>
        </div>
      </div>
    </footer>
  );
}
