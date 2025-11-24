"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BenefitCard from "@/components/shared/BenefitCard";
import Badge from "@/components/shared/Badge";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section
        className="-mt-24 pt-20 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: "#D7F5DC" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 pt-8 lg:pt-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
              Manage Results. Improve
              <br />
              Accuracy. Simplify Administration.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-brand-black-accent max-w-3xl mx-auto px-4">
              Our result management platform helps schools and institutions
              automate result uploads, performance tracking, and academic
              reporting — all from one secure dashboard.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-6xl mx-auto">
            {/* Glassmorphism border container */}
            <div className="relative p-2 sm:p-3 md:p-4 lg:p-5 rounded-2xl sm:rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xl">
              <Image
                src="/svgs/dashboard.svg"
                alt="Dashboard Preview"
                width={1200}
                height={800}
                className="w-full h-auto rounded-xl sm:rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>{" "}
      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge text="OUR BENEFITS" />
            <h2 className="text-4xl font-medium text-brand-black mt-4">
              Explore the benefits of our platform
            </h2>
            <p className="text-lg text-brand-black-accent mt-4 max-w-2xl mx-auto">
              Explore how our platform simplifies your administrative tasks with
              cutting-edge implementation and seamless user experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <BenefitCard
              image="/svgs/rectangle.svg"
              title="Smart Result Uploads"
              description="Upload scores in bulk, validate instantly, and reduce entry errors with our intuitive upload system."
            />
            <BenefitCard
              image="/svgs/rectangle.svg"
              title="Real-Time Oversight"
              description="Get a complete view of performance across classes, terms, and subjects — all from your admin dashboard."
            />
            <BenefitCard
              image="/svgs/rectangle.svg"
              title="Secure & Reliable"
              description="Your data is encrypted and automatically backed up, ensuring accuracy and protection at every step."
            />
            <BenefitCard
              image="/svgs/rectangle.svg"
              title="Analytics That Matter"
              description="Make informed decisions with automated reports, charts, and comparative analytics."
            />
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge text="HOW IT WORKS" />
            <h2 className="text-4xl font-medium text-brand-black mt-4">
              Your Workflow in Four Steps
            </h2>
            <p className="text-lg text-brand-black-accent mt-4 max-w-2xl mx-auto">
              Streamlined steps designed to save you time
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-[150px] items-center">
            <div className="space-y-8 relative">
              {/* Vertical dashed line */}
              <div className="absolute left-[10px] top-[2px] h-[calc(100%-76px)] w-[2px] border-l border-dashed border-brand-green" />

              <div className="flex items-start space-x-4 relative">
                <div className="w-5 h-5 bg-brand-green rounded-full flex-shrink-0 z-10 mt-[2px]" />
                <div>
                  <h3 className="text-xl font-medium text-brand-black mb-2">
                    Add Users & Set Roles
                  </h3>
                  <p className="text-brand-black-accent">
                    Admins invite staff and assign permissions, ensuring the
                    right people can upload, review, or approve results.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 relative">
                <div className="w-5 h-5 bg-brand-green rounded-full flex-shrink-0 z-10 mt-[2px]" />
                <div>
                  <h3 className="text-xl font-medium text-brand-black mb-2">
                    Upload Results Easily
                  </h3>
                  <p className="text-brand-black-accent">
                    Teachers or designated officers upload results using simple
                    forms or spreadsheets—no complex setup required.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 relative">
                <div className="w-5 h-5 bg-brand-green rounded-full flex-shrink-0 z-10 mt-[2px]" />
                <div>
                  <h3 className="text-xl font-medium text-brand-black mb-2">
                    Review & Approve Entries
                  </h3>
                  <p className="text-brand-black-accent">
                    Admins verify submissions, correct errors, and approve
                    results to ensure accuracy before publishing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 relative">
                <div className="w-5 h-5 bg-brand-green rounded-full flex-shrink-0 z-10 mt-[2px]" />
                <div>
                  <h3 className="text-xl font-medium text-brand-black mb-2">
                    Publish & Track Performance
                  </h3>
                  <p className="text-brand-black-accent">
                    Once approved, results are released instantly, and admins
                    can monitor activity, generate reports, and keep everything
                    organized.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden relative h-[600px]">
              <Image
                src="/imgs/how-it-works-image.jpg"
                alt="Workflow illustration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge text="FAQ'S" />
            <h2 className="text-4xl font-medium text-brand-black mt-4">
              Got Questions? We&apos;ve Got You Covered
            </h2>
            <p className="text-lg text-brand-black-accent mt-4 max-w-2xl mx-auto">
              Here&apos;s everything you need to know about using our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 md:gap-12 lg:gap-24 items-start">
            <div className="overflow-hidden aspect-square relative">
              <Image
                src="/imgs/question-mark.jpg"
                alt="FAQ illustration"
                width={500}
                height={580}
                className="object-cover rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(0)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 hover:cursor-pointer transition-colors"
                >
                  <span className="font-medium text-brand-black text-left">
                    What can I do on this platform?
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {openFaq === 0 ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    )}
                  </svg>
                </button>
                {openFaq === 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-brand-black-accent">
                      You can upload, manage & track student results in one
                      place. The platform streamlines workflows for exam
                      officers & administrators making result processing faster.
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(1)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 hover:cursor-pointer transition-colors"
                >
                  <span className="font-medium text-brand-black text-left">
                    Who is allowed to upload results?
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {openFaq === 1 ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    )}
                  </svg>
                </button>
                {openFaq === 1 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-brand-black-accent">
                      Only authorized users with proper permissions can upload
                      results. Administrators can assign roles and control
                      access levels for different staff members.
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(2)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 hover:cursor-pointer transition-colors"
                >
                  <span className="font-medium text-brand-black text-left">
                    Can multiple users work at the same time?
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {openFaq === 2 ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    )}
                  </svg>
                </button>
                {openFaq === 2 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-brand-black-accent">
                      Yes! Multiple users can work simultaneously without
                      conflicts. The system tracks all changes and maintains
                      data integrity across concurrent sessions.
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(3)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 hover:cursor-pointer transition-colors"
                >
                  <span className="font-medium text-brand-black text-left">
                    How secure is student data on the platform?
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {openFaq === 3 ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    )}
                  </svg>
                </button>
                {openFaq === 3 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-brand-black-accent">
                      Student data is highly secure with encryption, automatic
                      backups, and strict access controls. We comply with data
                      protection standards to ensure privacy.
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(4)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 hover:cursor-pointer transition-colors"
                >
                  <span className="font-medium text-brand-black text-left">
                    Can I track changes or see who uploaded what?
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {openFaq === 4 ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    )}
                  </svg>
                </button>
                {openFaq === 4 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-brand-black-accent">
                      Yes! The platform maintains detailed audit logs showing
                      who uploaded, modified, or approved results, along with
                      timestamps for complete transparency.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
