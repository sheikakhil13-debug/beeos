import React, { useState } from "react";
import BottomNav from "./BottomNav";
import SideMenu from "./SideMenu";

export default function AppShell({ active, onChangeTab, children, hideMenuButton = false }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="appshell-outer">
      <div
        className="mrbee-card appshell-inner"
      >
        {/* Hamburger menu button — floats over whichever tab is active */}
        {!hideMenuButton && (
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 5,
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "#14171d",
              border: "1px solid #20242c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <HamburgerIcon />
          </button>
        )}

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <BottomNav active={active} onChange={onChangeTab} />

        <SideMenu
          open={menuOpen}
          active={active}
          onChange={onChangeTab}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="#9aa0aa" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
