import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Timer from './Timer';





import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './App.css'; // Ensure the CSS file is imported

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenders, setTenders] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', amount: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const formRef = useRef(null);

  const fetchTenders = useCallback(async () => {
    try {
      const res = await api.get('/tenders');
      setTenders(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchTenders();
    }
  }, [token, fetchTenders]);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTenders([]);
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    try {
      if (!q.trim()) {
        fetchTenders();
      } else {
        const res = await api.get(`/tenders/search?q=${encodeURIComponent(q)}`);
        setTenders(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/tenders/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post('/tenders', form);
      }
      setForm({ name: '', phone: '', email: '', amount: '' });
      fetchTenders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (tender) => {
    setForm({
      name: tender.name,
      phone: tender.phone,
      email: tender.email,
      amount: tender.amount,
    });
    setEditingId(tender._id);

    // Scroll to form smoothly
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tenders/${id}`);
      fetchTenders();
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <form onSubmit={login} className="login-form">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">HEY MANIKANTA</h1>
        <Timer/>
        <button onClick={logout} className="btn-logout">
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </header>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`form-container ${editingId ? 'editing-mode' : ''}`} // Fix here
      >
        <h2>{editingId ? 'Edit Details' : 'Add New Details'}</h2>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            className="input"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn-submit">{editingId ? 'Update' : 'Add'}</button>
      </form>

      <input
        type="text"
        placeholder="Search by Name..."
        className="search-input"
        value={searchQuery}
        onChange={handleSearch}
      />

      <div className="tender-list">
        {tenders.map((tender) => (
          <div key={tender._id} className="tender-item">
            <div className="tender-details">
  <p><strong>Name:</strong> {tender.name}</p>
  <p><strong>Phone:</strong> {tender.phone}</p>
  <p><strong>Email:</strong> {tender.email}</p>
  <p><strong>Amount:</strong> ₹{tender.amount}</p>
  
 <p><strong>Created At:</strong> {
  tender.createdAt
    ? new Date(tender.createdAt).toLocaleString()
    : 'N/A (missing date)'
}</p>


</div>
            <div className="tender-actions">
              <button onClick={() => handleEdit(tender)} className="btn-edit">
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button onClick={() => handleDelete(tender._id)} className="btn-delete">
                <FontAwesomeIcon icon={faTrashAlt} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
