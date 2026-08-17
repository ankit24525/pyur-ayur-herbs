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

      const anchor = card.querySelector("a") as HTMLAnchorElement | null;
      const href = anchor?.getAttribute("href");
      if (!href) return;

      event.preventDefault();
      window.location.href = href;
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
