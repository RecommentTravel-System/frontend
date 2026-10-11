/**
 * Bảng mã lỗi tập trung cho Frontend dựa trên ErrorCode của Backend.
 * Hỗ trợ song ngữ (Tiếng Việt & Tiếng Anh).
 */
export const ERROR_CODE_MAP = {
  // 1000 - 1099: Hệ thống, Tài khoản, Xác thực
  9999: {
    key: 'UNCATEGORIZED_EXCEPTION',
    vi: 'Đã xảy ra lỗi hệ thống chưa được phân loại. Vui lòng thử lại sau.',
    en: 'An unexpected system error occurred. Please try again later.'
  },
  1001: {
    key: 'INVALID_KEY',
    vi: 'Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    en: 'Invalid request data. Please check your input.'
  },
  1002: {
    key: 'USER_EXISTED',
    vi: 'Người dùng đã tồn tại trong hệ thống.',
    en: 'User already exists.'
  },
  1003: {
    key: 'USERNAME_INVALID',
    vi: 'Tên người dùng phải có ít nhất 3 ký tự.',
    en: 'Username must be at least 3 characters.'
  },
  1004: {
    key: 'INVALID_PASSWORD',
    vi: 'Mật khẩu phải có ít nhất 8 ký tự.',
    en: 'Password must be at least 8 characters.'
  },
  1005: {
    key: 'USER_NOT_EXISTED',
    vi: 'Không tìm thấy người dùng.',
    en: 'User not found.'
  },
  1006: {
    key: 'UNAUTHENTICATED',
    vi: 'Chưa xác thực danh tính hoặc phiên đăng nhập đã hết hạn.',
    en: 'Unauthenticated or session has expired.'
  },
  1007: {
    key: 'UNAUTHORIZED',
    vi: 'Bạn không có quyền thực hiện thao tác này.',
    en: 'You do not have permission to perform this action.'
  },
  1008: {
    key: 'EMAIL_EXISTED',
    vi: 'Email này đã được sử dụng bởi một tài khoản khác.',
    en: 'Email already exists.'
  },
  1009: {
    key: 'EMAIL_REQUIRED',
    vi: 'Vui lòng nhập địa chỉ email.',
    en: 'Email is required.'
  },
  1010: {
    key: 'INVALID_EMAIL',
    vi: 'Địa chỉ email không đúng định dạng.',
    en: 'Email format is invalid.'
  },
  1011: {
    key: 'INVALID_TOKEN',
    vi: 'Mã token không hợp lệ hoặc đã hết hạn.',
    en: 'Invalid or expired token.'
  },
  1012: {
    key: 'USER_INACTIVE',
    vi: 'Tài khoản chưa được kích hoạt.',
    en: 'User account is inactive.'
  },
  1013: {
    key: 'USER_SUSPENDED',
    vi: 'Tài khoản của bạn đã bị tạm khóa.',
    en: 'User account is suspended.'
  },
  1014: {
    key: 'USER_DELETED',
    vi: 'Tài khoản này đã bị xóa.',
    en: 'User account has been deleted.'
  },
  1015: {
    key: 'PASSWORD_INCORRECT',
    vi: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
    en: 'Incorrect username or password.'
  },

  // 2000 - 2999: Xác thực email
  2001: {
    key: 'USER_NOT_VERIFIED',
    vi: 'Vui lòng xác thực email trước khi đăng nhập.',
    en: 'Please verify your email before logging in.'
  },

  // 3000 - 3999: OTP & Mật khẩu
  3001: {
    key: 'OTP_EXPIRED',
    vi: 'Mã OTP đã hết hạn. Vui lòng bấm gửi lại mã mới.',
    en: 'OTP has expired. Please request a new code.'
  },
  3002: {
    key: 'OTP_INVALID',
    vi: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.',
    en: 'OTP is invalid. Please try again.'
  },
  3003: {
    key: 'OTP_MAX_ATTEMPT',
    vi: 'Đã nhập sai OTP quá số lần cho phép. Vui lòng thử lại sau.',
    en: 'Too many OTP attempts. Please try again later.'
  },
  3004: {
    key: 'OTP_RESEND_COOLDOWN',
    vi: 'Vui lòng chờ ít giây trước khi yêu cầu mã OTP mới.',
    en: 'Please wait before requesting another OTP.'
  },
  3005: {
    key: 'OTP_RATE_LIMIT',
    vi: 'Bạn đã yêu cầu gửi OTP quá nhiều lần. Vui lòng thử lại sau.',
    en: 'Too many OTP requests. Please try again later.'
  },
  3006: {
    key: 'EMAIL_SEND_FAILED',
    vi: 'Không thể gửi email xác thực lúc này. Vui lòng thử lại sau.',
    en: 'Failed to send verification email. Please try again later.'
  },
  3007: {
    key: 'EMAIL_ALREADY_VERIFIED',
    vi: 'Email này đã được xác thực trước đó.',
    en: 'Email has already been verified.'
  },
  3008: {
    key: 'OTP_REQUIRED',
    vi: 'Mã OTP không được để trống.',
    en: 'OTP is required.'
  },
  3010: {
    key: 'PASSWORD_CONFIRM_NOT_MATCH',
    vi: 'Mật khẩu xác nhận không trùng khớp.',
    en: 'Password confirmation does not match.'
  },
  3011: {
    key: 'PASSWORD_SAME_AS_OLD',
    vi: 'Mật khẩu mới phải khác với mật khẩu cũ.',
    en: 'New password must be different from old password.'
  },
  3012: {
    key: 'PASSWORD_REQUIRED',
    vi: 'Mật khẩu không được để trống.',
    en: 'Password is required.'
  },

  // 4000 - 4999: Bản đồ, Địa điểm, Danh mục, Đánh giá, Media
  4001: {
    key: 'EXTERNAL_MAP_SERVICE_UNAVAILABLE',
    vi: 'Dịch vụ bản đồ bên ngoài hiện không khả dụng.',
    en: 'External map service is currently unavailable.'
  },
  4002: {
    key: 'EXTERNAL_MAP_TIMEOUT',
    vi: 'Quá thời gian kết nối dịch vụ bản đồ.',
    en: 'External map service timeout.'
  },
  4003: {
    key: 'LOCATION_NOT_FOUND',
    vi: 'Không tìm thấy địa điểm.',
    en: 'Location not found.'
  },
  4004: {
    key: 'CATEGORY_NOT_FOUND',
    vi: 'Không tìm thấy danh mục.',
    en: 'Category not found.'
  },
  4005: {
    key: 'CATEGORY_CODE_EXISTED',
    vi: 'Mã danh mục đã tồn tại trong hệ thống.',
    en: 'Category code already exists.'
  },
  4006: {
    key: 'FAVORITE_NOT_FOUND',
    vi: 'Không tìm thấy địa điểm trong danh sách yêu thích.',
    en: 'Favorite item not found.'
  },
  4007: {
    key: 'FAVORITE_ALREADY_EXISTS',
    vi: 'Địa điểm này đã có trong danh sách yêu thích của bạn.',
    en: 'Location is already in your favorites.'
  },
  4008: {
    key: 'REVIEW_NOT_FOUND',
    vi: 'Không tìm thấy đánh giá.',
    en: 'Review not found.'
  },
  4009: {
    key: 'SUBSCRIPTION_NOT_FOUND',
    vi: 'Không tìm thấy gói đăng ký.',
    en: 'Subscription not found.'
  },
  4010: {
    key: 'UNAUTHORIZED_ACTION',
    vi: 'Bạn không có quyền thực hiện hành động này.',
    en: 'You do not have permission to perform this action.'
  },
  4011: {
    key: 'IMAGE_REQUIRED',
    vi: 'Vui lòng chọn tệp hình ảnh.',
    en: 'Image file is required.'
  },
  4012: {
    key: 'INVALID_IMAGE_TYPE',
    vi: 'Chỉ hỗ trợ tải lên các tệp định dạng hình ảnh.',
    en: 'Only image files are supported.'
  },
  4013: {
    key: 'IMAGE_TOO_LARGE',
    vi: 'Kích thước ảnh không được vượt quá 10 MB.',
    en: 'Image size must not exceed 10 MB.'
  },
  4014: {
    key: 'IMAGE_UPLOAD_FAILED',
    vi: 'Tải ảnh lên thất bại. Vui lòng thử lại.',
    en: 'Failed to upload image.'
  },
  4020: {
    key: 'SOURCE_REQUIRED',
    vi: 'Nguồn POI (OSM/OVERTURE) là bắt buộc.',
    en: 'POI Source (OSM/OVERTURE) is required.'
  },
  4021: {
    key: 'FILE_PATH_REQUIRED',
    vi: 'Đường dẫn tệp là bắt buộc.',
    en: 'File path is required.'
  },
  4022: {
    key: 'INVALID_POI_FILE',
    vi: 'Tệp POI hoặc định dạng không hợp lệ.',
    en: 'Invalid POI file or format.'
  },
  4023: {
    key: 'POI_FILE_NOT_FOUND',
    vi: 'Không tìm thấy tệp POI trên máy chủ.',
    en: 'POI file not found on server.'
  },
  4024: {
    key: 'POI_IMPORT_FAILED',
    vi: 'Nhập dữ liệu POI thất bại.',
    en: 'Failed to import POI data.'
  },

  // 5000 - 5999: Chuyến đi & Lập lịch trình
  5001: {
    key: 'TRIP_NAME_REQUIRED',
    vi: 'Tên chuyến đi không được để trống.',
    en: 'Trip name is required.'
  },
  5002: {
    key: 'TRIP_DATES_REQUIRED',
    vi: 'Ngày đi - về không được để trống.',
    en: 'Trip dates are required.'
  },
  5003: {
    key: 'DESTINATION_REQUIRED',
    vi: 'Điểm đến không được để trống.',
    en: 'Destination is required.'
  },
  5004: {
    key: 'COMPANIONS_REQUIRED',
    vi: 'Thông tin người đi cùng không được để trống.',
    en: 'Companions information is required.'
  },
  5005: {
    key: 'PASSENGER_COUNT_REQUIRED',
    vi: 'Số lượng người không được để trống.',
    en: 'Passenger count is required.'
  },
  5006: {
    key: 'TRAVEL_STYLE_REQUIRED',
    vi: 'Phong cách chuyến đi không được để trống.',
    en: 'Travel style is required.'
  },
  5007: {
    key: 'TRIP_NOT_FOUND',
    vi: 'Không tìm thấy chuyến đi.',
    en: 'Trip not found.'
  },
  5008: {
    key: 'TRIP_CONFLICT',
    vi: 'Chuyến đi đã được cập nhật bởi tiến trình khác. Vui lòng làm mới trang.',
    en: 'Trip has been modified by another process. Please refresh and try again.'
  },
  5009: {
    key: 'REPLAN_PROPOSAL_EXPIRED',
    vi: 'Đề xuất lập lại lịch trình đã hết hạn hoặc không tồn tại. Vui lòng tạo bản xem trước mới.',
    en: 'Replan proposal has expired or does not exist. Please request a new preview.'
  },
  5010: {
    key: 'REPLAN_PROPOSAL_INVALID',
    vi: 'Xác thực đề xuất lập lại lịch trình thất bại.',
    en: 'Replan proposal validation failed.'
  },
  5011: {
    key: 'TRIP_LOCATION_NOT_FOUND',
    vi: 'Không tìm thấy địa điểm trong chuyến đi.',
    en: 'Trip location not found.'
  },

  // 6000 - 6999: Thanh toán
  6001: {
    key: 'PAYMENT_NOT_FOUND',
    vi: 'Không tìm thấy thông tin thanh toán.',
    en: 'Payment not found.'
  },
  6002: {
    key: 'PAYMENT_ALREADY_PAID',
    vi: 'Giao dịch thanh toán đã hoàn tất.',
    en: 'Payment is already completed.'
  },
  6003: {
    key: 'PAYMENT_INVALID_SIGNATURE',
    vi: 'Chữ ký webhook thanh toán không hợp lệ.',
    en: 'Invalid webhook signature.'
  },
  6004: {
    key: 'PAYMENT_CREATION_FAILED',
    vi: 'Tạo liên kết thanh toán thất bại.',
    en: 'Failed to create payment link.'
  },
  6005: {
    key: 'PAYMENT_AMOUNT_MISMATCH',
    vi: 'Số tiền thanh toán không trùng khớp.',
    en: 'Payment amount mismatch.'
  },
  6006: {
    key: 'PAYMENT_NOT_PENDING',
    vi: 'Thanh toán không ở trạng thái chờ xử lý.',
    en: 'Payment is not in pending state.'
  }
};

