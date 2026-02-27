import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavRouter } from '@/components/layout/BottomNavRouter';
import { BackgroundEffects } from '@/components/BackgroundEffects';

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
}

export const MobileLayout = ({ 
  children, 
  showNav = true,
  className = ''
}: MobileLayoutProps) => {
  const location = useLocation();
  
  // Hide nav on specific pages
  const hideNavPaths = ['/execution', '/login', '/reset-password', '/finance', '/properties/', '/jobs/'];
  const shouldShowNav = showNav && !hideNavPaths.some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <>
      {/* Fixed Florida Sky Background */}
      <div className="bg-florida-sky-fixed" />
      
      {/* Main Content Container */}
      <div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
        <div className="mobile-frame relative">
          <BackgroundEffects />
          
          {/* Page Content - scrollable area */}
          <main className={`relative z-10 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar ${shouldShowNav ? '' : ''} ${className}`}>
            {children}
          </main>

          {/* Bottom Navigation - stays at bottom of frame */}
          {shouldShowNav && <BottomNavRouter />}
        </div>
      </div>
    </>
  );
};
