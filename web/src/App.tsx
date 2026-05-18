import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import RevenueDashboard from './views/RevenueDashboard'
import StudentDirectory from './views/StudentDirectory'
import StudentDetail from './views/StudentDetail'

interface Student {
  id: string
  name: string
  parent: string
  balance: number
  school: string
  purchases: number
  activity: 'Alto' | 'Medio' | 'Bajo'
}

function App() {
  const [activeTab, setActiveTab] = useState('revenue')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setActiveTab('student-detail')
  }

  const handleBackToDirectory = () => {
    setSelectedStudent(null)
    setActiveTab('students')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'revenue':
        return <RevenueDashboard />
      case 'students':
        return (
          <StudentDirectory
            globalSearch={searchQuery}
            onSelectStudent={handleSelectStudent}
          />
        )
      case 'student-detail':
        return (
          <StudentDetail
            student={selectedStudent}
            onBack={handleBackToDirectory}
          />
        )
      case 'inventory':
      case 'allergens':
      case 'challenges':
      case 'marketplace':
      default:
        return (
          <div className="max-w-4xl mx-auto py-20 px-6 text-center select-none">
            <div className="bg-white/80 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-12 shadow-lg space-y-6 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-brand-blue-container/30 rounded-full flex items-center justify-center text-brand-blue mx-auto animate-pulse">
                <span className="material-symbols-outlined text-[48px]">
                  construction
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-headline-lg font-bold text-on-surface">
                  Módulo en Desarrollo
                </h2>
                <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                  Estamos construyendo una experiencia de analítica y gestión de datos nutricionales premium. Este panel estará disponible muy pronto.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('revenue')}
                className="px-6 py-3 bg-brand-blue hover:opacity-90 active:scale-[0.98] text-on-primary rounded-xl font-bold transition-all shadow-md cursor-pointer"
              >
                Volver al Panel de Control
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Reusable Header */}
      <Header
        showSearch={activeTab === 'students'}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-grow relative">
        {/* Reusable Sidebar */}
        <Sidebar
          activeTab={activeTab === 'student-detail' ? 'students' : activeTab}
          onTabChange={(tab) => {
            setSelectedStudent(null) // clear detail state if switching tabs
            setActiveTab(tab)
          }}
        />

        {/* Main Workspace */}
        <main className="flex-grow lg:ml-72 p-margin-mobile md:p-margin-desktop bg-background min-h-screen flex flex-col justify-between">
          <div className="flex-grow">
            {renderContent()}
          </div>
          {/* Reusable Footer */}
          <Footer />
        </main>
      </div>
    </div>
  )
}

export default App
