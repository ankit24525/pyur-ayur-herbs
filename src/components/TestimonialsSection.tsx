"use client";

import Image from "next/image";
import { Star, CheckCircle, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const reviews = [
    {
      id: 1,
      name: "Rajesh K., Mumbai",
      verified: true,
      product: "Dia Free Juice (1L)",
      rating: 5,
      comment:
        "My fasting sugar levels dropped from 178 to 118 within 45 days of consistent morning consumption. No bitter aftertaste!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 2,
      name: "Priya Sharma, Bangalore",
      verified: true,
      product: "Pure Himalayan Shilajit",
      rating: 5,
      comment:
        "Remarkable difference in my daily stamina and afternoon energy levels. 100% authentic resin with lab testing certificate.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 3,
      name: "Dr. Vikram Joshi, Delhi",
      verified: true,
      product: "Artho Sure Juice",
      rating: 5,
      comment:
        "Recommended this to my elderly mother for knee stiffness. Her joint flexibility improved significantly in 3 weeks.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    },
  ];

  return (
    <section id="reviews" className="mx-auto max-w-[1440px] px-4 py-12 md:px-6 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#80a03c]">
          REAL STORIES, REAL RESULTS
        </span>
        <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-[#17231b] sm:text-3xl">
          Loved By 500,000+ Health Seekers
        </h2>
        <p className="mt-2 text-xs font-medium text-[#666666] md:text-sm">
          See how our natural Ayurvedic formulations have transformed daily lives across India.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="flex flex-col justify-between rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-xs transition hover:shadow-md"
          >
            <div>
              {/* Rating Stars */}
              <div className="flex items-center gap-1 text-[#f2c94c] mb-3">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="size-4 fill-[#f2c94c]" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-xs leading-relaxed text-[#17231b] italic md:text-sm">
                "{rev.comment}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#ddddd9] flex items-center gap-3">
              <div className="relative size-10 overflow-hidden rounded-full border border-[#80a03c]">
                <Image
                  src={rev.image}
                  alt={rev.name}
                  width={40}
                  height={40}
                  className="size-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-[#17231b]">{rev.name}</h4>
                  {rev.verified && (
                    <span title="Verified Buyer">
                      <CheckCircle className="size-3.5 text-[#80a03c]" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-[#666666]">
                  Verified Purchase: {rev.product}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
