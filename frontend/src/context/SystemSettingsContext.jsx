import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAppContext } from './AppContext';

const SystemSettingsContext = createContext();

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};

export const SystemSettingsProvider = ({ children }) => {
  const { api } = useAppContext();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default settings fallback
  const defaultSettings = {
    companyName: 'SkillsHub Rwanda',
    companySlogan: 'Learn. Build. Grow.',
    companyDescription: 'A youth-focused learning platform delivering practical skills for Rwanda’s future workforce.',
    contactEmail: 'hello@skillshub.rw',
    contactPhone: '+250 788 000 123',
    contactAddress: 'KN 123 St, Kigali – Rwanda',
    website: 'https://skillshub.rw',
    logo: '/logo.png',
    favicon: '',
    loginBackground: '',
    primaryColor: '#7c3aed',
    secondaryColor: '#f97316',
    accentColor: '#6366f1',
    successColor: '#22c55e',
    warningColor: '#facc15',
    errorColor: '#ef4444',
    currency: 'RWF',
    currencySymbol: 'Frw',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24',
    timezone: 'Africa/Kigali',
    businessType: 'Skills Development Platform',
    features: {
      courseCatalog: true,
      enrollmentManagement: true,
      progressTracking: true,
      instructorDashboards: true,
      analytics: true,
      notifications: true,
      communityShowcase: false,
      careerServices: true
    }
  };

  // Apply colors to CSS custom properties immediately
  const applyColors = (colorSettings) => {
    const root = document.documentElement;
    
    // Ensure we have valid color values with fallbacks
    const primaryColor = colorSettings.primaryColor || '#7c3aed';
    const secondaryColor = colorSettings.secondaryColor || '#f97316';
    const accentColor = colorSettings.accentColor || '#6366f1';
    const successColor = colorSettings.successColor || '#22c55e';
    const warningColor = colorSettings.warningColor || '#facc15';
    const errorColor = colorSettings.errorColor || '#ef4444';
    
    // Set CSS custom properties
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--success-color', successColor);
    root.style.setProperty('--warning-color', warningColor);
    root.style.setProperty('--error-color', errorColor);
    
    // Store colors in localStorage for persistence
    localStorage.setItem('systemColors', JSON.stringify({
      primaryColor,
      secondaryColor,
      accentColor,
      successColor,
      warningColor,
      errorColor
    }));
    
    console.log('SystemSettingsContext: Applied system colors:', {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      success: successColor,
      warning: warningColor,
      error: errorColor
    });
    
    // Force a re-render of components that use these colors
    const event = new CustomEvent('systemSettingsUpdated', { 
      detail: {
        primaryColor,
        secondaryColor,
        accentColor,
        successColor,
        warningColor,
        errorColor
      }
    });
    window.dispatchEvent(event);
    
    // Force CSS recalculation by adding/removing a class
    document.body.classList.add('settings-updated');
    setTimeout(() => {
      document.body.classList.remove('settings-updated');
    }, 100);
  };

  // Load colors from localStorage immediately on mount
  useEffect(() => {
    const storedColors = localStorage.getItem('systemColors');
    if (storedColors) {
      try {
        const colors = JSON.parse(storedColors);
        applyColors(colors);
      } catch (error) {
        console.warn('Failed to parse stored colors:', error);
        applyColors(defaultSettings);
      }
    } else {
      // Apply default colors immediately
      applyColors(defaultSettings);
    }
  }, []); // Run only once on mount

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/system-settings/public');
      if (response.data.success) {
        setSettings(response.data.data);
        applyColors(response.data.data);
      } else {
        setSettings(defaultSettings);
        applyColors(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
      setSettings(defaultSettings);
      applyColors(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };


  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    settings: settings || defaultSettings,
    loading,
    updateSettings: async () => false,
    refreshSettings,
    defaultSettings
  };

  // Ensure we always return valid settings
  if (!value.settings) {
    console.warn('SystemSettingsContext: No settings available, using defaults');
    value.settings = defaultSettings;
  }

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

SystemSettingsProvider.propTypes = {
  children: PropTypes.node.isRequired
};
