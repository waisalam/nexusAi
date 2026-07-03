"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SideNavItem {
  id: string;
  label: string;
}

interface SideNavProps {
  items: SideNavItem[];
}

/** Fixed left-edge scroll-spy nav — a dot per section, label slides out on
 * hover, active section tracked via IntersectionObserver. Desktop only. */
export function SideNav({ items }: SideNavProps) {
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-16 flex-col justify-center border-r border-border/60 bg-background/80 backdrop-blur-sm md:flex md:w-20">
      <div className="flex flex-col gap-6 px-4">
        {items.map(({ id, label }) => (
          <button key={id} onClick={() => scrollToSection(id)} className="group relative flex items-center gap-3">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                activeSection === id ? "scale-125 bg-accent" : "bg-muted-foreground/40 group-hover:bg-foreground/60"
              )}
            />
            <span
              className={cn(
                "absolute left-6 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest opacity-0 transition-all duration-200 group-hover:left-8 group-hover:opacity-100",
                activeSection === id ? "text-accent" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
