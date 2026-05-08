// Theme customization interface for administrators
import { useState } from 'react';
import { useBranding } from '../providers/BrandingProvider';
import { themeVariants } from '../../config/branding';
import { motion } from 'framer-motion';

export default function ThemeCustomizer() {
  const { branding, updateBranding, resetBranding } = useBranding();
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState(false);

  const tabs = [
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'features', label: 'Features', icon: '⚡' }
  ];

  const handleColorChange = (colorPath, value) => {
    const paths = colorPath.split('.');
    const newColors = { ...branding.colors };
    
    if (paths.length === 1) {
      newColors[paths[0]] = value;
    } else if (paths.length === 2) {
      newColors[paths[0]] = { ...newColors[paths[0]], [paths[1]]: value };
    }
    
    updateBranding({ colors: newColors });
  };

  const applyThemeVariant = (variant) => {
    updateBranding({ colors: variant.colors });
  };

  const ColorPicker = ({ label, colorPath, value }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => handleColorChange(colorPath, e.target.value)}
          className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
        />
        <span className="text-xs font-mono text-gray-500 w-16">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Theme Customizer</h1>
        <p className="text-gray-600">Customize the appearance and branding of your AcadeX platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {/* Tabs */}
            <div className="space-y-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  previewMode
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {previewMode ? '👁️ Exit Preview' : '👁️ Preview Mode'}
              </button>
              
              <button
                onClick={resetBranding}
                className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 border border-red-200"
              >
                🔄 Reset to Default
              </button>
            </div>
          </div>

          {/* Theme Variants */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Themes</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(themeVariants).map(([key, variant]) => (
                <button
                  key={key}
                  onClick={() => applyThemeVariant(variant)}
                  className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex gap-1 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: variant.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: variant.colors.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: variant.colors.accent }}
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-700">{variant.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Color Scheme</h2>
                  
                  <div className="space-y-6">
                    {/* Primary Colors */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Primary Colors</h3>
                      <div className="space-y-3">
                        <ColorPicker 
                          label="Primary" 
                          colorPath="primary" 
                          value={branding.colors.primary} 
                        />
                        <ColorPicker 
                          label="Secondary" 
                          colorPath="secondary" 
                          value={branding.colors.secondary} 
                        />
                        <ColorPicker 
                          label="Accent" 
                          colorPath="accent" 
                          value={branding.colors.accent} 
                        />
                      </div>
                    </div>

                    {/* Status Colors */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Status Colors</h3>
                      <div className="space-y-3">
                        <ColorPicker 
                          label="Success" 
                          colorPath="success" 
                          value={branding.colors.success} 
                        />
                        <ColorPicker 
                          label="Warning" 
                          colorPath="warning" 
                          value={branding.colors.warning} 
                        />
                        <ColorPicker 
                          label="Error" 
                          colorPath="error" 
                          value={branding.colors.error} 
                        />
                      </div>
                    </div>

                    {/* Background Colors */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Background Colors</h3>
                      <div className="space-y-3">
                        <ColorPicker 
                          label="Background" 
                          colorPath="background" 
                          value={branding.colors.background} 
                        />
                        <ColorPicker 
                          label="Surface" 
                          colorPath="surface" 
                          value={branding.colors.surface} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === 'typography' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Typography</h2>
                  
                  <div className="space-y-6">
                    {/* Font Families */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Font Families</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Font</label>
                          <select 
                            value={branding.fonts.primary}
                            onChange={(e) => updateBranding({ 
                              fonts: { ...branding.fonts, primary: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Calibri, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Calibri (Default)</option>
                            <option value="'Inter', sans-serif">Inter</option>
                            <option value="'Roboto', sans-serif">Roboto</option>
                            <option value="'Open Sans', sans-serif">Open Sans</option>
                            <option value="'Lato', sans-serif">Lato</option>
                            <option value="'Montserrat', sans-serif">Montserrat</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Display Font</label>
                          <select 
                            value={branding.fonts.display}
                            onChange={(e) => updateBranding({ 
                              fonts: { ...branding.fonts, display: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="'Inter', 'Poppins', sans-serif">Inter & Poppins</option>
                            <option value="'Playfair Display', serif">Playfair Display</option>
                            <option value="'Merriweather', serif">Merriweather</option>
                            <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Typography Preview */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Preview</h3>
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <h1 style={{ fontFamily: branding.fonts.display }} className="text-2xl font-bold">
                          Heading Example
                        </h1>
                        <p style={{ fontFamily: branding.fonts.primary }} className="text-base">
                          This is a paragraph example using the primary font. It shows how regular text will appear throughout the platform.
                        </p>
                        <code style={{ fontFamily: branding.fonts.mono }} className="text-sm bg-gray-200 px-2 py-1 rounded">
                          Code example in monospace font
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Layout Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                      <select 
                        value={branding.layout.borderRadius}
                        onChange={(e) => updateBranding({ 
                          layout: { ...branding.layout, borderRadius: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="4px">Small (4px)</option>
                        <option value="8px">Medium (8px)</option>
                        <option value="12px">Large (12px)</option>
                        <option value="16px">Extra Large (16px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shadow Level</label>
                      <select 
                        value={branding.layout.shadowLevel}
                        onChange={(e) => updateBranding({ 
                          layout: { ...branding.layout, shadowLevel: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="none">None</option>
                        <option value="light">Light</option>
                        <option value="medium">Medium</option>
                        <option value="heavy">Heavy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
                      <select 
                        value={branding.layout.spacing}
                        onChange={(e) => updateBranding({ 
                          layout: { ...branding.layout, spacing: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="compact">Compact</option>
                        <option value="comfortable">Comfortable</option>
                        <option value="spacious">Spacious</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Feature Toggles</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(branding.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <p className="text-xs text-gray-500">
                            {getFeatureDescription(feature)}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => updateBranding({
                              features: { ...branding.features, [feature]: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFeatureDescription(feature) {
  const descriptions = {
    darkMode: 'Enable dark theme toggle for users',
    animations: 'Enable smooth animations and transitions',
    sounds: 'Enable sound effects for notifications',
    notifications: 'Enable push notifications',
    realTimeUpdates: 'Enable real-time data updates',
    aiChatbot: 'Enable AI-powered chatbot support',
    qrScanning: 'Enable QR code scanning features',
    biometricAuth: 'Enable biometric authentication'
  };
  return descriptions[feature] || 'Toggle this feature on or off';
}