"use client";

import { Bangers } from "next/font/google";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalStyles() {
  return (
    <style jsx global>{`
      .menu-item {
        font-family: ${bangers.style.fontFamily};
        font-size: 1.2rem;
        letter-spacing: 1px;
      }
    `}</style>
  );
}
