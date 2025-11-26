"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Youtube, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when screen is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white border-b border-gray-200" : "bg-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isScrolled ? "" : "lg:pt-4"
        }`}
      >
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">SUBEB</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button
              variant="outline"
              className="!rounded-full border-brand-green-accent text-brand-green hover:bg-gray-50 h-[51px] gap-[10px]"
            >
              <Youtube className="w-4 h-4" />
              <span>Watch a Demo</span>
            </Button>
            <Link href="/login">
              <Button className="!rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-[51px] gap-[10px]">
                Get Started - It&apos;s free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden z-[70] relative p-2 text-gray-900"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-in */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[60] lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-8 pt-24 space-y-6">
          <Button
            variant="outline"
            className="w-full !rounded-full border-brand-green-accent text-brand-green hover:bg-gray-50 h-[51px] gap-[10px] justify-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Youtube className="w-4 h-4" />
            <span>Watch a Demo</span>
          </Button>
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
            <Button className="w-full !rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-[51px] gap-[10px] justify-center">
              Get Started - It&apos;s free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
