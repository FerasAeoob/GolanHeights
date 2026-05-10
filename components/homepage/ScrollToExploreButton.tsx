"use client";

import React from "react";

type ScrollToExploreButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export default function ScrollToExploreButton({
  children,
  className = "",
}: ScrollToExploreButtonProps) {
  function handleClick() {
    const section = document.getElementById("explore-golan");

    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Keep the URL clean so the button works repeatedly.
    if (window.location.hash === "#explore-golan") {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
