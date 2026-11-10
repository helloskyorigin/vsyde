"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
type Props = { variant?: "menu" | "icon" };
const STORAGE_KEY = "vsyde-theme";
const CHANGE_EVENT = "vsyde-theme-change";

function activeTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#0b1020" : "#fafbfe";
  try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* Storage may be disabled. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export default function ThemeToggle({ variant = "menu" }: Props) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const sync = () => setTheme(activeTheme());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const dark = theme === "dark";
  const onToggle = () => applyTheme(activeTheme() === "dark" ? "light" : "dark");
  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  if (variant === "icon") return (
    <button type="button" className="theme-icon-button" onClick={onToggle} aria-label={label} title={label} aria-pressed={dark}>
      {dark ? <Sun size={19} aria-hidden="true"/> : <Moon size={19} aria-hidden="true"/>}
    </button>
  );
  return (
    <button type="button" className="theme-menu-switch" onClick={onToggle} aria-label={label} aria-pressed={dark}>
      <span className="theme-menu-switch__label">{dark ? <Sun size={20} aria-hidden="true"/> : <Moon size={20} aria-hidden="true"/>}{dark ? "Light mode" : "Dark mode"}</span>
      <span className={`theme-switch-track ${dark ? "is-on" : ""}`} aria-hidden="true"><span/></span>
    </button>
  );
}
