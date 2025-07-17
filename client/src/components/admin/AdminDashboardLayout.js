import axios from "axios";
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import './AdminDashboardLayout.css';



function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  // --- Touch state for swipe detection ---
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const distance = touchEndX - touchStartX;
      if (distance < -50 && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleLogout = async () => {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, { withCredentials: true });
  } catch (err) {
    console.error('Logout failed:', err.message);
  }
  navigate('/');
};


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optional: Close sidebar on route change in mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    // eslint-disable-next-line
  }, [location.pathname]);

  return (
    <div className={`admin-dashboard-wrapper ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {isMobile && (
        <div className="admin-mobile-toggle">
          <FaBars onClick={() => setSidebarOpen(prev => !prev)} />
        </div>
      )}

      <aside
        className="admin-sidebar admin-scrollable-sidebar"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`admin-sidebar-header admin-sidebar-logo${isMobile || !sidebarOpen ? ' admin-logo-left' : ''}`}>
          <h2>
            <span className="admin-title-line">Track My</span>
            <span className="admin-title-line">Homeschool</span>
          </h2>
          <p className="admin-tagline">Structure. Simplicity. Success.</p>
        </div>
        {/* Sidebar menu and other content goes here */}
        <nav className="admin-menu">
          {/* Example admin menu */}
          <div onClick={() => navigate('/admin/users')}>Users</div>
          <div onClick={() => navigate('/admin/states')}>States</div>
          <div onClick={() => navigate('/admin/resources')}>Resources</div>
          <div onClick={() => navigate('/admin/subscriptions')}>Subscriptions</div>
          <div onClick={() => navigate('/admin/support')}>Support</div>
          <div
            style={{ marginTop: 'auto', cursor: 'pointer', color: '#e11d48' }}
            onClick={handleLogout}
          >
            <FaSignOutAlt style={{ marginRight: 6 }} />
            Logout
          </div>
        </nav>
      </aside>

      <main className="admin-dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboardLayout;
