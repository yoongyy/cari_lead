"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Radio } from "lucide-react";

interface NavbarProps {
  onOpenEarlyAccess: () => void;
}

export default function Navbar({ onOpenEarlyAccess }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Industries", href: "#industries" },
    { name: "Free Report", href: "#free-report" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Radio className="w-5 h-5 text-primary animate-pulse" />
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 animate-ping"></span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-navy">Cari</span>
              <span className="text-primary">Lead</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
              <Link
                href="#pricing"
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={onOpenEarlyAccess}
                className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Get Early Access
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-navy focus:outline-none p-2"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-slate-600 hover:text-primary py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-slate-200 my-2" />
            <Link
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-slate-600 hover:text-primary py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenEarlyAccess();
              }}
              className="bg-primary hover:bg-primary-dark text-white text-center text-base font-semibold py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              Get Early Access
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
