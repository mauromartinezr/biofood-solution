import React from 'react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'revenue', label: 'Inteligencia Ingresos', icon: 'trending_up' },
    { id: 'students', label: 'Directorio Estudiantes', icon: 'school' },
    { id: 'inventory', label: 'Inventario', icon: 'inventory_2' },
    { id: 'allergens', label: 'Alérgenos', icon: 'warning' },
    { id: 'challenges', label: 'Desafíos', icon: 'workspace_premium' },
    { id: 'marketplace', label: 'Marketplace', icon: 'storefront' },
  ]

  return (
    <aside className="bg-surface-container-low h-screen w-72 flex flex-col fixed left-0 top-0 pt-20 border-r border-outline-variant shadow-sm z-40 hidden lg:flex">
      <div className="flex flex-col gap-2 p-6 flex-grow">
        <div className="flex items-center gap-3 mb-8 px-1 select-none">
          <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined" data-icon="school">
              school
            </span>
          </div>
          <div>
            <h2 className="font-title-md text-title-md font-bold text-brand-blue leading-tight">
              Management
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Centralized Bio-Data
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 p-3 font-bold rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-brand-blue text-on-primary shadow-sm scale-[0.98]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 duration-200'
                }`}
              >
                <span className="material-symbols-outlined" data-icon={item.icon}>
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-8">
          <button className="w-full py-3 bg-brand-blue hover:opacity-90 active:scale-[0.98] text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer">
            <span className="material-symbols-outlined" data-icon="add">
              add
            </span>
            Nuevo Reporte
          </button>
        </div>
      </div>

      <div className="p-6 border-t border-outline-variant space-y-1">
        <a
          className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all font-semibold"
          href="#"
        >
          <span className="material-symbols-outlined" data-icon="help">
            help
          </span>
          <span className="font-label-md text-label-md">Help Center</span>
        </a>
        <a
          className="flex items-center gap-3 p-3 text-error hover:bg-error-container/20 rounded-xl transition-all font-semibold"
          href="#"
        >
          <span className="material-symbols-outlined" data-icon="logout">
            logout
          </span>
          <span className="font-label-md text-label-md">Cerrar Sesión</span>
        </a>
      </div>
    </aside>
  )
}

export default Sidebar
