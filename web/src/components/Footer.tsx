import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-highest w-full py-10 mt-10 relative z-30 border-t border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop gap-8 max-w-7xl mx-auto select-none">
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
          <span className="font-title-md text-title-md font-bold text-brand-blue">
            Biofood Ecosystem
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
            © 2024 Biofood Ecosystem. Nutrición clínica e inteligencia de negocio impulsada por datos para entornos educativos.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 justify-center">
          <a
            className="text-on-surface-variant hover:text-brand-blue transition-colors font-label-sm text-label-sm font-semibold"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-on-surface-variant hover:text-brand-blue transition-colors font-label-sm text-label-sm font-semibold"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-on-surface-variant hover:text-brand-blue transition-colors font-label-sm text-label-sm font-semibold"
            href="#"
          >
            Accessibility
          </a>
          <a
            className="text-on-surface-variant hover:text-brand-blue transition-colors font-label-sm text-label-sm font-semibold"
            href="#"
          >
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
