'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Palette, Store, Settings, BarChart2, Menu, X } from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/studio', label: 'Design Studio', icon: Palette },
  { href: '/research', label: 'Keyword Research', icon: BarChart2 },
  { href: '/listings', label: 'Listings', icon: Store },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={styles.menuButton}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="app-sidebar"
        onClick={() => setOpen(v => !v)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside id="app-sidebar" className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <Link href="/" className={styles.logoContainer}>
          <span className={styles.logoIcon}>✨</span>
          <span className={styles.logoText}>Etsy Creator Studio</span>
        </Link>

        <nav className={styles.nav}>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={styles.navLink} aria-current={pathname === href ? 'page' : undefined}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <p className={styles.userEmail}>Demo mode · no account required</p>
          <Link href="/settings" className={styles.navLink} aria-current={pathname === '/settings' ? 'page' : undefined}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
