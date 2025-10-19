"use client";

import { SectionBook } from "@/components/pitch/section-book";
import { SectionDemo } from "@/components/pitch/section-demo";
import { SectionNext } from "@/components/pitch/section-next";
import { SectionProblem } from "@/components/pitch/section-problem";
import { SectionSolution } from "@/components/pitch/section-solution";
import { SectionStart } from "@/components/pitch/section-start";
import { SectionPricing } from "@/components/pitch/section-pricing";
import { SectionTeam } from "@/components/pitch/section-team";
import { SectionTraction } from "@/components/pitch/section-traction";
import { SectionVision } from "@/components/pitch/section-vision";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { CarouselToolbar } from "./carousel-toolbar";

export function InvestorCarousel() {
  const [views, setViews] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    // Simulated view count - in production, this would fetch from a database
    setViews(150);
  }, []);

  return (
    <Carousel className="w-full min-h-full relative" setApi={setApi}>
      <CarouselContent>
        <CarouselItem>
          <SectionStart />
        </CarouselItem>
        <CarouselItem>
          <SectionProblem />
        </CarouselItem>
        <CarouselItem>
          <SectionSolution />
        </CarouselItem>
        <CarouselItem>
          <SectionDemo />
        </CarouselItem>
        <CarouselItem>
          <SectionTraction />
        </CarouselItem>
        <CarouselItem>
          <SectionTeam />
        </CarouselItem>
        <CarouselItem>
          <SectionPricing />
        </CarouselItem>
        <CarouselItem>
          <SectionVision />
        </CarouselItem>
        <CarouselItem>
          <SectionNext />
        </CarouselItem>
        <CarouselItem>
          <SectionBook />
        </CarouselItem>
      </CarouselContent>

      {api && <CarouselToolbar api={api} views={views} />}
    </Carousel>
  );
}
