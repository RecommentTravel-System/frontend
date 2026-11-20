import { Link } from "react-router-dom";
import { SITE } from "~/shared/config/site";
import { useTranslation } from "~/providers/i18n-provider";

export function AppFooter() {
  const { t } = useTranslation();

  const getLinkTarget = (link) => {
    switch (link) {
      case "Trang chủ":
        return "/";
      case "Điểm đến hot":
      case "Khám phá ngay":
      case "Địa điểm nổi bật":
        return "/places";
      case "Đánh giá chuyến đi":
        return "/reviews";
      case "Trung tâm hỗ trợ":
        return "/support?view=help";
      case "Trò chuyện ngay":
        return "/support?view=chat";
      case "Góp ý phản hồi":
        return "/support?view=feedback";
      case "Liên hệ chúng tôi":
        return "mailto:wayvee@gmail.com";
      default:
        return null;
    }
  };

  const footerColumns = [
    {
      title: t("footer.navigation", "Điều hướng"),
      links: ["Trang chủ", "Điểm đến hot", "Blog du lịch", "Đánh giá chuyến đi", "Khám phá ngay"]
    },
    {
      title: t("footer.explore", "Khám phá"),
      links: ["Địa điểm nổi bật", "Quản lý chuyến đi thích", "Xu hướng du lịch", "Gợi ý theo mùa"]
    },
    {
      title: t("footer.support", "Hỗ trợ & Góp ý"),
      links: ["Trung tâm hỗ trợ", "Trò chuyện ngay", "Góp ý phản hồi", "Liên hệ chúng tôi"]
    }
  ];

  return (
    <footer className="bg-[#05132f] text-white mt-20 border-t border-slate-800/80 transition-colors">
      <div className="wayvee-container py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-sky-500/20 text-[#00a3e0] border border-sky-400/30 flex items-center justify-center font-black text-base">
              W
            </span>
            <p className="font-extrabold text-xl tracking-tight text-white">{SITE.name}</p>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs font-normal">
            {t("footer.description", "Nền tảng lên kế hoạch du lịch thông minh, cá nhân hoá từng khoảnh khắc khám phá.")}
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4 text-sky-400">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((link) => {
                const target = getLinkTarget(link);
                return (
                  <li key={link} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    {target ? (
                      target.startsWith("mailto:") ? (
                        <a href={target} className="hover:underline">{link}</a>
                      ) : (
                        <Link to={target} className="hover:underline">{link}</Link>
                      )
                    ) : (
                      <span>{link}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-4 text-sky-400">{t("footer.contact", "Liên hệ")}</p>
          <p className="text-xs sm:text-sm text-slate-300 mb-1.5 font-medium">{SITE.supportPhone}</p>
          <p className="text-xs sm:text-sm text-slate-300 mb-5 font-medium">{SITE.supportEmail}</p>
          <div className="flex gap-2.5 text-slate-300">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xs hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
            >
              f
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xs hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
            >
              ig
            </a>
            <a
              href="mailto:wayvee@gmail.com"
              aria-label="Email Support"
              className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xs hover:bg-teal-500 hover:text-white transition-colors cursor-pointer"
            >
              ✉
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wayvee-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {SITE.name}. {t("footer.rights", "Bản quyền đã được đăng ký.")}</p>
          <p className="text-[11px] text-slate-400">Thiết kế chuẩn mực du lịch hiện đại • Trải nghiệm mượt mà trên mọi thiết bị</p>
        </div>
      </div>
    </footer>
  );
}
