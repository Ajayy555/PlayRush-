import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Users, MapPin, Camera, Link2, BarChart2, Shield,
  Eye, Loader, RefreshCw, LogOut, Zap, Globe,
  CheckCircle, XCircle, Clock, ChevronRight, Lock, Key, Navigation, ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

// Fix leaflet default icon in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom map recenter controller
function RecenterMap({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

const TABS = [
  { id: 'overview',       label: 'Dashboard',    icon: <BarChart2 size={16} /> },
  { id: 'users',          label: 'Players',      icon: <Users size={16} /> },
  { id: 'visitors',       label: 'Visitors',     icon: <Eye size={16} /> },
  { id: 'locations',      label: 'Location Map', icon: <MapPin size={16} /> },
  { id: 'verifications',  label: 'Verifications',icon: <Camera size={16} /> },
  { id: 'links',          label: 'Short Links',  icon: <Link2 size={16} /> },
];

function StatCard({ label, value, icon, color, sub }) {
  return (
    <motion.div
      className="stat-card glass"
      whileHover={{ y: -4, boxShadow: `0 12px 32px ${color}33` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="stat-card-icon" style={{ color, background: `${color}18` }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <span className="stat-card-value">{value ?? '—'}</span>
        <span className="stat-card-label">{label}</span>
        {sub && <span className="stat-card-sub">{sub}</span>}
      </div>
    </motion.div>
  );
}

function DataTable({ columns, data, renderRow, emptyMsg = 'No data yet' }) {
  return (
    <div className="admin-table-scroll">
      {data.length === 0 ? (
        <div className="empty-state">
          <Globe size={40} />
          <p>{emptyMsg}</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>{data.map(renderRow)}</tbody>
        </table>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, login, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [links, setLinks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // Dedicated single player/visitor map modal
  const [mapModalTarget, setMapModalTarget] = useState(null);
  // Center for the main map tab
  const [activeMapCenter, setActiveMapCenter] = useState(null);

  // Admin login credentials (prefilled from .env defaults)
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginErr, setAdminLoginErr] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u, vis, loc, ver, lnk] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/visitors'),
        api.get('/api/admin/locations'),
        api.get('/api/admin/verifications'),
        api.get('/api/links'),
      ]);
      setStats(s.data.data);
      setUsers(u.data.data);
      setVisitors(vis.data.data);
      setLocations(loc.data.data);
      setVerifications(ver.data.data);
      setLinks(lnk.data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAll();
    }
  }, [user, loadAll]);

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    if (!adminUser.trim()) {
      setAdminLoginErr('Please enter admin username or email');
      return;
    }
    if (!adminPass) {
      setAdminLoginErr('Please enter admin password');
      return;
    }
    setAdminLoginLoading(true);
    setAdminLoginErr('');
    const res = await login(adminUser.trim(), adminPass);
    setAdminLoginLoading(false);
    if (!res.success) {
      setAdminLoginErr(res.message);
    }
  };

  // Helper to jump to full location map
  const openInFullMap = (lat, lng) => {
    setActiveMapCenter([lat, lng]);
    setMapModalTarget(null);
    setSelectedUser(null);
    setTab('locations');
  };

  // Helper to open quick map modal for player or visitor
  const openQuickMap = (target) => {
    setMapModalTarget(target);
  };

  // If not logged in or not ADMIN, show clean dedicated Admin Login Screen
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-login-screen">
        <motion.div
          className="admin-login-card glass"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
        >
          <div className="admin-login-icon">
            <Shield size={36} color="var(--color-accent-2)" />
          </div>
          <h2>PlayRush Admin Portal</h2>
          <p className="admin-login-sub">
            Real-time player verification, Cloudinary CDN photos, and regional GPS analytics.
          </p>

          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <div className="form-group">
              <label>Admin Username / Email</label>
              <div className="input-wrapper">
                <Users size={16} className="input-icon" />
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin@playrush.com"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Admin Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {adminLoginErr && <p className="form-error center">{adminLoginErr}</p>}

            <motion.button
              type="submit"
              className="btn-primary full"
              disabled={adminLoginLoading}
              whileTap={{ scale: 0.97 }}
            >
              {adminLoginLoading ? (
                <>
                  <Loader size={16} className="spin" /> Authenticating…
                </>
              ) : (
                '🔐 Access Admin Dashboard'
              )}
            </motion.button>
          </form>

          <div className="admin-login-hint">
            <span>Configured in .env:</span>
            <code>{adminUser}</code> / <code>Admin@123</code>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Zap size={40} style={{ color: 'var(--color-accent)' }} />
        </motion.div>
        <p>Loading PlayRush Admin…</p>
      </div>
    );
  }

  // Default Map center: use activeMapCenter, or first location, or India center
  const mapCenter = activeMapCenter || (locations[0]
    ? [locations[0].latitude, locations[0].longitude]
    : [20.5937, 78.9629]);

  return (
    <div className={`admin-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* ── Quick Map Modal (Pop-up from Player Profile or Visitor row) ── */}
      <AnimatePresence>
        {mapModalTarget && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMapModalTarget(null)}
            style={{ zIndex: 100000 }}
          >
            <motion.div
              className="quick-map-modal glass"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.88, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 30 }}
            >
              <div className="quick-map-header">
                <div className="quick-map-title">
                  {mapModalTarget.photo ? (
                    <img src={mapModalTarget.photo} alt="" className="quick-map-avatar" />
                  ) : (
                    <div className="quick-map-avatar-ph">📍</div>
                  )}
                  <div>
                    <h4>{mapModalTarget.title}</h4>
                    <span className="quick-map-coords">
                      GPS: {mapModalTarget.lat?.toFixed(5)}, {mapModalTarget.lng?.toFixed(5)}
                      {mapModalTarget.accuracy ? ` (±${mapModalTarget.accuracy.toFixed(0)}m)` : ''}
                    </span>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setMapModalTarget(null)}>
                  <XCircle size={20} />
                </button>
              </div>

              {/* Leaflet Map Preview */}
              <div className="quick-map-view">
                <MapContainer
                  center={[mapModalTarget.lat, mapModalTarget.lng]}
                  zoom={13}
                  className="quick-leaflet-map"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[mapModalTarget.lat, mapModalTarget.lng]}>
                    <Popup>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                        <strong>{mapModalTarget.title}</strong><br />
                        Lat: {mapModalTarget.lat?.toFixed(5)}<br />
                        Lng: {mapModalTarget.lng?.toFixed(5)}<br />
                        {mapModalTarget.sub && <span>{mapModalTarget.sub}</span>}
                      </div>
                    </Popup>
                    {mapModalTarget.accuracy && (
                      <Circle
                        center={[mapModalTarget.lat, mapModalTarget.lng]}
                        radius={mapModalTarget.accuracy}
                        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.15, weight: 2 }}
                      />
                    )}
                  </Marker>
                </MapContainer>
              </div>

              <div className="quick-map-footer">
                <button
                  className="btn-primary full"
                  onClick={() => openInFullMap(mapModalTarget.lat, mapModalTarget.lng)}
                >
                  <Navigation size={16} /> Open in Full Location Map Tab
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <div className="admin-sidebar">
        <div className="admin-brand" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }}>
          <Zap size={20} />
          {sidebarOpen && <span>PlayRush</span>}
        </div>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`sidebar-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            title={t.label}
          >
            {t.icon}
            {sidebarOpen && <span>{t.label}</span>}
          </button>
        ))}
        <div className="sidebar-spacer" />
        <button className="sidebar-btn sidebar-logout" onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={16} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* ── Main Area ── */}
      <div className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div>
            <h1>{TABS.find((t) => t.id === tab)?.label}</h1>
            <span className="admin-breadcrumb">PlayRush Admin / {TABS.find((t) => t.id === tab)?.label}</span>
          </div>
          <div className="admin-topbar-right">
            <button className="btn-refresh" onClick={loadAll} title="Refresh data">
              <RefreshCw size={16} />
            </button>
            {user?.profilePhoto && <img src={user.profilePhoto} alt="admin" className="admin-avatar" />}
            <span className="admin-user">{user?.username}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ──────────── OVERVIEW ──────────── */}
          {tab === 'overview' && stats && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="stats-grid">
                <StatCard label="Total Players"     value={stats.totalUsers}         icon={<Users size={22}/>}    color="#8b5cf6" />
                <StatCard label="Visitors"          value={stats.totalVisitors}      icon={<Eye size={22}/>}      color="#06b6d4" />
                <StatCard label="Location Consents" value={stats.totalLocations}     icon={<MapPin size={22}/>}   color="#22c55e" sub="Verified locations" />
                <StatCard label="Face Verified"     value={stats.totalVerifications} icon={<Camera size={22}/>}   color="#f59e0b" />
                <StatCard label="Short Links"       value={stats.totalLinks}         icon={<Link2 size={22}/>}    color="#ec4899" sub={`${stats.activeLinks} active`} />
                <StatCard label="Total Clicks"      value={stats.totalClicks}        icon={<BarChart2 size={22}/>} color="#0ea5e9" />
              </div>

              {/* Recent users mini table */}
              <div className="admin-section">
                <div className="section-title-row">
                  <h3>Recent Players</h3>
                  <button className="link-view-all" onClick={() => setTab('users')}>
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead><tr><th>Photo</th><th>Username</th><th>Location</th><th>Action</th><th>Joined</th></tr></thead>
                    <tbody>
                      {users.slice(0, 5).map((u) => (
                        <tr key={u._id}>
                          <td>{u.profilePhoto
                            ? <img src={u.profilePhoto} alt="" className="table-avatar" />
                            : <div className="avatar-placeholder">👤</div>}
                          </td>
                          <td><strong>{u.username}</strong></td>
                          <td className="text-muted">
                            {u.location?.latitude
                              ? `${u.location.latitude.toFixed(3)}, ${u.location.longitude.toFixed(3)}`
                              : '—'}
                          </td>
                          <td>
                            {u.location?.latitude ? (
                              <button
                                className="btn-map-badge"
                                onClick={() => openQuickMap({
                                  title: `Player: ${u.username}`,
                                  lat: u.location.latitude,
                                  lng: u.location.longitude,
                                  accuracy: u.location.accuracy,
                                  photo: u.profilePhoto,
                                  sub: `Joined: ${new Date(u.createdAt).toLocaleDateString('en-IN')}`,
                                })}
                              >
                                <MapPin size={12} /> View Map
                              </button>
                            ) : (
                              <span className="text-muted small">No GPS</span>
                            )}
                          </td>
                          <td className="text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ──────────── PLAYERS ──────────── */}
          {tab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="admin-section-header">
                <span className="badge">{users.length} Players</span>
                <span className="text-muted small">Click any player to inspect profile and view live GPS location map</span>
              </div>
              <div className="players-grid">
                {users.map((u) => (
                  <motion.div
                    key={u._id}
                    className="player-card glass"
                    whileHover={{ y: -4 }}
                  >
                    <div className="player-photo-wrap" onClick={() => setSelectedUser(u)}>
                      {u.profilePhoto
                        ? <img src={u.profilePhoto} alt={u.username} className="player-photo" />
                        : <div className="player-no-photo">👤</div>
                      }
                      <span className="player-verified-badge">
                        {u.profilePhoto ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      </span>
                    </div>
                    <div className="player-info" onClick={() => setSelectedUser(u)}>
                      <strong>{u.username}</strong>
                      <span className="text-muted small">
                        {u.location?.latitude
                          ? `📍 ${u.location.latitude.toFixed(2)}, ${u.location.longitude.toFixed(2)}`
                          : '📍 No location'}
                      </span>
                      <span className="text-muted small">
                        <Clock size={11} /> {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    {/* Direct Map Action Button on Player Card */}
                    {u.location?.latitude && (
                      <button
                        className="player-map-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickMap({
                            title: `Player: ${u.username}`,
                            lat: u.location.latitude,
                            lng: u.location.longitude,
                            accuracy: u.location.accuracy,
                            photo: u.profilePhoto,
                            sub: `Joined: ${new Date(u.createdAt).toLocaleDateString('en-IN')}`,
                          });
                        }}
                      >
                        <MapPin size={13} /> View on Map
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Player detail modal */}
              <AnimatePresence>
                {selectedUser && (
                  <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedUser(null)}>
                    <motion.div className="player-detail-modal glass" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <button className="modal-close" onClick={() => setSelectedUser(null)}><XCircle size={18}/></button>
                      <div className="player-detail-photo">
                        {selectedUser.profilePhoto
                          ? <img src={selectedUser.profilePhoto} alt={selectedUser.username} />
                          : <div className="player-no-photo large">👤</div>
                        }
                      </div>
                      <h3>{selectedUser.username}</h3>
                      <div className="player-detail-rows">
                        <div className="detail-row"><span>Role</span><span>{selectedUser.role}</span></div>
                        <div className="detail-row"><span>Session</span><span className="mono">{selectedUser.sessionId?.slice(0,12) || '—'}</span></div>
                        <div className="detail-row"><span>Latitude</span><span>{selectedUser.location?.latitude?.toFixed(6) || '—'}</span></div>
                        <div className="detail-row"><span>Longitude</span><span>{selectedUser.location?.longitude?.toFixed(6) || '—'}</span></div>
                        <div className="detail-row"><span>Accuracy</span><span>{selectedUser.location?.accuracy ? `${selectedUser.location.accuracy.toFixed(0)}m` : '—'}</span></div>
                        <div className="detail-row"><span>Joined</span><span>{new Date(selectedUser.createdAt).toLocaleString('en-IN')}</span></div>
                      </div>

                      {/* Map Action inside Modal */}
                      {selectedUser.location?.latitude && (
                        <div style={{ marginTop: 16 }}>
                          <button
                            className="btn-primary full"
                            onClick={() => {
                              openQuickMap({
                                title: `Player: ${selectedUser.username}`,
                                lat: selectedUser.location.latitude,
                                lng: selectedUser.location.longitude,
                                accuracy: selectedUser.location.accuracy,
                                photo: selectedUser.profilePhoto,
                                sub: `Joined: ${new Date(selectedUser.createdAt).toLocaleDateString('en-IN')}`,
                              });
                            }}
                          >
                            <MapPin size={16} /> Open Location Map
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ──────────── VISITORS ──────────── */}
          {tab === 'visitors' && (
            <motion.div key="visitors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="admin-section-header">
                <span className="badge">{visitors.length} Sessions</span>
                <span className="text-muted small">Inspect visitor analytics and click 'View Map' for visitors who granted GPS</span>
              </div>
              <DataTable
                columns={['Session ID', 'Location Map', 'Browser/OS', 'Language', 'Timezone', 'Screen', 'Time']}
                data={visitors}
                emptyMsg="No visitors yet"
                renderRow={(v) => {
                  const vLoc = locations.find((l) => l.sessionId === v.sessionId);
                  return (
                    <tr key={v._id}>
                      <td className="mono small">{v.sessionId?.slice(0,10)}…</td>
                      <td>
                        {vLoc ? (
                          <button
                            className="btn-map-badge"
                            onClick={() => openQuickMap({
                              title: `Visitor Session: ${v.sessionId?.slice(0,8)}`,
                              lat: vLoc.latitude,
                              lng: vLoc.longitude,
                              accuracy: vLoc.accuracy,
                              photo: null,
                              sub: `Browser: ${v.userAgent?.slice(0, 30)}`,
                            })}
                          >
                            <MapPin size={12} /> 📍 View Map
                          </button>
                        ) : (
                          <span className="text-muted small">No GPS</span>
                        )}
                      </td>
                      <td className="small" style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.userAgent?.slice(0, 40) || '—'}…
                      </td>
                      <td>{v.language || '—'}</td>
                      <td className="small">{v.timezone || '—'}</td>
                      <td>{v.screenWidth && v.screenHeight ? `${v.screenWidth}×${v.screenHeight}` : '—'}</td>
                      <td className="small text-muted">{new Date(v.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  );
                }}
              />
            </motion.div>
          )}

          {/* ──────────── LOCATION MAP ──────────── */}
          {tab === 'locations' && (
            <motion.div key="locations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="admin-section-header">
                <span className="badge">{locations.length} Location Events</span>
                <span className="text-muted small">Real-time GPS markers of all registered players &amp; visitors</span>
              </div>

              {/* Leaflet Map */}
              <div className="map-container-wrap">
                <MapContainer
                  center={mapCenter}
                  zoom={locations.length > 0 ? 11 : 5}
                  className="leaflet-map"
                  scrollWheelZoom={true}
                >
                  <RecenterMap center={mapCenter} zoom={activeMapCenter ? 14 : 11} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map((loc) => {
                    const matchedUser = users.find((u) => u.sessionId === loc.sessionId);
                    return (
                      <Marker key={loc._id} position={[loc.latitude, loc.longitude]}>
                        <Popup>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, minWidth: 160 }}>
                            {matchedUser ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                {matchedUser.profilePhoto && (
                                  <img src={matchedUser.profilePhoto} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                )}
                                <div>
                                  <strong>{matchedUser.username}</strong>
                                  <div style={{ fontSize: 11, color: '#22c55e' }}>✓ Verified Player</div>
                                </div>
                              </div>
                            ) : (
                              <strong>Visitor Session: {loc.sessionId?.slice(0, 8)}…</strong>
                            )}
                            <div><strong>Lat:</strong> {loc.latitude?.toFixed(5)}</div>
                            <div><strong>Lng:</strong> {loc.longitude?.toFixed(5)}</div>
                            <div><strong>Accuracy:</strong> {loc.accuracy ? `${loc.accuracy.toFixed(0)}m` : '—'}</div>
                            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                              {new Date(loc.createdAt).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </Popup>
                        {loc.accuracy && (
                          <Circle
                            center={[loc.latitude, loc.longitude]}
                            radius={loc.accuracy}
                            pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.12, weight: 1.5 }}
                          />
                        )}
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Location table below map */}
              <div className="admin-section">
                <h3 style={{ marginBottom: 14 }}>Location Records</h3>
                <DataTable
                  columns={['Session', 'Matched Player', 'Coordinates', 'Accuracy', 'Time', 'Quick Action']}
                  data={locations}
                  emptyMsg="No location records yet"
                  renderRow={(l) => {
                    const matchedUser = users.find((u) => u.sessionId === l.sessionId);
                    return (
                      <tr key={l._id}>
                        <td className="mono small">{l.sessionId?.slice(0, 10)}…</td>
                        <td>
                          {matchedUser ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {matchedUser.profilePhoto && <img src={matchedUser.profilePhoto} alt="" className="table-avatar" />}
                              <strong>{matchedUser.username}</strong>
                            </div>
                          ) : (
                            <span className="text-muted small">Guest Visitor</span>
                          )}
                        </td>
                        <td>{l.latitude?.toFixed(4)}, {l.longitude?.toFixed(4)}</td>
                        <td>{l.accuracy ? `±${l.accuracy.toFixed(0)}m` : '—'}</td>
                        <td className="text-muted small">{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                        <td>
                          <button
                            className="btn-map-badge"
                            onClick={() => openQuickMap({
                              title: matchedUser ? `Player: ${matchedUser.username}` : `Session: ${l.sessionId?.slice(0, 8)}`,
                              lat: l.latitude,
                              lng: l.longitude,
                              accuracy: l.accuracy,
                              photo: matchedUser?.profilePhoto || null,
                              sub: `Time: ${new Date(l.createdAt).toLocaleTimeString('en-IN')}`,
                            })}
                          >
                            <MapPin size={12} /> Focus Map
                          </button>
                        </td>
                      </tr>
                    );
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* ──────────── VERIFICATIONS ──────────── */}
          {tab === 'verifications' && (
            <motion.div key="verifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="admin-section-header"><span className="badge">{verifications.length} Verifications</span></div>
              <DataTable
                columns={['Session', 'Face Detected', 'Face Count', 'Camera Permission', 'Verified At']}
                data={verifications}
                emptyMsg="No verification records yet"
                renderRow={(v) => (
                  <tr key={v._id}>
                    <td className="mono small">{v.sessionId?.slice(0,10)}…</td>
                    <td>{v.faceDetected ? <span className="badge-success">✓ Yes</span> : <span className="badge-danger">✗ No</span>}</td>
                    <td>{v.faceCount ?? '—'}</td>
                    <td>{v.cameraPermission ? <span className="badge-success">✓ Granted</span> : <span className="badge-danger">✗ Denied</span>}</td>
                    <td className="text-muted small">{new Date(v.verifiedAt || v.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                )}
              />
            </motion.div>
          )}

          {/* ──────────── SHORT LINKS ──────────── */}
          {tab === 'links' && (
            <motion.div key="links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="admin-section-header">
                <span className="badge">{links.length} Links</span>
              </div>
              <DataTable
                columns={['Short Code', 'Target URL', 'Clicks', 'Created At']}
                data={links}
                emptyMsg="No links generated yet"
                renderRow={(l) => (
                  <tr key={l._id}>
                    <td><code>/r/{l.code}</code></td>
                    <td className="small" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <a href={l.targetUrl} target="_blank" rel="noreferrer" className="link-ext">
                        {l.targetUrl} <ExternalLink size={11} />
                      </a>
                    </td>
                    <td><strong>{l.clicks || 0}</strong></td>
                    <td className="text-muted small">{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
