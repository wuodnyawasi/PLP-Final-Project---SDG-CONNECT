import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '', // For register
    confirmPassword: '' // For register
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return rules;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Name is required';
      const passwordRules = validatePassword(formData.password);
      if (!passwordRules.length || !passwordRules.uppercase || !passwordRules.lowercase || !passwordRules.number || !passwordRules.special) {
        newErrors.password = 'Password does not meet requirements';
      }
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || { name: formData.name, email: formData.email }));

        // Dispatch custom event to notify navbar of login
        window.dispatchEvent(new Event('userLoggedIn'));

        // Reset form and close modal after a delay
        setTimeout(() => {
          setFormData({ email: '', password: '', name: '', confirmPassword: '' });
          setErrors({});
          setMessage('');
          onClose();
        }, 2000);
      } else {
        // Handle disabled account error with contact prompt
        if (data.contactRequired) {
          setErrors({
            general: data.message,
            contactPrompt: 'Please contact us for assistance with your account.'
          });
        } else {
          setErrors({ general: data.error });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => !isLogin && setShowPasswordRules(true)}
                onBlur={() => setShowPasswordRules(false)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {showPasswordRules && !isLogin && (
              <div className="password-rules">
                <p>Password must contain:</p>
                <ul>
                  <li className={validatePassword(formData.password).length ? 'valid' : 'invalid'}>At least 8 characters</li>
                  <li className={validatePassword(formData.password).uppercase ? 'valid' : 'invalid'}>At least one uppercase letter</li>
                  <li className={validatePassword(formData.password).lowercase ? 'valid' : 'invalid'}>At least one lowercase letter</li>
                  <li className={validatePassword(formData.password).number ? 'valid' : 'invalid'}>At least one number</li>
                  <li className={validatePassword(formData.password).special ? 'valid' : 'invalid'}>At least one special character</li>
                </ul>
              </div>
            )}
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
          )}
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        {errors.general && <p className="error">{errors.general}</p>}
        {errors.contactPrompt && (
          <div className="contact-prompt">
            <p className="contact-message">{errors.contactPrompt}</p>
            <button
              type="button"
              className="contact-btn"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </button>
          </div>
        )}
        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
