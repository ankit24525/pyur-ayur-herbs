"use client";

import { useState } from "react";
import { Sparkles, Calendar, ShieldCheck, UserCheck, Video, CheckCircle2, X } from "lucide-react";

interface DoctorConsultationBannerProps {
  openModalDirectly?: boolean;
  onCloseModal?: () => void;
  data?: {
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
    doctorName: string;
    doctorTitle: string;
    doctorImage: string;
    doctorsOnlineText: string;
    availableSlotText: string;
  };
}

export default function DoctorConsultationBanner({
  openModalDirectly = false,
  onCloseModal,
  data,
}: DoctorConsultationBannerProps) {
  const [modalOpen, setModalOpen] = useState(openModalDirectly);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    concern: "Sugar Management",
    preferredTime: "Morning (9 AM - 12 PM)",
  });

  const badge = data?.badge || "Free Ayurvedic Doctor Consultation";
  const title = data?.title || "Confused about which Ayurvedic remedy is right for your body?";
  const subtitle = data?.subtitle || "Get a 1-on-1 personalized consultation with our certified Vaidyas. Receive customized dosha analysis, diet plans, and natural treatment routines.";
  const ctaText = data?.ctaText || "BOOK FREE CONSULTATION NOW";
  const doctorName = data?.doctorName || "Dr. Ananya Sharma (BAMS)";
  const doctorTitle = data?.doctorTitle || "Senior Ayurvedic Specialist • 12+ Yrs Exp";
  const doctorImage = data?.doctorImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80";
  const doctorsOnlineText = data?.doctorsOnlineText || "14 Doctors Currently Online";
  const availableSlotText = data?.availableSlotText || "Today, 4:30 PM";

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModalOpen(false);
      if (onCloseModal) onCloseModal();
    }, 3000);
  };

  return (
    <>
      {/* Consultation Banner Section */}
      <section id="consult" className="mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d3b24] via-[#244f31] to-[#122c1b] p-6 text-white shadow-xl md:p-10">
          {/* Subtle Background Pattern */}
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-[#80a03c]/20 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#80a03c] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
                <Sparkles className="size-3.5 text-[#f2c94c]" /> {badge}
              </span>

              <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {title}
              </h2>

              <p className="mt-3 text-xs text-white/80 sm:text-sm md:text-base">
                {subtitle}
              </p>

              {/* Trust Pillars */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2.5 backdrop-blur-xs">
                  <ShieldCheck className="size-5 text-[#f2c94c]" />
                  <span className="text-xs font-bold">100% Confidential</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2.5 backdrop-blur-xs">
                  <UserCheck className="size-5 text-[#80a03c]" />
                  <span className="text-xs font-bold">BAMS Certified Doctors</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2.5 backdrop-blur-xs col-span-2 sm:col-span-1">
                  <Video className="size-5 text-[#f2c94c]" />
                  <span className="text-xs font-bold">Video or Phone Call</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-8">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#80a03c] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#6c8930] hover:shadow-xl sm:text-sm"
                >
                  <Calendar className="size-4" />
                  <span>{ctaText}</span>
                </button>
              </div>
            </div>

            {/* Right Doctor Visual */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  {doctorImage && (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-[#80a03c]">
                      <img
                        src={doctorImage}
                        alt={doctorName}
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">{doctorName}</h4>
                    <p className="text-xs text-[#f2c94c]">{doctorTitle}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                      <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                      <span>{doctorsOnlineText}</span>
                    </div>
                  </div>
                </div>

                <hr className="my-3 border-white/10" />

                <div className="flex items-center justify-between text-xs text-white/90">
                  <span>Available Slot Today:</span>
                  <span className="font-bold text-[#80a03c]">{availableSlotText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => {
              setModalOpen(false);
              if (onCloseModal) onCloseModal();
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => {
                setModalOpen(false);
                if (onCloseModal) onCloseModal();
              }}
              className="absolute right-4 top-4 rounded-full p-1 text-[#666666] hover:bg-[#f8faf1]"
            >
              <X className="size-5" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="size-16 text-[#80a03c]" />
                <h3 className="mt-4 text-xl font-bold text-[#17231b]">Consultation Slot Confirmed!</h3>
                <p className="mt-2 text-xs text-[#666666]">
                  Our Ayurvedic Specialist will contact you via WhatsApp / Phone at your preferred slot.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-[#80a03c]" />
                  <h3 className="text-lg font-bold text-[#17231b]">Book Free 1-on-1 Consultation</h3>
                </div>
                <p className="mt-1 text-xs text-[#666666]">
                  No fees. 100% confidential advice from certified Vaidyas.
                </p>

                <form onSubmit={handleBookSlot} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17231b]">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter Full Name"
                      className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231b]">Mobile Number (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231b]">Primary Health Concern</label>
                    <select
                      value={formData.concern}
                      onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                    >
                      <option>Sugar Management</option>
                      <option>Gym & Stamina</option>
                      <option>Heart & BP</option>
                      <option>Fatty Liver Detox</option>
                      <option>Skin Radiance & Hair Care</option>
                      <option>Women's Hormonal Balance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231b]">Preferred Time Slot</label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                    >
                      <option>Morning (9 AM - 12 PM)</option>
                      <option>Afternoon (12 PM - 4 PM)</option>
                      <option>Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#244f31] py-3 text-xs font-black tracking-widest text-white shadow-lg transition hover:bg-[#1d3b24]"
                  >
                    CONFIRM APPOINTMENT
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
