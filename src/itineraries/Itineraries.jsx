import { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import AccountSidebar from '../components/AccountSidebar.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import Icon from '../components/AccountIcon.jsx';
import { useAuth } from '../auth/useAuth.js';
import { readProfile } from '../profile/profileStorage.js';
import { filters, getAllTrips, shortDate } from './trips.js';
import { api } from '../shared/lib/api.js';
import './Itineraries.css';
import '../tours/CreateTour.css';

function TripImage({ trip }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="trip-image">
      {failed ? (
        <Icon name="calendar" width="32" height="32" />
      ) : (
        <img src={trip.image} alt={trip.destination} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

function StatusBadge({ confirmed, hasItinerary }) {
  if (hasItinerary === false) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          borderColor: '#f59e0b',
          color: '#d97706',
          backgroundColor: '#fffbeb',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 600,
          border: '1px solid #fde68a'
        }}
      >
        ⚠ Chưa có lịch trình
      </span>
    );
  }

  return (
    <span className={`trip-badge${confirmed ? '' : ' trip-badge-pending'}`}>
      {confirmed ? 'Đã xác nhận' : 'Đang chờ'}
    </span>
  );
}

function EmptyTrips() {
  return (
    <div className="trips-empty">
      <svg className="trips-empty-art" width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
        <path d="M50 40 32 22C14 5 3 29 17 41l21 22 22-24C74 22 52 10 43 24" stroke="#929eaf" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M39 69h20c20 0 21 20 0 20H24c-21 0-22 22 0 22h47" stroke="#647080" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 7" />
        <rect x="93" y="60" width="43" height="49" rx="5" stroke="#535c69" strokeWidth="6" />
        <path d="M106 60v-9h18v9m-21-9h24m-26 22h26m-24 37v7m25-7v7" stroke="#535c69" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <Link to="/#destinations" className="trips-explore">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="10" cy="10" r="6" />
          <path d="m15 15 6 6" />
        </svg>
        Bắt đầu khám phá
      </Link>
      <h2>Bạn chưa có lịch trình nào.</h2>
      <p>Tạo hành trình đầu tiên và bắt đầu chuyến đi của bạn ngay!</p>
    </div>
  );
}

