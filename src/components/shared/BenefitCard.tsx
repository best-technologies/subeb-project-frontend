import React from "react";
import Image from "next/image";

interface BenefitCardProps {
  image: string;
  title: string;
  description: string;
}

export default function BenefitCard({
  image,
  title,
  description,
}: BenefitCardProps) {
  return (
    <div className="border border-[#E5E7EA] rounded-lg overflow-hidden">
      {/* Image Section - 580x280 */}
      <div className="w-full h-[200px] md:h-[280px] relative">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      {/* Content Section */}
      <div className="px-5 py-6">
        <h3 className="text-lg sm:text-xl font-medium text-brand-black mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base md:text-lg text-brand-black-accent">
          {description}
        </p>
      </div>
    </div>
  );
}
