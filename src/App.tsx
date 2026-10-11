import React from 'react';
import { AcademicDataProvider, useAcademicData } from './context/AcademicDataContext';
import { Sidebar } from './components/layout/Sidebar';
import { AppHeader } from './components/layout/AppHeader';
import { OverviewPage } from './pages/OverviewPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { InsightsPage } from './pages/InsightsPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { ReportsSettingsPage } from './pages/ReportsSettingsPage';

const MainLayout: React.FC = () => {
  const { currentPage } = useAcademicData();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'students':
        return <StudentsPage />;
      case 'profile':
        return <StudentProfilePage />;
      case 'insights':
        return <InsightsPage />;
      case 'data-management':
        return <DataManagementPage />;
      case 'reports-settings':
        return <ReportsSettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area (offset by sidebar width on large screens) */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Sticky Header */}
        <AppHeader />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AcademicDataProvider>
      <MainLayout />
    </AcademicDataProvider>
  );
};

export default App;
