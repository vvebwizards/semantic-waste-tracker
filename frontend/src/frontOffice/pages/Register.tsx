// pages/Register.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import '../styles/auth.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    sous_role: '',
    nom: '', // ✅ AJOUTÉ - requis par le backend
    adresse: '',
    ville: '',
    codePostal: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mainRoles = [
    { value: '', label: 'Sélectionnez votre rôle principal' },
    { value: 'Producteur', label: 'Producteur' },
    { value: 'Collecteur', label: 'Collecteur' },
    { value: 'Transporteur', label: 'Transporteur' },
    { value: 'Centre_traitement', label: 'Centre de Traitement' },
    { value: 'Superviseur', label: 'Superviseur' }
  ];

  const subRoles = {
    Producteur: [
      { value: 'Producteur_Residentiel', label: 'Résidentiel' },
      { value: 'Producteur_Commercial', label: 'Commercial' },
      { value: 'Producteur_Industriel', label: 'Industriel' },
      { value: 'Producteur_Agricole', label: 'Agricole' },
      { value: 'Producteur_Hospitalier', label: 'Hospitalier' }
    ],
    Collecteur: [
      { value: 'Collecteur_Municipal', label: 'Municipal' },
      { value: 'Collecteur_Prive', label: 'Privé' },
      { value: 'Collecteur_Conteneur', label: 'Conteneur' }
    ],
    Transporteur: [
      { value: 'Transporteur_Camion-benne', label: 'Camion-benne' },
      { value: 'Transporteur_Camion-grue', label: 'Camion-grue' },
      { value: 'Transporteur_spécialisé', label: 'Spécialisé' }
    ],
    Centre_traitement: [
      { value: 'Centre_tri', label: 'Centre de Tri' },
      { value: 'Centre_compostage', label: 'Centre de Compostage' },
      { value: 'Usine_recyclage', label: 'Usine de Recyclage' }
    ],
    Superviseur: [
      { value: 'Superviseur_Municipal', label: 'Municipal' },
      { value: 'Superviseur_Regional', label: 'Régional' },
      { value: 'Superviseur_National', label: 'National' },
      { value: 'Superviseur_Environemenatal', label: 'Environnemental' },
      { value: 'Superviseur_Securite', label: 'Sécurité' },
      { value: 'Superviseur_Qualite', label: 'Qualité' }
    ]
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'role' && { sous_role: '' })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ✅ Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    try {
      // ✅ Données exactement comme le backend les attend
      const userData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role,
        sous_role: formData.sous_role || formData.role, 
        nom: formData.nom, // ✅ INCLUS maintenant
        adresse: formData.adresse,
        ville: formData.ville,
        codePostal: formData.codePostal
      };

      console.log('📤 Données envoyées:', userData); // Pour debug

      await register(userData);
      setSuccess('Compte créé avec succès!');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur lors de la création du compte');
    }
  };

  const getCurrentSubRoles = () => {
    if (!formData.role) return [];
    return subRoles[formData.role as keyof typeof subRoles] || [];
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

      <div className="auth-card register-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <i className="fas fa-recycle"></i>
            <span>EcoGestion</span>
          </Link>
          <h1>Rejoignez-nous</h1>
          <p>Créez votre compte pour commencer à gérer vos déchets durablement</p>
        </div>

        {/* ✅ Affichage des erreurs avec style inline au cas où le CSS ne fonctionne pas */}
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
        {success && (
          <div 
            className="alert alert-success" 
            style={{
              background: '#efe',
              color: '#363',
              padding: '12px',
              borderRadius: '6px',
              margin: '15px 0',
              border: '1px solid #cfc',
              fontSize: '14px'
            }}
          >
            <strong>✅ Succès:</strong> {success}
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
                placeholder="Choisissez un nom d'utilisateur"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email *</label>
            <div className="input-wrapper">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="entrez@votre.email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* ✅ AJOUT du champ nom */}
          <div className="form-group">
            <label htmlFor="nom">Nom complet / Entreprise</label>
            <div className="input-wrapper">
              <i className="fas fa-user-tag input-icon"></i>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom ou nom d'entreprise"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Rôle principal *</label>
              <div className="input-wrapper">
                <i className="fas fa-briefcase input-icon"></i>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                >
                  {mainRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sous_role">Sous-rôle *</label>
              <div className="input-wrapper">
                <i className="fas fa-tasks input-icon"></i>
                <select
                  id="sous_role"
                  name="sous_role"
                  value={formData.sous_role}
                  onChange={handleChange}
                  required
                  disabled={isLoading || !formData.role}
                >
                  <option value="">Sélectionnez un sous-rôle</option>
                  {getCurrentSubRoles().map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adresse">Adresse</label>
            <div className="input-wrapper">
              <i className="fas fa-map-marker-alt input-icon"></i>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Votre adresse"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ville">Ville</label>
              <div className="input-wrapper">
                <i className="fas fa-city input-icon"></i>
                <input
                  type="text"
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Ville"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="codePostal">Code Postal</label>
              <div className="input-wrapper">
                <i className="fas fa-mail-bulk input-icon"></i>
                <input
                  type="text"
                  id="codePostal"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  placeholder="Code postal"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe *</label>
              <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Créez un mot de passe"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmation *</label>
              <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez le mot de passe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              J'accepte les{' '}
              <Link to="/terms" className="inline-link">
                conditions d'utilisation
              </Link>{' '}
              et la{' '}
              <Link to="/privacy" className="inline-link">
                politique de confidentialité
              </Link>
            </label>
          </div>

          <button 
            type="submit" 
            className="auth-btn primary"
            disabled={isLoading}
          >
            <i className="fas fa-user-plus"></i>
            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Déjà un compte ?{' '}
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;