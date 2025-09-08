"use client";

import React from "react";
import { XeraInterfaceMockup } from "./xera-interface-mockup";

export function ResponsiveMockupSection() {
  return (
    <section id="features" className="w-full">
      {/* Desktop/Tablet */}
      <div className="hidden md:block w-full py-8">
        <div className="w-full max-w-6xl mx-auto px-6">
          <XeraInterfaceMockup />
        </div>
      </div>
      {/* Mobile - stack and crop naturally */}
      <div className="md:hidden w-full py-6 px-4">
        <div className="w-full overflow-hidden rounded-xl border border-white/10">
          <div className="scale-[1.08] origin-top">
            <XeraInterfaceMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
