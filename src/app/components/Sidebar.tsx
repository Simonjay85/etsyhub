import Link from 'next/link';
import { LayoutDashboard, Palette, Store, Settings, BarChart2 } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>✨</div>
        <h1 className={styles.logoText}>EtsyCreator</h1>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.navLink}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/studio" className={styles.navLink}>
          <Palette size={20} />
          <span>Design Studio</span>
        </Link>
        <Link href="/research" className={styles.navLink}>
          <BarChart2 size={20} />
          <span>Keyword Research</span>
        </Link>
        <Link href="/listings" className={styles.navLink}>
          <Store size={20} />
          <span>Listings</span>
        </Link>
      </nav>

      <div className={styles.footer}>
        <p className={styles.userEmail}>admin@etsycreator.com</p>
        <Link href="/settings" className={styles.navLink}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