// Tạo thêm mapping ngược từ chuỗi KEY (ví dụ "USER_EXISTED") sang đối tượng
export const ERROR_KEY_MAP = Object.values(ERROR_CODE_MAP).reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

/**
 * Lấy ngôn ngữ hiện tại của ứng dụng từ localStorage (mặc định 'vi').
 */
export function getCurrentLanguage() {
  try {
    return localStorage.getItem('wayvee-lang') || 'vi';
  } catch {
    return 'vi';
  }
}

/**
 * Tìm thông điệp lỗi thân thiện dựa trên mã code số, key chuỗi hoặc response backend.
 * @param {object|number|string} errorOrCode - Mã lỗi số (vd: 1002), key chuỗi (vd: 'USER_EXISTED') hoặc object lỗi
 * @param {string} [lang] - Ngôn ngữ mong muốn ('vi' hoặc 'en'), nếu bỏ trống sẽ lấy ngôn ngữ hiện tại
 * @returns {string} Thông điệp lỗi đã dịch
 */
export function getLocalizedErrorMessage(errorOrCode, lang) {
  const currentLang = (lang || getCurrentLanguage()).toLowerCase().startsWith('en') ? 'en' : 'vi';

  if (!errorOrCode) {
    return currentLang === 'en' ? 'An unexpected error occurred.' : 'Đã có lỗi xảy ra.';
  }

  let code = null;
  let key = null;
  let backendMessage = null;

  if (typeof errorOrCode === 'number') {
    code = errorOrCode;
  } else if (typeof errorOrCode === 'string') {
    // Có thể là chuỗi số "1002" hoặc tên key "USER_EXISTED"
    if (/^\d+$/.test(errorOrCode)) {
      code = Number(errorOrCode);
    } else {
      key = errorOrCode;
    }
  } else if (typeof errorOrCode === 'object') {
    code = errorOrCode.code || errorOrCode.status || errorOrCode?.response?.code;
    key = errorOrCode.errorCode || errorOrCode?.response?.errorCode;
    backendMessage = errorOrCode.message || errorOrCode?.response?.message;
  }

  // 1. Tìm theo mã số code (vd: 1002, 1005)
  if (code && ERROR_CODE_MAP[code]) {
    return ERROR_CODE_MAP[code][currentLang];
  }

  // 2. Tìm theo key chuỗi (vd: 'USER_EXISTED', 'OTP_EXPIRED')
  if (key && ERROR_KEY_MAP[key]) {
    return ERROR_KEY_MAP[key][currentLang];
  }

  // 3. Nếu backend trả về thông báo cụ thể (và không phải thông báo generic)
  if (backendMessage && typeof backendMessage === 'string') {
    const lower = backendMessage.toLowerCase();
    // Bỏ qua các chuỗi chung chung
    const isGeneric =
      lower.includes('uncategorized error') ||
      lower.includes('uncategorized exception') ||
      lower.includes('failed with status');

    if (!isGeneric) {
      return backendMessage;
    }
  }

  // 4. Fallback mặc định
  return currentLang === 'en'
    ? 'An error occurred. Please try again.'
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}
