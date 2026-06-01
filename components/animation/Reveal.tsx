"use client";

import React, { CSSProperties, useEffect, useRef, useState } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: RevealDirection;
  distance?: number;
  once?: boolean;
}

const getHiddenTransform = (direction: RevealDirection, distance: number) => {
  switch (direction) {
    case "down":
      return `translate3d(0, -${distance}px, 0) scale(0.985)`;
    case "left":
      return `translate3d(${distance}px, 0, 0) scale(0.985)`;
    case "right":
      return `translate3d(-${distance}px, 0, 0) scale(0.985)`;
    case "none":
      return "translate3d(0, 0, 0) scale(0.985)";
    case "up":
    default:
      return `translate3d(0, ${distance}px, 0) scale(0.985)`;
  }
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 850,
  direction = "up",
  distance = 28,
  once = true,
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldShow = entry.isIntersecting;

        setIsVisible(shouldShow);

        if (shouldShow && once) {
          observer.unobserve(element);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.16,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [once]);

  const revealStyle = {
    "--reveal-delay": `${delay}ms`,
    "--reveal-duration": `${duration}ms`,
    "--reveal-hidden-transform": getHiddenTransform(direction, distance),
  } as CSSProperties;

  return (
    <div
      ref={ref}
      style={revealStyle}
      className={`reveal-motion ${isVisible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
