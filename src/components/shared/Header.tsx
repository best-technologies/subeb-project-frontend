"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white border-b border-gray-200" : "bg-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isScrolled ? "" : "pt-4"
        }`}
      >
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">SUBEB</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="rounded-full border-brand-green-accent text-brand-green hover:bg-gray-50 h-[51px] px-[26px] py-[15px] gap-[10px]"
            >
              <Youtube className="w-4 h-4" />
              <span>Watch a Demo</span>
            </Button>
            <Link href="/login">
              <Button className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-[51px] px-[26px] py-[15px] gap-[10px]">
                Get Started - It&apos;s free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
