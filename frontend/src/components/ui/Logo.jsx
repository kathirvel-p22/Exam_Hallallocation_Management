// Dynamic logo component with branding support
import { useBranding } from '../providers/BrandingProvider';

export const Logo = ({ 
  type = 'primary', 
  size = 'md', 
  showText = true, 
  className = '',
  onClick 
}) => {
  const { branding, getLogo } = useBranding();

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div 
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Logo Icon */}
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${branding.colors.primary} 0%, ${branding.colors.secondary} 100%)`
        }}
      >
        <span 
          className={`font-display font-bold text-white ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-3xl'}`}
        >
          {branding.institution.shortName.charAt(0)}
        </span>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div 
            className={`font-display font-bold leading-none ${textSizeClasses[size]}`}
            style={{ color: branding.colors.primary }}
          >
            {branding.institution.shortName}
            <span style={{ color: branding.colors.secondary }}>
              {branding.institution.shortName === 'AcadeX' ? '' : 'X'}
            </span>
          </div>
          {size !== 'xs' && size !== 'sm' && (
            <div 
              className="text-xs font-mono uppercase tracking-wider opacity-60"
              style={{ color: branding.colors.text.secondary }}
            >
              {branding.institution.tagline}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const LogoIcon = ({ size = 'md', className = '' }) => {
  return <Logo type="primary" size={size} showText={false} className={className} />;
};

export const LogoFull = ({ size = 'md', className = '' }) => {
  return <Logo type="primary" size={size} showText={true} className={className} />;
};

export default Logo;