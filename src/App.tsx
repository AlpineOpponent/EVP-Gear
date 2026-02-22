import React, { useState } from 'react';
import { Navbar, type PageType } from './components/layout/Navbar';
import { SettingsSidebar } from './components/layout/SettingsSidebar';
import { HomePage } from './pages/HomePage';
import { EditPage } from './pages/EditPage';
import { ViewPage } from './pages/ViewPage';
import { PackPage } from './pages/PackPage';
import { type GearItem } from './types/gear';
import { useAppTour } from './hooks/useAppTour';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [editingItem, setEditingItem] = useState<GearItem | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { startTour } = useAppTour({ setCurrentPage, setIsSidebarOpen });

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    if (page !== 'edit') {
      setEditingItem(undefined);
    }
  };

  const handleEditItem = (item: GearItem) => {
    setEditingItem(item);
    setCurrentPage('edit');
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Navbar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onOpenSettings={() => setIsSidebarOpen(true)}
      />

      <SettingsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handlePageChange}
      />

      <main className="flex-1 overflow-hidden relative">
        {currentPage === 'home' && (
          <HomePage onNavigate={handlePageChange} onStartTour={startTour} />
        )}
        {currentPage === 'edit' && (
          <EditPage
            initialData={editingItem}
            onComplete={() => handlePageChange('view')}
          />
        )}
        {currentPage === 'view' && (
          <ViewPage onEdit={handleEditItem} />
        )}
        {currentPage === 'pack' && (
          <PackPage />
        )}
      </main>
    </div>
  );
}

export default App;
