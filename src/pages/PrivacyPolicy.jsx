import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppHeader, AppFooter } from "~/shared/components";
import { SITE } from "~/shared/config/site";

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", titleVi: "1. Giới thiệu tổng quan", titleEn: "Introduction" },
    { id: "data-collected", titleVi: "2. Dữ liệu chúng tôi thu thập", titleEn: "Information We Collect" },
    { id: "how-we-use", titleVi: "3. Mục đích sử dụng dữ liệu", titleEn: "How We Use Information" },
    { id: "storage-security", titleVi: "4. Lưu trữ & Bảo mật thông tin", titleEn: "Storage & Protection" },
    { id: "sharing-disclosure", titleVi: "5. Chia sẻ & Tiết lộ thông tin", titleEn: "Information Sharing" },
    { id: "third-parties", titleVi: "6. Dịch vụ bên thứ ba", titleEn: "Third-Party Services" },
    { id: "cookies-storage", titleVi: "7. Cookies & Bộ nhớ cục bộ", titleEn: "Cookies & Local Storage" },
    { id: "retention", titleVi: "8. Thời hạn lưu trữ dữ liệu", titleEn: "Data Retention" },
    { id: "user-rights", titleVi: "9. Quyền của người dùng", titleEn: "User Rights & Choices" },
    { id: "children", titleVi: "10. Quyền riêng tư trẻ em", titleEn: "Children's Privacy" },
    { id: "changes", titleVi: "11. Thay đổi chính sách", titleEn: "Changes to This Policy" },
    { id: "contact", titleVi: "12. Thông tin liên hệ", titleEn: "Contact Information" }
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      {/* Navigation Header */}
      <AppHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* Hero Banner */}
        <section className="bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 py-12 sm:py-16">
          <div className="wayvee-container max-w-5xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Tài liệu Pháp lý & Quyền riêng tư • Microsoft Store Compliant
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              Chính sách Bảo mật <span className="text-[#00a3e0]">(Privacy Policy)</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mb-6">
              WAYVEE cam kết tôn trọng và bảo vệ tuyệt đối quyền riêng tư cùng thông tin cá nhân của người dùng. Tài liệu này minh bạch hóa toàn bộ quy trình thu thập, xử lý, bảo mật và lưu trữ dữ liệu khi bạn sử dụng dịch vụ của chúng tôi.
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 pt-4">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Ứng dụng:</span>
                <span>{SITE.name} Travel Platform</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Ngày có hiệu lực:</span>
                <span>23 Tháng 11, 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Phiên bản:</span>
                <span>1.0 (Production Release)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Public URL:</span>
                <span className="text-[#00a3e0] font-mono break-all">https://wayvee-one.vercel.app/privacy-policy</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container with Quick-jump Sidebar */}
        <div className="wayvee-container max-w-5xl py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Table of contents sticky sidebar (desktop) */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#00a3e0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Mục lục nhanh (Contents)
                </h2>
                <nav className="space-y-1 text-xs sm:text-sm">
                  {sections.map((s) => {
                    const isActive = activeSection === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => scrollToSection(s.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all flex flex-col cursor-pointer ${
                          isActive
                            ? "bg-sky-50 dark:bg-sky-950/70 text-[#00a3e0] font-bold border-l-3 border-[#00a3e0]"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="truncate">{s.titleVi}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{s.titleEn}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Support Card */}
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-sky-950/40 rounded-2xl p-4 border border-sky-100 dark:border-sky-900/40 text-xs">
                <p className="font-bold text-slate-900 dark:text-white mb-1">Cần hỗ trợ về quyền riêng tư?</p>
                <p className="text-slate-600 dark:text-slate-400 mb-3">Đội ngũ kỹ thuật và bảo mật của WAYVEE sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
                <a
                  href={`mailto:${SITE.supportEmail}`}
                  className="inline-flex items-center gap-1.5 font-bold text-[#00a3e0] hover:underline"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {SITE.supportEmail}
                </a>
              </div>
            </aside>

            {/* Detailed Policy Text */}
            <article className="lg:col-span-8 space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              
              {/* SECTION 1 */}
              <section id="intro" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 1 • Section 1</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    1. Giới thiệu tổng quan (Introduction)
                  </h2>
                </div>
                <p className="mb-3">
                  Chào mừng bạn đến với <strong>WAYVEE</strong> (gọi tắt là <em>"chúng tôi"</em> hoặc <em>"Ứng dụng"</em>). WAYVEE là nền tảng công nghệ du lịch thông minh, hỗ trợ người dùng khám phá điểm đến, xây dựng lịch trình cá nhân hóa và tối ưu chuyến đi trên khắp lãnh thổ Việt Nam.
                </p>
                <p className="mb-3">
                  Chính sách Bảo mật này áp dụng cho toàn bộ người dùng truy cập ứng dụng web tại địa chỉ <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-mono text-xs">https://wayvee-one.vercel.app</code>, các phiên bản đóng gói trên Microsoft Store, cùng toàn bộ các dịch vụ và API liên quan.
                </p>
                <p>
                  Bằng việc tạo tài khoản, đăng nhập hoặc sử dụng bất kỳ tính năng nào của WAYVEE, bạn xác nhận đã đọc, hiểu và đồng ý với các điều khoản được quy định trong chính sách này.
                </p>
              </section>

              {/* SECTION 2 */}
              <section id="data-collected" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 2 • Section 2</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    2. Dữ liệu chúng tôi thu thập (Information We Collect)
                  </h2>
                </div>
                <p className="mb-4">
                  WAYVEE chỉ thu thập các thông tin thực sự cần thiết nhằm phục vụ việc vận hành tính năng lập lịch trình và quản lý tài khoản. Dựa trên mã nguồn và cấu hình thực tế, các loại dữ liệu bao gồm:
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00a3e0]" />
                      a. Thông tin tài khoản & danh tính (Account & Identity Data)
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <li><strong>Đăng ký trực tiếp:</strong> Họ và tên (<code className="text-xs font-mono">fullName</code>), địa chỉ Email (<code className="text-xs font-mono">email</code>), số điện thoại (<code className="text-xs font-mono">phone</code>), mật khẩu đã được băm bảo mật (<code className="text-xs font-mono">password</code>).</li>
                      <li><strong>Đăng nhập Google qua Firebase:</strong> Mã định danh Google UID, địa chỉ email Google, tên hiển thị và ảnh đại diện liên kết với tài khoản Google của bạn.</li>
                      <li><strong>Thông tin hồ sơ:</strong> Ảnh đại diện cá nhân (<code className="text-xs font-mono">avatarUrl</code>), trạng thái tài khoản, vai trò thành viên (<code className="text-xs font-mono">role: USER</code>).</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      b. Dữ liệu chuyến đi & kế hoạch du lịch (Travel & Itinerary Data)
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <li>Thông tin lịch trình chuyến đi: Tên chuyến đi, điểm đến du lịch, ngày khởi hành, ngày kết thúc, ngân sách dự kiến, ghi chú hoạt động và lộ trình di chuyển.</li>
                      <li>Danh sách địa điểm lưu trữ yêu thích (<code className="text-xs font-mono">favorites</code>), các bộ sưu tập địa điểm du lịch cá nhân.</li>
                      <li>Nội dung đánh giá, xếp hạng sao (<code className="text-xs font-mono">reviews</code>) cho các địa điểm tham quan hoặc trải nghiệm trên nền tảng.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      c. Thông tin gói dịch vụ & thanh toán (Subscription & Transaction Records)
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <li>Gói thuê bao đã đăng ký: <em>1 chuyến đi</em>, <em>Combo 2 chuyến đi</em>, <em>Combo 10 chuyến đi</em> (<code className="text-xs font-mono">PREMIUM</code>, <code className="text-xs font-mono">ANNUAL_PRO</code>).</li>
                      <li>Mã tham chiếu giao dịch (<code className="text-xs font-mono">orderCode</code>, <code className="text-xs font-mono">transactionCode</code>), số tiền thanh toán, trạng thái giao dịch (<code className="text-xs font-mono">PAID</code>, <code className="text-xs font-mono">PENDING</code>, <code className="text-xs font-mono">CANCELLED</code>), phương thức thanh toán (PayOS, Chuyển khoản ngân hàng VietQR).</li>
                      <li className="text-amber-700 dark:text-amber-400 font-medium pt-1">
                        * Quan trọng: WAYVEE KHÔNG lưu trữ số thẻ tín dụng, CVV hoặc mã PIN ngân hàng. Toàn bộ thanh toán trực tuyến được xử lý trực tiếp thông qua cổng thanh toán PayOS được cấp phép tại Việt Nam.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      d. Nhật ký hệ thống & dữ liệu kỹ thuật (Access Logs & Telemetry)
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <li>Địa chỉ IP (<code className="text-xs font-mono">ip_address</code>) của kết nối mạng.</li>
                      <li>Đường dẫn URL và tiêu đề trang truy cập (<code className="text-xs font-mono">path</code>, <code className="text-xs font-mono">page_title</code>).</li>
                      <li>Thời điểm thực hiện yêu cầu (<code className="text-xs font-mono">created_at</code>).</li>
                      <li>Thông tin thiết bị và phần mềm: Loại thiết bị (Desktop, Mobile, Tablet), trình duyệt (Chrome, Safari, Edge...), hệ điều hành (Windows, macOS, iOS, Android) và chuỗi User-Agent.</li>
                      <li>Mã định danh người dùng nếu bạn đang trong phiên đăng nhập.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SECTION 3 */}
              <section id="how-we-use" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 3 • Section 3</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    3. Mục đích sử dụng dữ liệu (How We Use Information)
                  </h2>
                </div>
                <p className="mb-3">Chúng tôi sử dụng các thông tin thu thập được cho các mục đích cụ thể sau:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Cung cấp dịch vụ cốt lõi</h4>
                    <p className="text-slate-600 dark:text-slate-400">Khởi tạo, sắp xếp và tối ưu lộ trình các địa điểm tham quan, ẩm thực, giải trí và khách sạn theo nhu cầu của bạn.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Xác thực & Bảo mật tài khoản</h4>
                    <p className="text-slate-600 dark:text-slate-400">Xác minh danh tính khi đăng nhập bằng email hoặc Google, bảo vệ tài khoản khỏi các truy cập trái phép.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Quản lý gói dịch vụ</h4>
                    <p className="text-slate-600 dark:text-slate-400">Cập nhật và tính toán chính xác số lượt mở khóa chuyến đi (<code className="text-xs font-mono">remaining_trips</code>) tương ứng với gói Premium đã mua.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">An ninh mạng & Phòng chống tấn công</h4>
                    <p className="text-slate-600 dark:text-slate-400">Giám sát nhật ký truy cập để phát hiện hành vi tấn công DDoS, spam, quét lỗ hổng hoặc truy cập trái phép vào tài nguyên hệ thống.</p>
                  </div>
                </div>
              </section>

              {/* SECTION 4 */}
              <section id="storage-security" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 4 • Section 4</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    4. Lưu trữ & Bảo mật thông tin (Data Storage & Protection)
                  </h2>
                </div>
                <p className="mb-3">
                  WAYVEE áp dụng các chuẩn mực bảo mật tiên tiến trong ngành kỹ thuật phần mềm để đảm bảo an toàn toàn diện cho dữ liệu của người dùng:
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm list-disc list-inside">
                  <li>
                    <strong>Mã hóa mật khẩu bằng BCrypt:</strong> Toàn bộ mật khẩu của tài khoản thành viên đều được băm một chiều với thuật toán BCrypt kèm muối ngẫu nhiên (salt rounds = 10). Mật khẩu dạng văn bản gốc (plaintext) tuyệt đối không bao giờ được lưu trữ.
                  </li>
                  <li>
                    <strong>Mã hóa đường truyền TLS/HTTPS:</strong> Tất cả lưu lượng dữ liệu trao đổi giữa trình duyệt của người dùng và hệ thống máy chủ đều được mã hóa bằng giao thức HTTPS với chứng chỉ SSL/TLS 1.3 bảo mật cao.
                  </li>
                  <li>
                    <strong>Cơ chế xác thực phân tán JWT & OAuth 2.0:</strong> Xác thực phiên làm việc an toàn thông qua JSON Web Token có chữ ký số bí mật và chuẩn OAuth 2.0 từ Google Firebase.
                  </li>
                  <li>
                    <strong>Kiểm soát quyền truy cập theo vai trò (RBAC):</strong> Cơ sở dữ liệu và các API quản trị được bảo vệ nhiều lớp, chỉ cho phép quản trị viên được ủy quyền mới có thể truy cập thông tin nhật ký hệ thống.
                  </li>
                </ul>
              </section>

              {/* SECTION 5 */}
              <section id="sharing-disclosure" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 5 • Section 5</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    5. Chia sẻ & Tiết lộ thông tin (Information Sharing & Disclosure)
                  </h2>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-medium mb-3">
                  ✓ Cam kết minh bạch: WAYVEE TUYỆT ĐỐI KHÔNG bán, cho thuê, trao đổi hoặc chuyển giao dữ liệu cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc thương mại.
                </div>
                <p className="mb-2">Thông tin chỉ được chia sẻ trong các phạm vi hạn chế sau:</p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                  <li><strong>Đối tác cung cấp hạ tầng cần thiết:</strong> Các nhà cung cấp dịch vụ hạ tầng điện toán đám mây (Vercel, PostgreSQL Cloud Hosting), nhà cung cấp cổng thanh toán (PayOS) và dịch vụ xác thực Google Firebase để vận hành các tính năng bạn yêu cầu.</li>
                  <li><strong>Yêu cầu pháp lý:</strong> Chúng tôi chỉ cung cấp thông tin cho cơ quan thực thi pháp luật có thẩm quyền khi có yêu cầu hợp pháp theo trình tự quy định của pháp luật Việt Nam.</li>
                </ul>
              </section>

              {/* SECTION 6 */}
              <section id="third-parties" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 6 • Section 6</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    6. Dịch vụ của bên thứ ba (Third-Party Services)
                  </h2>
                </div>
                <p className="mb-3">
                  Ứng dụng WAYVEE tích hợp với một số dịch vụ bên thứ ba uy tín để cung cấp trải nghiệm hoàn thiện cho người dùng:
                </p>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[120px]">Google Firebase:</span>
                    <span className="text-slate-600 dark:text-slate-400">Cung cấp cơ chế đăng nhập bảo mật (Google Sign-In) và kiểm tra tính hợp lệ của token xác thực.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[120px]">Cổng PayOS:</span>
                    <span className="text-slate-600 dark:text-slate-400">Xử lý tạo liên kết thanh toán và mã QR VietQR chuẩn ngân hàng để kích hoạt các gói dịch vụ Premium.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[120px]">OpenStreetMap:</span>
                    <span className="text-slate-600 dark:text-slate-400">Cung cấp dữ liệu bản đồ mở và tìm kiếm địa danh, tọa độ địa lý công khai nhằm xây dựng lộ trình du lịch.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[120px]">Dịch vụ Thời tiết:</span>
                    <span className="text-slate-600 dark:text-slate-400">Truy vấn thông tin dự báo thời tiết tại điểm đến nhằm giúp người dùng chuẩn bị hành lý phù hợp.</span>
                  </div>
                </div>
              </section>

              {/* SECTION 7 */}
              <section id="cookies-storage" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 7 • Section 7</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    7. Cookies & Bộ nhớ cục bộ (Cookies & Local Storage)
                  </h2>
                </div>
                <p className="mb-3">
                  WAYVEE <strong>không sử dụng</strong> các cookie quảng cáo hành vi hoặc pixel theo dõi của các mạng lưới quảng cáo bên thứ ba.
                </p>
                <p className="mb-3">Ứng dụng sử dụng cơ chế lưu trữ cục bộ HTML5 Web Storage (<code className="text-xs font-mono">localStorage</code> & <code className="text-xs font-mono">sessionStorage</code>) để ghi nhớ:</p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                  <li><code className="text-xs font-mono">wayvee-theme</code>: Lưu trữ tùy chọn giao diện Sáng (Light) hoặc Tối (Dark).</li>
                  <li><code className="text-xs font-mono">wayvee-lang</code>: Lưu trữ ngôn ngữ giao diện được chọn (Tiếng Việt hoặc Tiếng Anh).</li>
                  <li><code className="text-xs font-mono">wayvee_user</code> / <code className="text-xs font-mono">token</code>: Duy trì phiên đăng nhập để người dùng không phải đăng nhập lại mỗi lần mở trang.</li>
                  <li><code className="text-xs font-mono">wayvee_return_to</code>: Lưu tạm đường dẫn trang đích trước khi đăng nhập.</li>
                </ul>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Bạn có thể chủ động xóa bỏ toàn bộ dữ liệu lưu trữ này bất kỳ lúc nào thông qua phần Cài đặt quyền riêng tư & xóa dữ liệu duyệt web trong trình duyệt của bạn.
                </p>
              </section>

              {/* SECTION 8 */}
              <section id="retention" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 8 • Section 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    8. Thời hạn lưu trữ dữ liệu (Data Retention)
                  </h2>
                </div>
                <p className="mb-3">
                  Chúng tôi lưu trữ thông tin cá nhân của bạn trong khoảng thời gian cần thiết để thực hiện các mục đích nêu trong Chính sách này:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm">
                  <li><strong>Dữ liệu tài khoản & lịch trình:</strong> Được lưu giữ liên tục cho đến khi người dùng chủ động yêu cầu xóa tài khoản hoặc xóa chuyến đi.</li>
                  <li><strong>Dữ liệu giao dịch thanh toán:</strong> Được lưu giữ theo quy định của pháp luật về kế toán và thương mại điện tử để phục vụ đối soát và hỗ trợ khách hàng.</li>
                  <li><strong>Nhật ký truy cập hệ thống:</strong> Được lưu trữ định kỳ phục vụ phân tích an ninh và giám sát tải hệ thống, sau đó được tổng hợp hoặc dọn dẹp theo chu kỳ bảo trì.</li>
                </ul>
              </section>

              {/* SECTION 9 */}
              <section id="user-rights" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 9 • Section 9</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    9. Quyền của người dùng đối với dữ liệu (User Rights & Choices)
                  </h2>
                </div>
                <p className="mb-3">Người dùng WAYVEE được đảm bảo đầy đủ các quyền lợi sau đây đối với dữ liệu cá nhân của mình:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Quyền truy cập</span>
                    <span className="text-slate-600 dark:text-slate-400">Xem và kiểm tra toàn bộ thông tin tài khoản và danh sách các chuyến đi đã tạo tại trang Profile và Lịch trình.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Quyền chỉnh sửa</span>
                    <span className="text-slate-600 dark:text-slate-400">Cập nhật họ tên, số điện thoại, đổi mật khẩu và đổi ảnh đại diện bất kỳ lúc nào.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Quyền xóa dữ liệu</span>
                    <span className="text-slate-600 dark:text-slate-400">Tự do xóa từng chuyến đi, xóa mục yêu thích, hoặc gửi yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Quyền phản đối & thắc mắc</span>
                    <span className="text-slate-600 dark:text-slate-400">Liên hệ trực tiếp với chúng tôi để khiếu nại hoặc yêu cầu giải thích về cách thức dữ liệu của bạn được xử lý.</span>
                  </div>
                </div>
              </section>

              {/* SECTION 10 */}
              <section id="children" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 10 • Section 10</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    10. Quyền riêng tư của trẻ em (Children's Privacy)
                  </h2>
                </div>
                <p className="mb-2">
                  Dịch vụ của WAYVEE hướng tới đối tượng người dùng phổ thông có đầy đủ năng lực hành vi dân sự để thực hiện các kế hoạch du lịch và giao dịch trực tuyến. Ứng dụng không hướng tới và không cố ý thu thập thông tin nhận dạng cá nhân từ trẻ em dưới 13 tuổi (hoặc độ tuổi tối thiểu theo quy định tại quốc gia sở tại).
                </p>
                <p>
                  Nếu phụ huynh hoặc người giám hộ phát hiện con em mình đã cung cấp thông tin cá nhân cho WAYVEE mà không có sự đồng ý của cha mẹ, vui lòng thông báo ngay cho chúng tôi qua email <a href={`mailto:${SITE.supportEmail}`} className="text-[#00a3e0] font-semibold underline">{SITE.supportEmail}</a> để chúng tôi kịp thời xác minh và xóa bỏ thông tin đó khỏi hệ thống.
                </p>
              </section>

              {/* SECTION 11 */}
              <section id="changes" className="scroll-mt-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 11 • Section 11</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    11. Thay đổi Chính sách bảo mật (Changes to This Policy)
                  </h2>
                </div>
                <p className="mb-2">
                  Chúng tôi có thể cập nhật nội dung Chính sách Bảo mật này theo định kỳ để phản ánh những cải tiến về tính năng kỹ thuật hoặc để phù hợp với các quy định pháp luật hiện hành.
                </p>
                <p>
                  Khi có sự điều chỉnh, chúng tôi sẽ cập nhật lại ngày <em>"Ngày có hiệu lực (Effective Date)"</em> ở đầu tài liệu này. Mọi thay đổi sẽ có hiệu lực ngay khi được đăng tải công khai tại đường dẫn: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-mono text-xs">https://wayvee-one.vercel.app/privacy-policy</code>.
                </p>
              </section>

              {/* SECTION 12 */}
              <section id="contact" className="scroll-mt-24 bg-gradient-to-br from-white to-sky-50/50 dark:from-slate-900 dark:to-slate-900 p-6 sm:p-8 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Mục 12 • Section 12</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    12. Thông tin liên hệ (Contact Information)
                  </h2>
                </div>
                <p className="mb-4">
                  Nếu bạn có bất kỳ câu hỏi, góp ý hoặc yêu cầu hỗ trợ nào liên quan đến Chính sách Bảo mật và việc xử lý dữ liệu của WAYVEE, vui lòng liên hệ với chúng tôi qua các kênh chính thức sau:
                </p>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[140px]">Đơn vị phát triển:</span>
                    <span>Hệ thống Lập kế hoạch Du lịch {SITE.name} (WAYVEE System)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[140px]">Email hỗ trợ chính thức:</span>
                    <a href={`mailto:${SITE.supportEmail}`} className="text-[#00a3e0] font-semibold hover:underline">
                      {SITE.supportEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[140px]">Hotline hỗ trợ:</span>
                    <span className="font-semibold">{SITE.supportPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[140px]">Website ứng dụng:</span>
                    <a href="https://wayvee-one.vercel.app" target="_blank" rel="noreferrer" className="text-[#00a3e0] hover:underline">
                      https://wayvee-one.vercel.app
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[140px]">Địa chỉ:</span>
                    <span>Thành phố Hồ Chí Minh, Việt Nam</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap gap-4 items-center justify-between">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a3e0] text-white font-bold text-xs hover:bg-[#0092c8] transition-colors shadow-xs"
                  >
                    ← Quay lại Trang chủ
                  </Link>
                  <Link
                    to="/support"
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
                  >
                    Mở Trung tâm trợ giúp &amp; Phản hồi
                  </Link>
                </div>
              </section>

            </article>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
