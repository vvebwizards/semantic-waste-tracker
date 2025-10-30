import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import '../styles/auth.css';

const Login = () => {
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '', 
    password: '',
    rememberMe: false
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.username, formData.password);
      
      
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bubbles">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="auth-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <i className="fas fa-recycle"></i>
            <span>EcoGestion</span>
          </Link>
          <h1>Content de vous revoir</h1>
          <p>Connectez-vous à votre compte pour continuer</p>
        </div>

        {error && (
          <div 
            className="alert alert-error" 
            style={{
              background: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '6px',
              margin: '15px 0',
              border: '1px solid #fcc',
              fontSize: '14px'
            }}
          >
            <strong>❌ Erreur:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur *</label> 
            <div className="input-wrapper">
              <i className="fas fa-user input-icon"></i> 
              <input
                type="text" 
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Votre nom d'utilisateur" 
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Mot de passe *</label>
              <Link to="/forgot-password" className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="input-wrapper">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              Se souvenir de moi
            </label>
          </div>

          <button 
            type="submit" 
            className="auth-btn primary"
            disabled={isLoading}
          >
            <i className="fas fa-sign-in-alt"></i>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;