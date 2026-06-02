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
      return `translate3d(0, -${distance}px, 0)`;
    case "left":
      return `translate3d(${distance}px, 0, 0)`;
    case "right":
      return `translate3d(-${distance}px, 0, 0)`;
    case "none":
      return "translate3d(0, 0, 0)";
    case "up":
    default:
      return `translate3d(0, ${distance}px, 0)`;
  }
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 800,
  direction = "up",
  distance = 32,
  once = true,
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.15,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
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
