import { NavigationBar } from '../components/NavigationBar';
import { Footer } from '../components/Footer';
import { Outlet } from 'react-router';

export function MainLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavigationBar />
      <main style={{ flex: 1, paddingTop: '160px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