function TripList({ filter, allTrips, onCreateItinerary }) {
  const visibleTrips = allTrips.filter((trip) => filter.id === 'all' || trip.status === filter.id);
  if (!visibleTrips.length) {
    return (
      <section className="trips-panel trips-empty-panel">
        <EmptyTrips />
      </section>
    );
  }

  return (
    <section className="trips-panel" aria-labelledby="trips-heading">
      <header className="trips-heading">
        <h1 id="trips-heading">{filter.title}</h1>
        <p>Xem và quản lý các hành trình hiện tại của bạn.</p>
      </header>

      <ul className="trips-list">
        {visibleTrips.map((trip) => (
          <li key={trip.id} className="trip-row">
            <TripImage trip={trip} />
            <div className="trip-row-body">
              <div className="trip-row-top">
                <h2>
                  <Link to={`/itineraries/${trip.id}?status=${filter.id}`}>{trip.title}</Link>
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge confirmed={trip.confirmed} hasItinerary={trip.hasItinerary} />
                  {trip.hasItinerary === false && (
                    <button
                      type="button"
                      onClick={() => onCreateItinerary(trip)}
                      style={{
                        background: '#002d54',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ✨ Tạo lịch trình
                    </button>
                  )}
                </div>
              </div>

              <div className="trip-row-bottom">
                <dl className="trip-metadata">
                  <div>
                    <dt>Ngày đi:</dt>
                    <dd>{shortDate(trip.start)}</dd>
                  </div>
                  <div>
                    <dt>Ngày về:</dt>
                    <dd>{shortDate(trip.end)}</dd>
                  </div>
                  <div>
                    <dt>Số người:</dt>
                    <dd>{trip.guests}</dd>
                  </div>
                </dl>
                <Link className="trip-detail-link" to={`/itineraries/${trip.id}?status=${filter.id}`}>
                  Xem chi tiết<span className="trip-sr-only"> {trip.title}</span>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="trips-demo-note">Lịch trình minh họa</p>
    </section>
  );
}

function TravelDate({ label, date, time }) {
  const [, month, day] = date.split('-');
  return (
    <div className="trip-date">
      <span>{label}</span>
      <strong>{Number(day)}</strong>
      <b>Tháng {Number(month)}</b>
      <small>
        <Icon name="calendar" width="12" height="12" />
        {time}
      </small>
    </div>
  );
}

function TripDetail({ trip, filter, user, onCreateItinerary }) {
  const profile = readProfile(user);
  if (!trip) {
    return (
      <section className="trips-panel trips-empty-panel">
        <h1>Không tìm thấy lịch trình</h1>
        <Link to="/itineraries">Quay lại lịch trình</Link>
      </section>
    );
  }

  return (
    <div className="trip-detail">
      <Link className="trip-back" to={`/itineraries?status=${filter.id}`}>
        ‹ <span>Quay lại lịch trình</span>
      </Link>

      {/* Unassigned Itinerary Warning Banner */}
      {trip.hasItinerary === false && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠</span>
            <div>
              <strong style={{ fontSize: '13px', color: '#92400e', display: 'block' }}>
                Chưa có lịch trình chi tiết
              </strong>
              <span style={{ fontSize: '11px', color: '#b45309' }}>
                Bạn đã lưu {trip.places.length} địa điểm cho chuyến đi này nhưng chưa chia theo ngày.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCreateItinerary(trip)}
            style={{
              background: '#002d54',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ✨ Tạo lịch trình ngay
          </button>
        </div>
      )}

      <section className="trip-summary" aria-labelledby="trip-title">
        <TripImage trip={trip} />
        <div className="trip-summary-title">
          <h1 id="trip-title">{trip.title}</h1>
          <p>{trip.destination}</p>
        </div>
        <div className="trip-dates">
          <TravelDate label="Bắt đầu" date={trip.start} time={trip.time} />
          <TravelDate label="Kết thúc" date={trip.end} time={trip.time} />
          <div className="trip-duration">
            <StatusBadge confirmed={trip.confirmed} hasItinerary={trip.hasItinerary} />
            <span>Thời lượng</span>
            <strong>{trip.duration}</strong>
          </div>
        </div>
      </section>

      <section className="trip-details-panel">
        <div className="trip-overview">
          <h2>Tổng quan hành trình</h2>
          <h3>{trip.summary}</h3>
          <p>{trip.description}</p>
        </div>

        <div className="trip-destinations">
          <div>
            <h2>Địa điểm đã lưu ({trip.places.length})</h2>
            <ul>
              {trip.places.map((place) => (
                <li key={place}>📍 {place}</li>
              ))}
            </ul>
          </div>
          <a
            className="trip-map"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`Mở bản đồ ${trip.destination}`}
          >
            <svg viewBox="0 0 240 124" fill="none" aria-hidden="true">
              <rect width="240" height="124" fill="#f1f2ef" />
              <path d="M165 0c-24 25 28 48 3 77s10 47 10 47h62V0" fill="#d4eafa" />
              <path d="M15 0 55 124M63 0 89 124M0 29h173M0 84h167M110 0v124M0 115 170 12" stroke="#fff" strokeWidth="9" />
              <path d="M25 0 68 124M0 62l169-18" stroke="#f2d9a3" strokeWidth="4" />
              <rect x="121" y="74" width="25" height="23" rx="5" fill="#d5e5ce" />
              <path d="M123 29a12 12 0 0 0-24 0c0 9 12 19 12 19s12-10 12-19Z" fill="#315c75" />
              <circle cx="111" cy="29" r="4" fill="white" />
            </svg>
            <span>Mở bản đồ ↗</span>
          </a>
        </div>

        <div className="trip-participants">
          <strong>Người tham gia:</strong> {profile.firstName} {profile.lastName}
          {trip.guests > 1 ? ` + ${trip.guests - 1} người` : ''}
        </div>

        <div className="trip-amenities">
          <h2>Tiện ích / Ghi chú:</h2>
          <ul>
            {trip.amenities.map((item, index) => (
              <li key={item}>
                <span aria-hidden="true">{['♧', '◇', '⌁', '▣', '♧', '⌁'][index % 6]}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="trip-detail-actions">
          <p className="trips-demo-note">Lịch trình và sơ đồ bản đồ minh họa</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {trip.hasItinerary === false && (
              <button
                type="button"
                className="trip-export"
                onClick={() => onCreateItinerary(trip)}
                style={{ background: '#002d54', color: 'white', borderColor: '#002d54', fontWeight: 600 }}
              >
                ✨ Tạo lịch trình
              </button>
            )}
            <button type="button" className="trip-export" onClick={() => window.print()}>
              Xuất PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Itineraries() {
  const { user } = useAuth();
  const { tripId } = useParams();
  const [params] = useSearchParams();
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const [remoteTrips, setRemoteTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchTrips() {
      if (!user) return;
      try {
        setIsLoading(true);
        const res = await api.get('/api/v1/trips/me');
        if (mounted && res && res.data && Array.isArray(res.data)) {
          const mapped = res.data.map((beTrip) => {
            const startStr = beTrip.startDate ? String(beTrip.startDate) : '2025-07-16';
            const endStr = beTrip.endDate ? String(beTrip.endDate) : '2025-07-24';
            const statusMap = {
              PLANNING: 'ongoing',
              IN_PROGRESS: 'ongoing',
              COMPLETED: 'completed',
              CANCELLED: 'cancelled'
            };
            return {
              id: String(beTrip.tripId),
              title: beTrip.tripName || 'Chuyến đi của tôi',
              destination: 'Việt Nam',
              image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80',
              status: statusMap[beTrip.status] || 'ongoing',
              confirmed: Boolean(beTrip.itineraryArranged),
              hasItinerary: Boolean(beTrip.itineraryArranged),
              start: startStr,
              end: endStr,
              time: '08:00 – 18:00',
              duration: '4N / 3Đ',
              guests: 2,
              summary: '2 người · Lịch trình đồng bộ từ tài khoản',
              description: `Chuyến đi ${beTrip.tripName} đã được lưu vào hệ thống của bạn.`,
              places: ['Hà Nội', 'TP. Hồ Chí Minh'],
              amenities: ['WiFi', 'Check-in', 'Bản đồ số', 'Hướng dẫn viên']
            };
          });
          setRemoteTrips(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch remote trips:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchTrips();
    return () => { mounted = false; };
  }, [user]);

  const allTrips = useMemo(() => {
    const base = getAllTrips();
    if (!remoteTrips.length) return base;
    const ids = new Set(remoteTrips.map((t) => t.id));
    return [...remoteTrips, ...base.filter((t) => !ids.has(t.id))];
  }, [remoteTrips]);

  const filter = filters.find((item) => item.id === params.get('status')) || filters[0];

  const handleCreateItinerary = (trip) => {
    navigate('/trip/create', {
      state: {
        tripName: trip.title,
        tripDates: trip.duration,
        destination: trip.destination,
        passengerCount: String(trip.guests || 2),
        placesList:
          trip.placesList ||
          trip.places.map((p, i) => ({
            id: `p-${i}`,
            name: p,
            location: trip.destination,
            rating: 4.8,
            score: '4.8',
            image: trip.image
          })),
        actionChoice: 'itinerary',
        daysSchedule: trip.daysSchedule || {}
      }
    });
  };

  return (
    <div className="itineraries-page">
      <SiteHeader />
      <main className="account-layout itineraries-layout">
        <AccountSidebar onNotice={setNotice} />
        <div className="itineraries-content">
          {tripId ? (
            <TripDetail
              trip={allTrips.find((trip) => trip.id === tripId)}
              filter={filter}
              user={user}
              onCreateItinerary={handleCreateItinerary}
            />
          ) : (
            <TripList
              filter={filter}
              allTrips={allTrips}
              onCreateItinerary={handleCreateItinerary}
            />
          )}
          {notice && (
            <p className="trips-notice" role="status">
              {notice}
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}