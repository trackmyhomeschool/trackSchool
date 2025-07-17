import React from 'react';
import AdminDashboardLayout from '../../components/admin/AdminDashboardLayout';

function AdminNotFoundPage() {
  return (
    <div style={{ minHeight: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2563eb', marginBottom: 12 }}>404</h1>
        <h3 style={{ color: '#1e293b', marginBottom: 10 }}>Oops! Path is invalid.</h3>
        <p className="text-muted" style={{ fontSize: 18, marginBottom: 24 }}>The page you are looking for doesn't exist.</p>
        <a href="/admin/users" className="btn btn-primary">Go to Users</a>
      </div>
  );
}

export default AdminNotFoundPage;
