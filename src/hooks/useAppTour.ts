import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourProps {
  setCurrentPage: (page: 'home' | 'edit' | 'view' | 'pack') => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const useAppTour = ({ setCurrentPage, setIsSidebarOpen }: TourProps) => {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Finish',
      steps: [
        {
          element: '#tour-navbar-tabs',
          popover: {
            title: 'EVP Navigation',
            description: 'EVP stands for Edit, View, and Pack. These are the three core pillars of the app. You add gear, view/organize it, and build your packs.',
          }
        },
        {
          element: '#tour-edit-form',
          popover: {
            title: 'The Edit Page',
            description: 'Here you add new gear to your database. Fill out the name, brand, weight, and choose whether it is base weight, worn, or consumable.',
          }
        },
        {
          element: '#tour-tag-system',
          popover: {
            title: 'Dynamic Tag System',
            description: `
              <div class="mt-4 flex flex-col gap-4 text-left">
                <p class="text-[13px] text-text-secondary leading-relaxed">
                  Our tagging hierarchy replaces rigid folders. Gear automatically organizes itself across the View and Pack pages based on this structure.
                </p>

                <!-- Infographic Container -->
                <div class="bg-card border border-border/50 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-inner">
                  <!-- Connecting Line -->
                  <div class="absolute left-[31px] top-[40px] bottom-[30px] w-px bg-primary/30"></div>

                  <!-- TT Level -->
                  <div class="flex items-start gap-3 relative z-10">
                    <div class="w-8 h-8 rounded bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(255,92,0,0.15)]">TT</div>
                    <div class="flex flex-col pt-1.5">
                      <span class="text-xs font-bold text-primary-foreground uppercase tracking-wider">Top Tag <span class="text-primary/70 text-[10px] normal-case tracking-normal font-medium">(Required)</span></span>
                      <span class="text-[11px] text-text-muted">Broad category (e.g., Sleep System)</span>
                    </div>
                  </div>

                  <!-- MT Level -->
                  <div class="flex items-start gap-3 relative z-10 ml-6">
                    <div class="w-6 h-6 rounded bg-accent border border-border flex items-center justify-center text-primary-foreground font-bold text-[10px] shrink-0 relative">
                      <div class="absolute -left-[14px] top-1/2 w-[14px] h-px bg-primary/30"></div>
                      MT
                    </div>
                    <div class="flex flex-col pt-0.5">
                      <span class="text-[11px] font-bold text-primary-foreground/90 uppercase tracking-wider">Middle Tag <span class="text-text-tertiary text-[9px] normal-case tracking-normal font-medium">(Optional)</span></span>
                      <span class="text-[10px] text-text-muted">Sub-category (e.g., Sleeping Bag)</span>
                    </div>
                  </div>

                  <!-- BT Level -->
                  <div class="flex items-start gap-3 relative z-10 ml-12">
                    <div class="w-6 h-6 rounded bg-background border border-border/50 flex items-center justify-center text-text-muted font-bold text-[10px] shrink-0 relative">
                      <div class="absolute -left-[14px] top-1/2 w-[14px] h-px bg-primary/30"></div>
                      BT
                    </div>
                    <div class="flex flex-col pt-0.5">
                      <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">Base Tag <span class="text-text-tertiary text-[9px] normal-case tracking-normal font-medium">(Optional)</span></span>
                      <span class="text-[10px] text-text-muted">Specific type (e.g., Down Bag)</span>
                    </div>
                  </div>
                </div>

                <div class="bg-primary/5 border border-primary/20 rounded-lg p-3 text-[12px] text-text-secondary leading-relaxed flex gap-3 items-start">
                  <span class="text-xl">💡</span>
                  <div class="pt-0.5">
                    <strong class="text-primary block mb-0.5">Auto-fill Magic</strong>
                    Selecting a specific Base Tag (BT) will automatically fill in its parent Middle (MT) and Top (TT) tags!
                  </div>
                </div>
              </div>
            `,
          }
        },
        {
          element: '#tour-view-search',
          popover: {
            title: 'The View Page',
            description: 'Search and organize your entire inventory. Switch between searching by Tag, Name, or Brand. The list automatically groups and sorts based on your selection.',
          }
        },
        {
          element: '#tour-pack-builder',
          popover: {
            title: 'The Pack Page',
            description: 'Build your loadout! Select items from the inventory on the left to add them to your pack on the right. View detailed weight charts and export your packs to PDF.',
          }
        },
        {
          element: '#tour-settings-sidebar',
          popover: {
            title: 'Saved Packs & Settings',
            description: 'Access your saved packs, toggle theme/units, and export your database. Click a saved pack to load a copy, or use the 3-dot menu to edit the original.',
          }
        }
      ],
      onDestroyStarted: () => {
        setIsSidebarOpen(false);
        driverObj.destroy();
      },
      onNextClick: () => {
        if (!driverObj.hasNextStep()) {
          setCurrentPage('edit');
          setIsSidebarOpen(false);
          driverObj.destroy();
          return;
        }

        const currentStepIndex = driverObj.getActiveIndex() || 0;

        // Handle routing before moving to the next step
        if (currentStepIndex === 0) setCurrentPage('edit');
        if (currentStepIndex === 2) setCurrentPage('view');
        if (currentStepIndex === 3) setCurrentPage('pack');
        if (currentStepIndex === 4) setIsSidebarOpen(true);

        // Give React time to render the new page/open sidebar before highlighting
        const timeout = currentStepIndex === 4 ? 350 : 150;
        setTimeout(() => {
          driverObj.moveNext();
        }, timeout);
      },
      onPrevClick: () => {
        const currentStepIndex = driverObj.getActiveIndex() || 0;

        // Handle routing before moving to the previous step
        if (currentStepIndex === 1) setCurrentPage('home');
        if (currentStepIndex === 3) setCurrentPage('edit');
        if (currentStepIndex === 4) setCurrentPage('view');
        if (currentStepIndex === 5) setIsSidebarOpen(false);

        const timeout = currentStepIndex === 5 ? 350 : 150;
        setTimeout(() => {
          driverObj.movePrevious();
        }, timeout);
      }
    });

    driverObj.drive();
  };

  return { startTour };
};
