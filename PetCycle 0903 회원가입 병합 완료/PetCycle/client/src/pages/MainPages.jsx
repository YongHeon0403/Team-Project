import React from "react";
import BasicLayout from "../layouts/BasicLayout";
import HeroSection from "../components/main/HeroSection";
import MainProductSection from "../components/main/MainProductSection";

export default function MainPages() {
  return (
    <BasicLayout>
      <div className="space-y-6 p-4">
        <HeroSection />
        <MainProductSection size={6} />
      </div>
    </BasicLayout>
  );
}
