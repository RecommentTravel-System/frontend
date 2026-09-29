const defaults = {
  firstName: "Anh",
  lastName: "Phương",
  email: "",
  phone: "",
  gender: "Khác",
  birthday: "2000-01-01",
  city: "Hồ Chí Minh",
  address: "123 Hai Bà Trưng"
};

export const profileKey = (email) => "wayvee-profile:" + (email || "default");

export function readProfile(user) {
  try {
    const email = user?.email || "";
    const stored = email ? JSON.parse(localStorage.getItem(profileKey(email))) : null;

    let defaultFirst = defaults.firstName;
    let defaultLast = defaults.lastName;

    if (user?.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      if (parts.length === 1) {
        defaultFirst = parts[0];
        defaultLast = "";
      } else if (parts.length > 1) {
        defaultLast = parts[0];
        defaultFirst = parts.slice(1).join(" ");
      }
    }

    return {
      ...defaults,
      firstName: defaultFirst,
      lastName: defaultLast,
      email: user?.email || defaults.email,
      phone: user?.phone || defaults.phone,
      ...(stored || {})
    };
  } catch {
    return { ...defaults, email: user?.email || "" };
  }
}
