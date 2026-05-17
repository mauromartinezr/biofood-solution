import React from 'react'

interface HeaderProps {
  showSearch?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
}

const Header: React.FC<HeaderProps> = ({
  showSearch = true,
  searchValue = '',
  onSearchChange,
}) => {
  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm top-0 sticky z-50 flex justify-between items-center w-full px-margin-desktop py-4 h-20">
      <div className="flex items-center gap-4">
        <span className="font-display-lg text-display-lg font-bold text-brand-blue tracking-tight select-none">
          Biofood
        </span>
        <nav className="hidden md:flex gap-6 ml-10">
          <a
            className="text-on-surface-variant hover:text-brand-blue transition-colors font-label-md text-label-md"
            href="#"
          >
            Analytics
          </a>
          <a
            className="text-on-surface-variant hover:text-brand-blue transition-colors font-label-md text-label-md"
            href="#"
          >
            Parent Portal
          </a>
          <a
            className="text-on-surface-variant hover:text-brand-blue transition-colors font-label-md text-label-md"
            href="#"
          >
            Bio-Points
          </a>
          <a
            className="text-on-surface-variant hover:text-brand-blue transition-colors font-label-md text-label-md"
            href="#"
          >
            Support
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {showSearch && (
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar expediente..."
              className="bg-surface-container-low border-none rounded-full px-10 py-2 text-body-md w-64 focus:ring-1 focus:ring-primary transition-all outline-none"
            />
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              data-icon="search"
            >
              search
            </span>
          </div>
        )}

        <button className="p-2 hover:bg-surface-container-high rounded-full transition-all duration-200 cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">
            notifications
          </span>
        </button>
        <button className="p-2 hover:bg-surface-container-high rounded-full transition-all duration-200 cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant" data-icon="settings">
            settings
          </span>
        </button>

        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant ml-2 select-none">
          <span className="font-label-md text-label-md">Profile</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-blue/20">
            <img
              alt="User profile photo"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu-RLHxDzAWOUPc3yaNsPvQ8OcoBkprUoKdcaFNh67epMc--A_PKzQZOFwznHxIKny7jLJEOWZyAhiWEDHl-z4eMfsE-oO6Xhg2JEWJxk97E94uhuyDkpzz9QZYO8d8YKJNysNq_sGLO8R0BjphcGpfW_V_z1aYyxWtlhlantIVK-rw0eL26YYj4PSXrkpotag3ERMKDrzUBXnL7KjKUXLIjHmsRjj8jonqyUo90Q4oZbogpqrZMjQBMGCz1fd39q7uRO6jPbHWm0"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
