import React, { useState, useEffect } from 'react';
import { Navbar, type PageType } from './components/layout/Navbar';
import { SettingsSidebar } from './components/layout/SettingsSidebar';
import { HomePage } from './pages/HomePage';
import { EditPage } from './pages/EditPage';
import { ViewPage } from './pages/ViewPage';
import { PackPage } from './pages/PackPage';
import { type GearItem, type Pack } from './types/gear';
import { useAppTour } from './hooks/useAppTour';
import { db } from './db/db';

const DEMO_GEAR: GearItem[] = [
  { id: crypto.randomUUID(), name: 'Duplex', brand: 'Zpacks', weight: 539, weightType: 'standard', tagPath: { tt: 'SHELTER', mt: 'TENTS', bt: 'TREKKING POLE' } },
  { id: crypto.randomUUID(), name: 'Revelation 20°F', brand: 'Enlightened Equipment', weight: 630, weightType: 'standard', tagPath: { tt: 'SLEEP', mt: 'QUILTS', bt: 'DOWN' } },
  { id: crypto.randomUUID(), name: 'NeoAir XLite NXT', brand: 'Therm-a-Rest', weight: 354, weightType: 'standard', tagPath: { tt: 'SLEEP', mt: 'PADS', bt: 'INFLATABLE' } },
  { id: crypto.randomUUID(), name: 'V2', brand: 'Palante', weight: 476, weightType: 'standard', tagPath: { tt: 'CARRY', mt: 'BACKPACKS', bt: 'FRAMELESS' } },
  { id: crypto.randomUUID(), name: 'PocketRocket 2', brand: 'MSR', weight: 73, weightType: 'standard', tagPath: { tt: 'KITCHEN', mt: 'STOVES', bt: 'CANISTER' } },
  { id: crypto.randomUUID(), name: 'Titanium 750ml Pot', brand: 'Toaks', weight: 103, weightType: 'standard', tagPath: { tt: 'KITCHEN', mt: 'POTS', bt: 'TITANIUM' } },
  { id: crypto.randomUUID(), name: 'Long Handle Spoon', brand: 'Toaks', weight: 19, weightType: 'standard', tagPath: { tt: 'KITCHEN', mt: 'UTENSILS', bt: 'TITANIUM' } },
  { id: crypto.randomUUID(), name: 'Squeeze', brand: 'Sawyer', weight: 85, weightType: 'standard', tagPath: { tt: 'HYDRATION', mt: 'FILTERS', bt: 'SQUEEZE' } },
  { id: crypto.randomUUID(), name: 'Smartwater 1L', brand: 'Smartwater', weight: 40, weightType: 'standard', tagPath: { tt: 'HYDRATION', mt: 'BOTTLES', bt: 'PLASTIC' } },
  { id: crypto.randomUUID(), name: 'NU25', brand: 'Nitecore', weight: 28, weightType: 'standard', tagPath: { tt: 'ELECTRONICS', mt: 'HEADLAMPS', bt: 'RECHARGEABLE' } },
  { id: crypto.randomUUID(), name: 'NB10000', brand: 'Nitecore', weight: 150, weightType: 'standard', tagPath: { tt: 'ELECTRONICS', mt: 'POWERBANKS', bt: '10000MAH' } },
  { id: crypto.randomUUID(), name: 'Lone Peak 7', brand: 'Altra', weight: 628, weightType: 'worn', tagPath: { tt: 'CLOTHING', mt: 'FOOTWEAR', bt: 'TRAIL RUNNERS' } },
  { id: crypto.randomUUID(), name: 'Darn Tough Micro Crew', brand: 'Darn Tough', weight: 60, weightType: 'worn', tagPath: { tt: 'CLOTHING', mt: 'SOCKS', bt: 'MERINO' } },
  { id: crypto.randomUUID(), name: 'Ghost Whisperer/2', brand: 'Mountain Hardwear', weight: 249, weightType: 'standard', tagPath: { tt: 'CLOTHING', mt: 'JACKETS', bt: 'DOWN' } },
  { id: crypto.randomUUID(), name: 'Helium Rain Jacket', brand: 'Outdoor Research', weight: 178, weightType: 'standard', tagPath: { tt: 'CLOTHING', mt: 'JACKETS', bt: 'RAIN' } },
  { id: crypto.randomUUID(), name: 'Fuel Canister (100g)', brand: 'MSR', weight: 210, weightType: 'consumable', tagPath: { tt: 'KITCHEN', mt: 'FUEL', bt: 'ISOBUTANE' } },
  { id: crypto.randomUUID(), name: 'Food (Per Day)', brand: 'Various', weight: 800, weightType: 'consumable', tagPath: { tt: 'CONSUMABLES', mt: 'FOOD', bt: 'RATIONS' } }
];

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [editingItem, setEditingItem] = useState<GearItem | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { startTour } = useAppTour({ setCurrentPage, setIsSidebarOpen });

  // Temporary function to inject demo data for screenshots
  useEffect(() => {
    const injectDemoData = async () => {
      const count = await db.gearItems.count();
      if (count === 0) {
        console.log('Injecting demo PCT gear...');
        await db.gearItems.bulkAdd(DEMO_GEAR);

        // Wait briefly for items to be inserted
        await new Promise(r => setTimeout(r, 100));

        // Create a demo pack
        const demoPack: Pack = {
            id: crypto.randomUUID(),
            packName: 'PCT Thru-Hike (Ultralight)',
            items: DEMO_GEAR.map(gear => ({
                gearId: gear.id,
                qty: gear.name.includes('Smartwater') ? 2 : (gear.name.includes('Food') ? 5 : 1),
                overrideWeight: gear.name.includes('Food') ? 4000 : undefined // 5 days of food
            }))
        };
        await db.packs.add(demoPack);

        // Refresh to make sure everything loads correctly
        window.location.reload();
      }
    };
    injectDemoData();
  }, []);

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
