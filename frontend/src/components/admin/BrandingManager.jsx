// Comprehensive branding management interface
import { useState } from 'react';
import { useBranding } from '../providers/BrandingProvider';
import { motion } from 'framer-motion';

export default function BrandingManager() {
  const { branding, updateBranding } = useBranding();
  const [activeSection, setActiveSection] = useState('institution');
  const [logoPreview, setLogoPreview] = useState(null);

  const sections = [
    { id: 'institution', label: 'Institution Details', icon: '🏛️' },
    { id: 'visual', label: 'Visual Identity', icon: '🎨' },
    { id: 'contact', label: 'Contact Information', icon: '📞' },
    { id: 'examination', label: 'Exam Settings', icon: '📋' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  const handleInstitutionUpdate = (field, value) => {
    updateBranding({
      institution: { ...branding.institution, [field]: value }
    });
  };

  const handleExaminationUpdate = (field, value) => {
    updateBranding({
      examination: { ...branding.examination, [field]: value }
    });
  };

  const handleNotificationUpdate = (category, field, value) => {
    updateBranding({
      notifications: {
        ...branding.notifications,
        [category]: { ...branding.notifications[category], [field]: value }
      }
    });
  };

  const handleSecurityUpdate = (field, value) => {
    updateBranding({
      security: { ...branding.security, [field]: value }
    });
  };

  const handleLogoUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        // In a real app, you'd upload to server and get URL
        updateBranding({
          logo: { ...branding.logo, [type]: e.target.result }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Branding Manager</h1>
        <p className="text-gray-600">Configure your institution's branding and platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-6">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium text-sm">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Institution Details */}
              {activeSection === 'institution' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Institution Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                      <input
                        type="text"
                        value={branding.institution.name}
                        onChange={(e) => handleInstitutionUpdate('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your Institution Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
                      <input
                        type="text"
                        value={branding.institution.shortName}
                        onChange={(e) => handleInstitutionUpdate('shortName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Short Name"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={branding.institution.tagline}
                        onChange={(e) => handleInstitutionUpdate('tagline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Institution tagline or motto"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={branding.institution.website}
                        onChange={(e) => handleInstitutionUpdate('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://your-institution.edu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={branding.institution.email}
                        onChange={(e) => handleInstitutionUpdate('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="info@your-institution.edu"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={branding.institution.phone}
                        onChange={(e) => handleInstitutionUpdate('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Identity */}
              {activeSection === 'visual' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Visual Identity</h2>
                  
                  <div className="space-y-8">
                    {/* Logo Upload */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Logo Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Logo</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, 'primary')}
                              className="hidden"
                              id="primary-logo"
                            />
                            <label htmlFor="primary-logo" className="cursor-pointer">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                                📷
                              </div>
                              <p className="text-sm text-gray-600">Click to upload primary logo</p>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Logo</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, 'secondary')}
                              className="hidden"
                              id="secondary-logo"
                            />
                            <label htmlFor="secondary-logo" className="cursor-pointer">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                                📷
                              </div>
                              <p className="text-sm text-gray-600">Click to upload secondary logo</p>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Palette Preview */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Current Color Palette</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(branding.colors).map(([key, value]) => {
                          if (typeof value === 'string') {
                            return (
                              <div key={key} className="text-center">
                                <div 
                                  className="w-16 h-16 rounded-lg mx-auto mb-2 border border-gray-200"
                                  style={{ backgroundColor: value }}
                                />
                                <p className="text-xs font-medium text-gray-700 capitalize">{key}</p>
                                <p className="text-xs text-gray-500 font-mono">{value}</p>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Examination Settings */}
              {activeSection === 'examination' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Examination Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Duration (minutes)</label>
                      <input
                        type="number"
                        value={branding.examination.defaultDuration}
                        onChange={(e) => handleExaminationUpdate('defaultDuration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="30"
                        max="480"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (minutes)</label>
                      <input
                        type="number"
                        value={branding.examination.bufferTime}
                        onChange={(e) => handleExaminationUpdate('bufferTime', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Students Per Hall</label>
                      <input
                        type="number"
                        value={branding.examination.maxStudentsPerHall}
                        onChange={(e) => handleExaminationUpdate('maxStudentsPerHall', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="10"
                        max="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Late Entry Allowed (minutes)</label>
                      <input
                        type="number"
                        value={branding.examination.allowLateEntry}
                        onChange={(e) => handleExaminationUpdate('allowLateEntry', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mixing Strategy</label>
                      <select
                        value={branding.examination.mixingStrategy}
                        onChange={(e) => handleExaminationUpdate('mixingStrategy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="DEPARTMENT_MIXING">Department Mixing</option>
                        <option value="RANDOM">Random</option>
                        <option value="ALPHABETICAL">Alphabetical</option>
                        <option value="ROLL_NUMBER">Roll Number</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoSubmit"
                        checked={branding.examination.autoSubmit}
                        onChange={(e) => handleExaminationUpdate('autoSubmit', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoSubmit" className="ml-2 block text-sm text-gray-700">
                        Auto-submit exams when time expires
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={branding.notifications.email.enabled}
                              onChange={(e) => handleNotificationUpdate('email', 'enabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {branding.notifications.email.enabled && (
                          <div className="pl-4 space-y-3">
                            {Object.entries(branding.notifications.email.templates).map(([template, enabled]) => (
                              <div key={template} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 capitalize">
                                  {template.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={(e) => handleNotificationUpdate('email', 'templates', {
                                    ...branding.notifications.email.templates,
                                    [template]: e.target.checked
                                  })}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Push Notifications</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Enable Push Notifications</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={branding.notifications.push.enabled}
                            onChange={(e) => handleNotificationUpdate('push', 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={branding.security.sessionTimeout}
                        onChange={(e) => handleSecurityUpdate('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="5"
                        max="480"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        value={branding.security.maxLoginAttempts}
                        onChange={(e) => handleSecurityUpdate('maxLoginAttempts', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="3"
                        max="10"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-900 mb-3">Password Policy</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
                          <input
                            type="number"
                            value={branding.security.passwordPolicy.minLength}
                            onChange={(e) => handleSecurityUpdate('passwordPolicy', {
                              ...branding.security.passwordPolicy,
                              minLength: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="6"
                            max="32"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="requireUppercase"
                              checked={branding.security.passwordPolicy.requireUppercase}
                              onChange={(e) => handleSecurityUpdate('passwordPolicy', {
                                ...branding.security.passwordPolicy,
                                requireUppercase: e.target.checked
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="requireUppercase" className="ml-2 text-sm text-gray-700">
                              Require Uppercase
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="requireNumbers"
                              checked={branding.security.passwordPolicy.requireNumbers}
                              onChange={(e) => handleSecurityUpdate('passwordPolicy', {
                                ...branding.security.passwordPolicy,
                                requireNumbers: e.target.checked
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="requireNumbers" className="ml-2 text-sm text-gray-700">
                              Require Numbers
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
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