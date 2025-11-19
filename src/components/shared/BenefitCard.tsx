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
      <div className="w-full h-[280px] relative">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      {/* Content Section */}
      <div className="px-5 py-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
