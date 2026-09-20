const defaults = { firstName: 'Anh', lastName: 'Phương', email: '', phone: '', gender: '', birthday: '2000-01-01', city: 'Hồ Chí Minh', address: '123 Hai Bà Trưng' };
export const profileKey = (email) => 'wayvee-profile:' + email;
export function readProfile(user) {
  try {
    const stored = JSON.parse(localStorage.getItem(profileKey(user.email)));
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, typeof stored?.[key] === 'string' ? stored[key] : key === 'email' ? user.email : value]));
  } catch { return { ...defaults, email: user.email }; }
}

