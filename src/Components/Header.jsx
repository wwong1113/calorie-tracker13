import React from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { useStateValue } from "../StateProvider";

const icon = (children) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const TABS = [
  {
    to: "/",
    label: "Today",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </>,
    ),
  },
  {
    to: "/search",
    label: "Search",
    icon: icon(
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" />
      </>,
    ),
  },
  {
    to: "/createMeal",
    label: "Meals",
    icon: icon(
      <>
        <path d="M4 11h16a8 8 0 0 1-16 0z" />
        <path d="M9 4.5c0 1.2 1 1.3 1 2.5M14 4.5c0 1.2 1 1.3 1 2.5" />
      </>,
    ),
  },
  {
    to: "/adjustGoals",
    label: "Goals",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="0.8" fill="currentColor" />
      </>,
    ),
  },
];

function Header() {
  const [{ user, syncError }] = useStateValue();

  return (
    <>
      <header className="topbar">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true" />
          FitTrack
        </Link>
        <Link to="/login" className="account-link">
          {user ? (
            <span className="avatar" aria-label={`Account: ${user.name}`}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            "Sign in"
          )}
        </Link>
      </header>

      {syncError && (
        <p className="sync-banner" role="alert">
          {syncError}
        </p>
      )}

      {/* One nav: centered in the top bar on desktop, a tab bar on phones. */}
      <nav className="tabs" aria-label="Main">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end className="tab">
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="tab-pill"
                    transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                  />
                )}
                {tab.icon}
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Header;
