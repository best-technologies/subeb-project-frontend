"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Youtube, Linkedin, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="px-5 pb-5">
        <div className="bg-brand-black rounded-3xl">
          {/* CTA Section */}
          <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-12">
            <div className="bg-white rounded-3xl py-14 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-semibold text-brand-green mb-6 leading-tight">
                  Join Institutions That Trust Us For
                  <br />
                  Seamless Result Management
                </h2>
                <p className="text-brand-black-accent mb-8 max-w-3xl mx-auto">
                  Move from scattered spreadsheets to a structured, automated
                  system that keeps your data secure and accessible. Designed
                  for modern schools that want efficiency without complexity.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    className="rounded-full border-brand-green-accent text-brand-green hover:bg-gray-50 h-[51px] px-[26px] py-[15px] gap-[10px]"
                  >
                    <Youtube className="w-5 h-5" />
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
          </section>

          {/* Footer Links Section */}
          <section className="text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-xl font-bold">SUBEB</span>
                  </div>
                  <p className="text-[#A0A0A0] text-sm">
                    Manage Results. Improve Accuracy. Simplify
                    <br />
                    Administration.
                  </p>
                </div>

                <div className="flex gap-12 md:gap-16">
                  <div>
                    <h3 className="font-medium text-white mb-4">LEGAL</h3>
                    <ul className="space-y-4 text-[#A0A0A0] text-sm">
                      <li>
                        <a
                          href="#"
                          className="hover:text-white transition-colors"
                        >
                          Terms of service
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-white transition-colors"
                        >
                          Privacy policy
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-white transition-colors"
                        >
                          Cookies
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-4">CONTACT US</h3>
                    <ul className="space-y-4 text-[#A0A0A0] text-sm">
                      <li>support@subeb.com</li>
                      <li>+234 802 532 1179</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2E2E2E] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[#A0A0A0] text-sm text-center sm:text-left">
                  © 2025 SUBEB, subsidiary of Best Technologies Limited
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-[#2E2E2E] rounded-full flex items-center justify-center hover:bg-[#3E3E3E] transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-[#A0A0A0]" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-[#2E2E2E] rounded-full flex items-center justify-center hover:bg-[#3E3E3E] transition-colors"
                  >
                    <Image
                      src="/svgs/x-social.svg"
                      alt="X (Twitter)"
                      width={16}
                      height={16}
                    />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-[#2E2E2E] rounded-full flex items-center justify-center hover:bg-[#3E3E3E] transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-[#A0A0A0]" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-[#2E2E2E] rounded-full flex items-center justify-center hover:bg-[#3E3E3E] transition-colors"
                  >
                    <Facebook className="w-4 h-4 text-[#A0A0A0]" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </footer>
  );
}
