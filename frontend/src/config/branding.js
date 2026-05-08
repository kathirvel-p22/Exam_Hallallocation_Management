// Branding configuration system
export const defaultBranding = {
  // Institution Details
  institution: {
    name: "AcadeX University",
    shortName: "AcadeX",
    tagline: "Intelligent Examination Management",
    website: "https://acadex.edu",
    email: "info@acadex.edu",
    phone: "+1 (555) 123-4567"
  },

  // Visual Identity
  logo: {
    primary: "/assets/logo-primary.svg",
    secondary: "/assets/logo-secondary.svg",
    favicon: "/assets/favicon.ico",
    watermark: "/assets/watermark.png"
  },

  // Color Scheme
  colors: {
    primary: "#0B1437",      // Navy blue
    secondary: "#D4AF37",    // Gold
    accent: "#A81C3A",       // Maroon
    success: "#0D6B4E",      // Green
    warning: "#F59E0B",      // Amber
    error: "#DC2626",        // Red
    background: "#F9F6EE",   // Cream
    surface: "#FFFFFF",      // White
    text: {
      primary: "#1F2937",
      secondary: "#6B7280",
      muted: "#9CA3AF"
    }
  },

  // Typography
  fonts: {
    primary: "Calibri, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    secondary: "Roboto, 'Open Sans', 'Lato', 'Montserrat', sans-serif",
    mono: "'Fira Code', 'Consolas', 'Monaco', monospace",
    display: "'Inter', 'Poppins', sans-serif"
  },

  // Layout & Spacing
  layout: {
    borderRadius: "12px",
    shadowLevel: "medium",
    spacing: "comfortable",
    headerHeight: "64px",
    sidebarWidth: "280px"
  },

  // Feature Toggles
  features: {
    darkMode: true,
    animations: true,
    sounds: false,
    notifications: true,
    realTimeUpdates: true,
    aiChatbot: true,
    qrScanning: true,
    biometricAuth: false
  },

  // Examination Settings
  examination: {
    defaultDuration: 180, // minutes
    bufferTime: 15,       // minutes before/after
    maxStudentsPerHall: 200,
    mixingStrategy: "DEPARTMENT_MIXING",
    allowLateEntry: 30,   // minutes
    autoSubmit: true
  },

  // Notification Settings
  notifications: {
    email: {
      enabled: true,
      templates: {
        examReminder: true,
        hallTicket: true,
        resultAnnouncement: true,
        systemUpdates: true
      }
    },
    sms: {
      enabled: false,
      provider: "twilio"
    },
    push: {
      enabled: true,
      vapidKey: ""
    }
  },

  // Security Settings
  security: {
    sessionTimeout: 30,     // minutes
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    twoFactorAuth: false,
    ipWhitelist: []
  },

  // Integration Settings
  integrations: {
    lms: {
      enabled: false,
      provider: null, // 'moodle', 'canvas', 'blackboard'
      apiUrl: "",
      apiKey: ""
    },
    sms: {
      enabled: false,
      provider: "twilio",
      accountSid: "",
      authToken: ""
    },
    email: {
      provider: "smtp",
      host: "",
      port: 587,
      secure: false,
      auth: {
        user: "",
        pass: ""
      }
    }
  }
};

// Theme variants
export const themeVariants = {
  default: {
    name: "AcadeX Classic",
    colors: defaultBranding.colors
  },
  
  modern: {
    name: "Modern Blue",
    colors: {
      ...defaultBranding.colors,
      primary: "#1E40AF",
      secondary: "#3B82F6",
      accent: "#8B5CF6"
    }
  },

  forest: {
    name: "Forest Green",
    colors: {
      ...defaultBranding.colors,
      primary: "#065F46",
      secondary: "#10B981",
      accent: "#F59E0B"
    }
  },

  sunset: {
    name: "Sunset Orange",
    colors: {
      ...defaultBranding.colors,
      primary: "#C2410C",
      secondary: "#F97316",
      accent: "#EF4444"
    }
  },

  royal: {
    name: "Royal Purple",
    colors: {
      ...defaultBranding.colors,
      primary: "#581C87",
      secondary: "#8B5CF6",
      accent: "#EC4899"
    }
  }
};

// Load branding from localStorage or API
export const loadBranding = () => {
  try {
    const stored = localStorage.getItem('acadex-branding');
    if (stored) {
      return { ...defaultBranding, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load branding from localStorage:', error);
  }
  return defaultBranding;
};

// Save branding to localStorage
export const saveBranding = (branding) => {
  try {
    localStorage.setItem('acadex-branding', JSON.stringify(branding));
    return true;
  } catch (error) {
    console.error('Failed to save branding to localStorage:', error);
    return false;
  }
};

// Apply branding to CSS variables
export const applyBrandingToCSS = (branding) => {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(branding.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      root.style.setProperty(`--color-${key}`, value);
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        root.style.setProperty(`--color-${key}-${subKey}`, subValue);
      });
    }
  });

  // Apply fonts
  root.style.setProperty('--font-primary', branding.fonts.primary);
  root.style.setProperty('--font-secondary', branding.fonts.secondary);
  root.style.setProperty('--font-mono', branding.fonts.mono);
  root.style.setProperty('--font-display', branding.fonts.display);

  // Apply layout
  root.style.setProperty('--border-radius', branding.layout.borderRadius);
  root.style.setProperty('--header-height', branding.layout.headerHeight);
  root.style.setProperty('--sidebar-width', branding.layout.sidebarWidth);
};

export default defaultBranding;