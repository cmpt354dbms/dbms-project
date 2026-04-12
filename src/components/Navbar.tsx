import { useState } from 'react'
import { NavLink } from 'react-router-dom'
 
const NAV_ITEMS = [
  { to: '/athletes', label: 'Athletes'},
  { to: '/games', label: 'Games'},
  { to: '/coaches', label: 'Coaches'},
  { to: '/high-schools', label: 'High School'},
  { to: '/colleges', label: 'Colleges'},
]
 
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
 
  return (
    <>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 200;
          background: #0f172a;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 2px 16px rgba(0,0,0,0.3);
        }
 
        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 60px;
          display: flex;
          align-items: center;
          gap: 2rem;
        }
 
        /* ── Brand ── */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
 
        .navbar-brand-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6d28d9, #4f46e5);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 12px rgba(109,40,217,0.5);
        }
 
        .navbar-brand-text {
          font-family: 'Georgia', serif;
          font-size: 17px;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: 0.02em;
        }
 
        .navbar-brand-text span {
          color: #818cf8;
        }
 
        /* ── Desktop nav links ── */
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }
 
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.01em;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
 
        .nav-link:hover {
          background: rgba(255,255,255,0.07);
          color: #e2e8f0;
        }
 
        .nav-link.active {
          background: rgba(109,40,217,0.2);
          color: #a78bfa;
          font-weight: 600;
        }
 
        .nav-link-icon {
          font-size: 14px;
          line-height: 1;
        }
 
        /* ── Mobile hamburger ── */
        .navbar-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          margin-left: auto;
        }
 
        .navbar-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #94a3b8;
          border-radius: 2px;
          transition: transform 0.2s, opacity 0.2s;
        }
 
        .navbar-hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
 
        .navbar-hamburger.open span:nth-child(2) {
          opacity: 0;
        }
 
        .navbar-hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
 
        /* ── Mobile dropdown ── */
        .navbar-mobile-menu {
          display: none;
          flex-direction: column;
          background: #0f172a;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 0.5rem 1rem 1rem;
          gap: 2px;
        }
 
        .navbar-mobile-menu.open {
          display: flex;
        }
 
        .nav-link-mobile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: #94a3b8;
          transition: background 0.15s, color 0.15s;
        }
 
        .nav-link-mobile:hover {
          background: rgba(255,255,255,0.07);
          color: #e2e8f0;
        }
 
        .nav-link-mobile.active {
          background: rgba(109,40,217,0.2);
          color: #a78bfa;
          font-weight: 600;
        }
 
        @media (max-width: 640px) {
          .navbar-links {
            display: none;
          }
 
          .navbar-hamburger {
            display: flex;
          }
        }
      `}</style>
 
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <NavLink to="/" className="navbar-brand">
            <div className="navbar-brand-icon"></div>
            <span className="navbar-brand-text">
              Court<span>Sight</span>
            </span>
          </NavLink>
 
          {/* Desktop links */}
          <div className="navbar-links">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >

                {item.label}
              </NavLink>
            ))}
          </div>
 
          {/* Mobile hamburger */}
          <button
            className={`navbar-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
 
        {/* Mobile menu */}
        <div className={`navbar-mobile-menu${menuOpen ? ' open' : ''}`}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link-mobile${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >

              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}