import { useRef, useState, useEffect } from 'react';
import './Profile.css';
import { AppHeader, AppFooter } from '~/shared/components';
import { LoginCard, RegisterCard } from '~/features/auth';
import { useAuth } from '~/providers/auth-provider';
import AccountSidebar from '../components/AccountSidebar.jsx';
import Avatar from '../components/AccountAvatar.jsx';
import Icon from '../components/AccountIcon.jsx';
import { readProfile, profileKey } from './profileStorage.js';
import AvatarEditor from './AvatarEditor.jsx';

export default function Profile({ user: propUser }) {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  const [authModal, setAuthModal] = useState(null);

  const [saved, setSaved] = useState(() => readProfile(user));
  const [values, setValues] = useState(saved);
  const [notice, setNotice] = useState('');
  const firstInput = useRef(null);

  useEffect(() => {
    const updated = readProfile(user);
    setSaved(updated);
    setValues(updated);
  }, [user]);

  const name = `${saved.firstName || ''} ${saved.lastName || ''}`.trim() || user?.fullName || 'Người dùng';

  const update = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setNotice('');
  };

  const save = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(profileKey(user?.email), JSON.stringify(values));
      setSaved({ ...values });
      setNotice('Đã lưu thay đổi thông tin cá nhân.');
    } catch {
      setNotice('Không thể lưu trên trình duyệt. Vui lòng thử lại.');
    }
  };

  const field = (key, label, type = 'text', placeholder = '', icon) => (
    <label className={`profile-field profile-field-${key}`}>
      <span>{label}</span>
      <div className="profile-input-wrap">
        {icon && <Icon name={icon} />}
        <input
          ref={key === 'firstName' ? firstInput : undefined}
          name={key}
          type={type}
          value={values[key] || ''}
          onChange={update}
          placeholder={placeholder}
          required={key === 'firstName' || key === 'lastName'}
          autoComplete={({ firstName: 'given-name', lastName: 'family-name', email: 'email', phone: 'tel', birthday: 'bday', address: 'street-address' })[key]}
        />
      </div>
    </label>
  );

  return (
    <div className="profile-page">
      <AppHeader
        onLogin={() => setAuthModal('login')}
        onRegister={() => setAuthModal('register')}
      />
      <main className="account-layout">
        <AccountSidebar name={name} onNotice={setNotice} />
        <section className="profile-content" aria-labelledby="profile-heading">
          <div className="profile-summary">
            <Avatar name={name} large />
            <div>
              <h1 id="profile-heading">Thông tin cá nhân</h1>
              <p>Thông tin và các hoạt động theo thời gian thực của bạn.</p>
            </div>
            <button className="profile-edit" onClick={() => firstInput.current?.focus()}>
              <Icon name="camera" />
              Chỉnh sửa
            </button>
          </div>

          <AvatarEditor user={user} name={name} />

          <form className="profile-form" onSubmit={save}>
            <div className="profile-fields">
              {field('firstName', 'Tên', 'text', '', 'user')}
              {field('lastName', 'Họ', 'text', '', 'user')}
              {field('email', 'Email', 'email', 'em***an@gmail.com', 'mail')}
              {field('phone', 'Số điện thoại', 'tel', '(+34) 000 000 000')}
              <div className="profile-personal-row">
                <label className="profile-field">
                  <span>Giới tính</span>
                  <select name="gender" value={values.gender} onChange={update}>
                    <option value="">Gender</option>
                    <option>Nữ</option>
                    <option>Nam</option>
                    <option>Khác</option>
                    <option>Không muốn tiết lộ</option>
                  </select>
                </label>
                {field('birthday', 'Ngày sinh', 'date')}
              </div>
              <label className="profile-field">
                <span>Thành phố</span>
                <select name="city" value={values.city} onChange={update}>
                  {['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế', 'Khác'].map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
              {field('address', 'Address')}
            </div>
            <div className="profile-form-bottom">
              <p className="profile-notice" role="status">
                {notice}
              </p>
              <div className="profile-form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setValues({ ...saved });
                    setNotice('Đã hủy các thay đổi chưa lưu.');
                  }}
                >
                  Hủy
                </button>
                <button type="submit">Lưu thay đổi</button>
              </div>
            </div>
          </form>
        </section>
      </main>
      <AppFooter />

      {authModal === 'login' && (
        <LoginCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onSignUp={() => setAuthModal('register')}
        />
      )}
      {authModal === 'register' && (
        <RegisterCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onLogin={() => setAuthModal('login')}
        />
      )}
    </div>
  );
}