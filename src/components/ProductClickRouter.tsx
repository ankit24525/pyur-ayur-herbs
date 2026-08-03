"use client";

import { useEffect } from "react";
import { slugifyProductName } from "@/lib/product-detail-data";

export default function ProductClickRouter() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const card = target?.closest("article, [data-product-id]") as HTMLElement | null;
      if (!card) return;

      const clickedButton = target?.closest("button");
      if (clickedButton) return;

      const heading = card.querySelector("h2, h3")?.textContent?.trim();
      if (!heading) return;

      const slug = slugifyProductName(heading)
        .replace("amla-glow-juice", "amla-glow-juice")
        .replace("karela-jamun-drops", "karela-jamun-drops")
        .replace("ashwagandha-calm-capsules", "ashwagandha-calm-capsules")
        .replace("triphala-gut-cleanse", "triphala-gut-cleanse");

      event.preventDefault();
      window.location.href = `/products/${slug}`;
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
