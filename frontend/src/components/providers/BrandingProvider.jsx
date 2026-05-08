// Branding context provider for theme management
import { createContext, useContext, useEffect, useState } from 'react';
import { loadBranding, saveBranding, applyBrandingToCSS, defaultBranding } from '../../config/branding';

const BrandingContext = createContext();

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(defaultBranding);
  const [isLoading, setIsLoading] = useState(true);

  // Load branding on mount
  useEffect(() => {
    const loadedBranding = loadBranding();
    setBranding(loadedBranding);
    applyBrandingToCSS(loadedBranding);
    setIsLoading(false);
  }, []);

  // Update branding
  const updateBranding = (newBranding) => {
    const updatedBranding = { ...branding, ...newBranding };
    setBranding(updatedBranding);
    applyBrandingToCSS(updatedBranding);
    saveBranding(updatedBranding);
  };

  // Reset to default
  const resetBranding = () => {
    setBranding(defaultBranding);
    applyBrandingToCSS(defaultBranding);
    localStorage.removeItem('acadex-branding');
  };

  // Get color value
  const getColor = (colorPath) => {
    const paths = colorPath.split('.');
    let value = branding.colors;
    for (const path of paths) {
      value = value?.[path];
    }
    return value || '#000000';
  };

  // Check if feature is enabled
  const isFeatureEnabled = (feature) => {
    return branding.features?.[feature] ?? false;
  };

  // Get institution info
  const getInstitution = () => branding.institution;

  // Get logo URL
  const getLogo = (type = 'primary') => {
    return branding.logo?.[type] || '/assets/logo-default.svg';
  };

  const value = {
    branding,
    updateBranding,
    resetBranding,
    getColor,
    isFeatureEnabled,
    getInstitution,
    getLogo,
    isLoading
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AcadeX...</p>
        </div>
      </div>
    );
  }

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};