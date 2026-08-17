"use client";

import { useState } from "react";
import Image from "next/image";
import { HelpCircle, CheckCircle2, ArrowRight, RotateCcw, X, Sparkles } from "lucide-react";
import { products, Product } from "@/lib/store";

interface AyurvedicQuizModalProps {
  onAddToCart: (product: Product) => void;
  openDirectly?: boolean;
  onClose?: () => void;
}

export default function AyurvedicQuizModal({
  onAddToCart,
  openDirectly = false,
  onClose,
}: AyurvedicQuizModalProps) {
  const [modalOpen, setModalOpen] = useState(openDirectly);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<{ goal?: string; energy?: string; digestion?: string }>({});
  const [recommended, setRecommended] = useState<Product[]>([]);

  const questions = [
    {
      id: "goal",
      question: "What is your primary health & wellness goal?",
      options: [
        "Regulate Blood Sugar Levels",
        "Boost Energy, Stamina & Muscle Fitness",
        "Glowing Skin & Hair Nutrition",
        "Flush Toxins & Improve Liver/Gut Care",
      ],
    },
    {
      id: "energy",
      question: "How do you feel by late afternoon (3-4 PM)?",
      options: [
        "Drained, low energy & fatigue",
        "Sluggish & bloated after meals",
        "Stressed & trouble winding down at night",
        "Generally fine, looking for general wellness",
      ],
    },
    {
      id: "digestion",
      question: "How would you describe your daily digestion?",
      options: [
        "Frequent acidity & sluggish metabolism",
        "Regular, but suffer from joint stiffness",
        "Occasional sugar cravings after meals",
        "Healthy & active",
      ],
    },
  ];

  const handleSelectOption = (questionId: string, option: string) => {
    const nextAnswers = { ...answers, [questionId]: option };
    setAnswers(nextAnswers);

    if (step < questions.length) {
      setStep(step + 1);
    } else {
      // Calculate Recommendations
      let match = products.slice(0, 2);
      if (nextAnswers.goal?.includes("Sugar")) {
        match = products.filter((p) => p.slug.includes("dia-free") || p.concern === "Sugar Management");
      } else if (nextAnswers.goal?.includes("Energy")) {
        match = products.filter((p) => p.slug.includes("shilajit") || p.concern === "Energy & Vitality");
      } else if (nextAnswers.goal?.includes("Skin")) {
        match = products.filter((p) => p.slug.includes("kumkumadi") || p.concern === "Skin & Hair");
      }
      setRecommended(match.length > 0 ? match : products.slice(0, 2));
      setStep(4);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({});
    setRecommended([]);
  };

  return (
    <>
      {/* Quiz Callout Banner */}
      <section id="quiz" className="mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#ddddd9] bg-gradient-to-r from-[#eef5df] via-white to-[#f8faf1] p-6 shadow-sm md:flex-row md:p-10">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#244f31] text-white shadow-md">
              <HelpCircle className="size-8 text-[#f2c94c]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#80a03c]">
                2-MINUTE HEALTH ASSESSMENT
              </span>
              <h3 className="text-xl font-black text-[#17231b] sm:text-2xl">
                Not sure which herb suits your Dosha?
              </h3>
              <p className="mt-1 text-xs text-[#666666] md:text-sm">
                Answer 3 quick questions to get clinically recommended formulas tailored to your metabolic type.
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full shrink-0 rounded-xl bg-[#244f31] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#1d3b24] md:w-auto md:text-sm"
          >
            TAKE 2-MIN QUIZ NOW
          </button>
        </div>
      </section>

      {/* Quiz Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => {
              setModalOpen(false);
              if (onClose) onClose();
            }}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => {
                setModalOpen(false);
                if (onClose) onClose();
              }}
              className="absolute right-4 top-4 rounded-full p-1 text-[#666666] hover:bg-[#f8faf1]"
            >
              <X className="size-5" />
            </button>

            {step <= questions.length ? (
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-[#80a03c]" />
                  <span className="text-xs font-bold text-[#80a03c]">
                    STEP {step} OF {questions.length}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-[#17231b]">
                  {questions[step - 1].question}
                </h3>

                <div className="mt-5 space-y-3">
                  {questions[step - 1].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(questions[step - 1].id, opt)}
                      className="flex w-full items-center justify-between rounded-xl border border-[#ddddd9] p-3 text-left text-xs font-semibold text-[#17231b] transition hover:border-[#244f31] hover:bg-[#eef5df] md:text-sm"
                    >
                      <span>{opt}</span>
                      <ArrowRight className="size-4 text-[#80a03c]" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-[#80a03c]">
                  <CheckCircle2 className="size-6" />
                  <h3 className="text-lg font-bold text-[#17231b]">
                    Your Personalized Ayurvedic Remedy
                  </h3>
                </div>
                <p className="mt-1 text-xs text-[#666666]">
                  Based on your responses, our Vaidyas recommend the following targeted formula:
                </p>

                <div className="mt-4 space-y-3">
                  {recommended.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between rounded-xl border border-[#ddddd9] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          width={48}
                          height={48}
                          className="size-12 rounded object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#17231b] line-clamp-1">{prod.name}</h4>
                          <span className="text-xs font-bold text-[#244f31]">₹{prod.price}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart(prod);
                          setModalOpen(false);
                        }}
                        className="rounded-lg bg-[#80a03c] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#244f31]"
                      >
                        ADD TO BASKET
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleReset}
                  className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-[#666666] underline hover:text-[#17231b]"
                >
                  <RotateCcw className="size-3.5" /> Retake Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
