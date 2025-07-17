import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, check if already logged in as admin (via backend, not localStorage!)
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/auth/me`, { withCredentials: true })
      .then(res => {
        if (res.data.role === 'admin') {
          navigate('/admin/users');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/login`, form, {
        withCredentials: true
      });
      // After login, verify with /api/auth/me
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, { withCredentials: true });
      if (res.data.role === 'admin') {
        navigate('/admin/users');
      } else {
        setError('Not an admin account');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  if (loading) return null; // Or a spinner

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f4f6'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Username</label>
            <input
              name="username"
              type="text"
              onChange={handleChange}
              placeholder="Enter username"
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <button type="submit" style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}>
            Login
          </button>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
