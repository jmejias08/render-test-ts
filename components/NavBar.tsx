'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/users', label: 'Usuarios' },
    { href: '/clients', label: 'Clientes' },
    { href: '/products', label: 'Productos' },
    { href: '/tickets', label: 'Ventas' },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary bg-gradient sticky-top px-4 shadow-sm">
      <Link className="navbar-brand fw-bold fs-4" href="/">
        <i className="bi bi-house-door-fill me-2"></i> Inicio
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          {navItems.map((item) => (
            <li className="nav-item" key={item.href}>
              <Link
                href={item.href}
                className={`nav-link px-3 rounded ${pathname === item.href ? 'active fw-semibold bg-opacity-75' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
