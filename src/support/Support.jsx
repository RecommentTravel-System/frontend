import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import AccountSidebar from '../components/AccountSidebar.jsx';
import Icon from '../components/AccountIcon.jsx';
import FeedbackForm from './FeedbackForm.jsx';
import './Support.css';

const helpTopics = [
  { title: 'Làm sao xem lịch trình của tôi?', answer: 'Chọn Lịch trình trên sidebar, dùng bộ lọc trạng thái rồi bấm Xem chi tiết. Hiện các chuyến đi trong bản test là dữ liệu minh họa.', to: '/itineraries', link: 'Mở lịch trình' },
  { title: 'Tôi có thể đổi ảnh đại diện ở đâu?', answer: 'Vào Thông tin cá nhân, chọn ảnh JPG, PNG hoặc WebP tối đa 5 MB, xem trước rồi bấm Lưu ảnh.', to: '/profile', link: 'Mở Profile' },
  { title: 'Làm sao lưu địa điểm yêu thích?', answer: 'Vào Yêu thích → Thêm mục yêu thích, đặt tên bộ sưu tập và chọn địa điểm. Bạn có thể chỉnh sửa bộ sưu tập hoặc bấm trái tim để bỏ lưu.', to: '/favorites', link: 'Mở yêu thích' },
  { title: 'Gói Premium và thanh toán hoạt động thế nào?', answer: 'Chọn một gói trong Premium để xem thông tin thanh toán. Bản test chưa kết nối cổng thanh toán và không thực hiện giao dịch.', to: '/payment', link: 'Xem gói Premium' },
  { title: 'Phản hồi của tôi đã được gửi chưa?', answer: 'Hiện form chỉ lưu phản hồi trên trình duyệt để test. Khi cần liên hệ trực tiếp, bạn có thể dùng email wayvee@gmail.com.' },
];

function ChatPanel() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([{ id: 'welcome', role: 'assistant', text: 'Xin chào! Mình là trợ lý hướng dẫn demo. Bạn muốn tìm hiểu về lịch trình, Premium, avatar hay mục yêu thích?' }]);
  const bottom = useRef(null);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }, [messages]);
  function send(value) {
    const message = value.trim();
    if (!message) return;
    const normalized = message.toLocaleLowerCase('vi');
    let index = -1;
    if (/lịch|chuyến|trip/.test(normalized)) index = 0;
    else if (/ảnh|avatar|avarta/.test(normalized)) index = 1;
    else if (/thích|lưu|favorite/.test(normalized)) index = 2;
    else if (/premium|gói|thanh toán/.test(normalized)) index = 3;
    else if (/phản hồi|đánh giá/.test(normalized)) index = 4;
    const answer = index >= 0 ? helpTopics[index] : { answer: 'Mình hiện chỉ hỗ trợ hướng dẫn sử dụng bản demo. Bạn có thể mở Trung tâm trợ giúp hoặc liên hệ wayvee@gmail.com để được tư vấn trực tiếp.' };
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', text: message }, { id: crypto.randomUUID(), role: 'assistant', text: answer.answer, to: answer.to, link: answer.link }]);
    setText('');
  }
  return <section className="support-chat" aria-labelledby="support-chat-heading"><h2 id="support-chat-heading">Trò chuyện ngay</h2><p className="support-subtitle">Trợ lý hướng dẫn demo · Chưa kết nối tư vấn viên trực tiếp</p><div className="support-chat-messages" role="log" aria-live="polite" aria-label="Nội dung trò chuyện">{messages.map(message => <div key={message.id} className={`support-chat-message support-chat-${message.role}`}><strong>{message.role === 'user' ? 'Bạn' : 'Wayvee · Demo'}</strong><p>{message.text}</p>{message.to && <Link to={message.to}>{message.link} →</Link>}</div>)}<div ref={bottom} /></div><div className="support-chat-suggestions">{['Lịch trình', 'Gói Premium', 'Đổi avatar'].map(label => <button key={label} type="button" onClick={() => send(label)}>{label}</button>)}</div><form className="support-chat-form" onSubmit={event => { event.preventDefault(); send(text); }}><label className="support-sr-only" htmlFor="support-message">Nhập câu hỏi</label><input id="support-message" value={text} maxLength={1000} onChange={event => setText(event.target.value)} placeholder="Bạn cần hỗ trợ điều gì?" /><button className="support-primary" type="submit" disabled={!text.trim()}>Gửi</button></form></section>;
}

export default function Support() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const view = params.get('view');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState({ rating: 0, comment: '', email: user?.mode === 'flow-test' ? '' : user?.email || '' });
  const choices = [{ view: 'chat', icon: 'review', label: 'Trò chuyện ngay' }, { view: 'help', icon: 'support', label: 'Trung tâm trợ giúp' }, { view: 'feedback', icon: 'review', label: 'Gửi phản hồi' }];
  return <div className="support-page"><SiteHeader /><main className="account-layout support-layout"><AccountSidebar onNotice={setNotice} /><section className="support-panel" aria-labelledby="support-heading"><header className="support-heading"><h1 id="support-heading">Hỗ trợ &amp; Phản hồi</h1><p>Bạn cần trợ giúp hoặc muốn góp ý? Chúng tôi luôn sẵn sàng lắng nghe.</p></header><nav className="support-options" aria-label="Các mục hỗ trợ">{choices.map(choice => <Link key={choice.view} to={`/support?view=${choice.view}`} className={view === choice.view ? 'is-active' : ''} aria-current={view === choice.view ? 'page' : undefined}><Icon name={choice.icon} /><span>{choice.label}</span><span aria-hidden="true">›</span></Link>)}</nav>
    {view === 'chat' && <ChatPanel />}
    {view === 'help' && <section className="support-help" aria-labelledby="support-help-heading"><h2 id="support-help-heading">Trung tâm trợ giúp</h2>{helpTopics.map(topic => <details key={topic.title}><summary>{topic.title}</summary><p>{topic.answer}</p>{topic.to && <Link to={topic.to}>{topic.link} →</Link>}</details>)}<p className="support-contact">Cần thêm trợ giúp? <a href="mailto:wayvee@gmail.com">Liên hệ qua email</a></p></section>}
    {notice && <p className="support-notice" role="status">{notice}</p>}
  </section></main><SiteFooter />{view === 'feedback' && <FeedbackForm user={user} draft={draft} onDraftChange={setDraft} onClose={() => { const next = new URLSearchParams(params); next.delete('view'); setParams(next, { replace: true }); }} />}</div>;
}
