// src/app/page.tsx
"use client";

import React, { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Compass,
  Heart,
  Sparkles,
  Star,
  Target,
  Shield,
  ArrowUpRight,
  Leaf,
  ArrowRight,
} from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { PageTransition } from "@/components/motionWrappers";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const FboParticles = dynamic(() => import("@/components/FboParticles"), {
  ssr: false,
});

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Initial Hero Timeline
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: -15, letterSpacing: "0.1em" },
        {
          opacity: 1,
          y: 0,
          letterSpacing: "0.28em",
          duration: 1,
        }
      )
        .fromTo(
          ".hero-letter",
          {
            opacity: 0,
            y: 40,
            rotateX: 50,
            scale: 0.9,
            filter: "blur(8px)",
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.03,
          },
          "-=0.5"
        )
        .fromTo(
          ".hero-desc",
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
          },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
          },
          "-=0.8"
        )
        .fromTo(
          ".hero-badge",
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
          },
          "-=0.6"
        )
        // Fade in the global scroll indicator
        .fromTo(
          ".global-scroll-indicator",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
          },
          "-=0.6"
        );

      // 2. Continuous Floating Blobs
      gsap.to(".blob-1", {
        x: 40,
        y: -30,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".blob-2", {
        x: -50,
        y: 30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 3. Global Scroll-Bound Vertical Line & Dot
      gsap.fromTo(
        ".scroll-indicator-line",
        { scaleY: 0, transformOrigin: "top" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );

      gsap.to(".scroll-indicator-dot", {
        top: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Dot Pulse Effect
      gsap.to(".scroll-indicator-dot", {
        boxShadow: "0px 0px 12px 3px rgba(255, 255, 255, 0.6)",
        scale: 1.3,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 4. Scroll-Triggered Reveal Elements
      const revealElements = gsap.utils.toArray(".reveal-up");

      revealElements.forEach((el: any) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: container }
  );

  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className="hero-letter inline-block">
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <PageTransition>
      <div
        ref={container}
        className="bg-[#eef4ed] min-h-screen text-[#1f2b23] overflow-x-hidden antialiased selection:bg-[#bfd2c2] relative"
      >
        {/* =========================================================
            GLOBAL SCROLL INDICATOR
        ========================================================= */}
        <div className="global-scroll-indicator fixed top-0 left-4 lg:left-8 h-screen py-32 flex flex-col items-center z-50 pointer-events-none hidden md:flex mix-blend-difference text-white">
          <div className="relative w-[1px] flex-1 bg-white/20">
            <div className="scroll-indicator-line absolute top-0 left-0 w-full h-full bg-white origin-top" />
            <div className="scroll-indicator-dot absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
          </div>
        </div>

        {/* =========================================================
            NAVBAR
        ========================================================= */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#eef4ed]/80 border-b border-[#d8e4d9]/60 px-6 lg:px-16 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl tracking-wide text-[#203127] pl-0 md:pl-12 lg:pl-16"
          >
            Preetika Mohta
            <span className="text-[#6d8573] text-[10px] align-super ml-0.5">
              ®
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.22em] font-semibold text-[#68806d]">
            <a
              href="#about"
              className="hover:text-[#102015] transition-colors"
            >
              About
            </a>

            <a
              href="#education"
              className="hover:text-[#102015] transition-colors"
            >
              Education
            </a>

            <a
              href="#experience"
              className="hover:text-[#102015] transition-colors"
            >
              Experience
            </a>

            <a
              href="#philosophy"
              className="hover:text-[#102015] transition-colors"
            >
              Philosophy
            </a>

            <a
              href="#specialties"
              className="hover:text-[#102015] transition-colors"
            >
              Specialties
            </a>
          </nav>

          <div className="flex items-center gap-4 lg:gap-5">
            <Link
              href="/client/proceedToPay"
              className="hidden lg:block text-xs uppercase tracking-[0.2em] font-semibold text-[#68806d] hover:text-[#102015]"
            >
              Payment
            </Link>

            <Link
              href="/auth/login"
              className="text-xs uppercase tracking-[0.2em] font-semibold text-[#68806d] hover:text-[#102015]"
            >
              Login / Signup
            </Link>

            <Link
              href="/client/book"
              className="bg-[#203127] hover:bg-[#17241c] text-white text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-full transition-all shadow-md"
            >
              Book Session
            </Link>
          </div>
        </header>

        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="relative min-h-[90vh] overflow-hidden flex items-center justify-center pb-10">
          {/* VIDEO BACKGROUND */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-foggy-forest-1560085543168?download=1080p"
              type="video/mp4"
            />
          </video>

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e1711]/50 via-[#102015]/55 to-[#eef4ed]/90" />

          {/* GRAIN */}
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />

          <FboParticles />

          {/* FLOATING BLOBS */}
          <div className="blob-1 absolute top-20 left-20 w-72 h-72 rounded-full bg-[#93b59b]/20 blur-[90px]" />

          <div className="blob-2 absolute bottom-10 right-20 w-96 h-96 rounded-full bg-[#d8e8d5]/20 blur-[120px]" />

          {/* HERO CONTENT */}
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-8">
            <p className="hero-subtitle text-[20px] uppercase tracking-[0.28em] text-[#d8e6d9] font-bold">
              Clinical Psychologist
            </p>

            {/* TITLE */}
            <div className="relative w-full py-2">
              <h1
                className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] text-white italic font-light leading-[0.9] tracking-tight flex flex-col items-center justify-center select-none relative z-10"
                style={{ perspective: "1000px" }}
              >
                {/* FIRST NAME */}
                <div className="flex flex-wrap justify-center">
                  {splitText("Preetika")}
                </div>

                {/* LAST NAME */}
                <div className="flex flex-wrap justify-center -mt-2 sm:-mt-4 md:-mt-6 pt-10">
                  {splitText("Mohta")}
                </div>
              </h1>
            </div>

            <p className="hero-desc text-lg sm:text-xl text-[#d8e4d9] font-light leading-relaxed max-w-2xl mx-auto mt-8">
              Where healing meets harmony
            </p>

            {/* CTA */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center overflow-hidden">
              <Link
                href="/client/book"
                className="hero-cta group bg-white text-[#1b2c20] px-8 py-4 rounded-full text-xs uppercase tracking-[0.22em] font-semibold flex items-center justify-center gap-3 hover:bg-[#edf4ed] transition-all"
              >
                Schedule Consultation

                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/client/query"
                className="hero-cta border-2 border-white/70 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full text-xs uppercase tracking-[0.22em] font-semibold hover:bg-white hover:text-[#1b2c20] transition-all"
              >
                Leave Inquiry
              </Link>
            </div>
          </div>

          {/* ACTIVE BADGE */}
          <div className="hero-badge absolute top-8 right-8 bg-[#132017]/90 border border-[#314438] backdrop-blur-xl rounded-full px-5 py-3 flex items-center gap-3 shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>

            <span className="text-white text-[10px] uppercase tracking-[0.22em] font-bold">
              Practice Active
            </span>
          </div>
        </section>

        {/* =========================================================
            INTRO
        ========================================================= */}
        <section className="px-6 lg:px-16 pt-28 pb-20 max-w-7xl mx-auto text-center space-y-6">
          <h2 className="reveal-up font-serif text-4xl sm:text-5xl text-[#1b2c20] font-light leading-[1.15] max-w-4xl mx-auto">
            A space to pause, reflect, and reconnect.
          </h2>

          <p className="reveal-up text-[#607264] text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Therapy tailored to your experiences, helping you make sense of
            what you feel, understand what you need, and move towards
            meaningful change.
          </p>
        </section>

        {/* =========================================================
            ABOUT
        ========================================================= */}
        <section
          id="about"
          className="bg-white border-y border-[#d9e4db] py-28 px-6 lg:px-16"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-14 pl-0 md:pl-12 lg:pl-16">
            <div className="reveal-up md:col-span-4 space-y-3">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#7b8d7f] font-bold">
                The Clinician
              </span>

              <h2 className="font-serif text-4xl text-[#1a2b1f] font-light">
                About My Practice
              </h2>
            </div>

            <div className="md:col-span-8 space-y-8 text-[#5e7163] text-lg leading-relaxed font-light">
              {/* INTRO TAGLINE */}
              <div className="reveal-up space-y-1">
                <p className="font-serif text-3xl text-[#1d2c22] font-light">
                  A space to pause.
                </p>

                <p className="font-serif text-3xl text-[#1d2c22] font-light">
                  To understand.
                </p>

                <p className="font-serif text-3xl text-[#1d2c22] font-light">
                  To grow.
                </p>
              </div>

              {/* PARAGRAPH 1 */}
              <p className="reveal-up">
                I believe therapy begins with feeling heard and understood.
                Every person brings their own story, experiences, and ways of
                making sense of the world — and therapy should honour that
                individuality.
              </p>

              {/* PARAGRAPH 2 */}
              <p className="reveal-up">
                My approach is eclectic and personalised, drawing from
                different therapeutic modalities based on your unique needs,
                concerns, and goals.
              </p>

              {/* PARAGRAPH 3 */}
              <p className="reveal-up">
                Whether you’re navigating difficult emotions, relationships,
                life transitions, or simply trying to understand yourself
                better, this is a space to explore, reflect, and move forward —
                at your own pace.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            EDUCATION BACKGROUND
        ========================================================= */}
        <section
          id="education"
          className="py-28 px-6 lg:px-16 max-w-7xl mx-auto pl-0 md:pl-20 lg:pl-24"
        >
          <div className="reveal-up text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#7a8c7e] font-bold block mb-3">
              Academic Rigor
            </span>

            <h3 className="font-serif text-4xl text-[#1c2d22] font-light">
              Educational Background
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="reveal-up bg-white border border-[#dbe7dc] rounded-3xl p-7 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4f6554]">
                Advanced Specialization
              </span>

              <h4 className="font-serif text-xl text-[#1e2d22]">
                M.Phil. in Clinical Psychology
              </h4>

              <p className="text-[#607264] text-sm font-light">
                The ICFAI University, Tripura
              </p>
            </div>

            <div className="reveal-up bg-white border border-[#dbe7dc] rounded-3xl p-7 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4f6554]">
                Post-Graduate Study
              </span>

              <h4 className="font-serif text-xl text-[#1e2d22]">
                M.Sc. in Clinical Psychology
              </h4>

              <p className="text-[#607264] text-sm font-light">
                CHRIST (Deemed to be) University, Bangalore
              </p>
            </div>

            <div className="reveal-up bg-white border border-[#dbe7dc] rounded-3xl p-7 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4f6554]">
                Undergraduate Foundation
              </span>

              <h4 className="font-serif text-xl text-[#1e2d22]">
                B.A. in Applied Psychology
              </h4>

              <p className="text-[#607264] text-sm font-light">
                Amity University, Kolkata
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            PHILOSOPHY
        ========================================================= */}
        <section
          id="philosophy"
          className="bg-white border-y border-[#d9e4db] py-28 px-6 lg:px-16 max-w-full"
        >
          <div className="max-w-7xl mx-auto pl-0 md:pl-20 lg:pl-24">
            <div className="reveal-up text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#7a8c7e] font-bold block mb-3">
                Methodological Pillars
              </span>

              <h3 className="font-serif text-4xl text-[#1c2d22] font-light">
                The Therapeutic Philosophy
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CardCard
                icon={<Compass className="w-5 h-5 text-[#4f6554]" />}
                title="Understanding"
                description="Therapy begins with being heard. A space to explore your thoughts, emotions, experiences, and patterns without judgement."
              />

              <CardCard
                icon={<Heart className="w-5 h-5 text-[#4f6554]" />}
                title="Collaboration"
                description="You are the expert on your own story. Therapy is a collaborative process where we work together to understand what you need and what works for you."
              />

              <CardCard
                icon={<Sparkles className="w-5 h-5 text-[#4f6554]" />}
                title="Growth"
                description="Change happens at your own pace. Through reflection and personalised therapeutic work, we work towards healthier ways of coping, meaningful change, and greater self-understanding."
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            SPECIALTIES
        ========================================================= */}
        <section
          id="specialties"
          className="bg-[#16231a] py-28 px-6 lg:px-16 text-white"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 pl-0 md:pl-12 lg:pl-16">
            <div className="reveal-up lg:col-span-5 space-y-4">
              <h3 className="font-serif text-4xl font-light leading-tight">
                A space to understand,{" "}
                <span className="italic text-[#b8cabd]">Heal & Grow</span>
              </h3>

              <p className="text-[#8ca591] text-sm leading-relaxed max-w-sm font-light">
                An integrative approach to psychological care, blending clinical insight with compassionate therapy to support understanding, healing, and growth.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SpecialtyItem
                title="Psychodiagnostics & Personal Growth"
                subtitle="Comprehensive psychological testing paired with insight-oriented therapy for self-understanding."
              />

              <SpecialtyItem
                title="Anxiety & Burnout Recovery"
                subtitle="Evidence-based treatment for panic cycles combined with relief for chronic stress and emotional fatigue."
              />

              <SpecialtyItem
                title="Relational Dynamics & Communication"
                subtitle="Clinical attachment support to improve communication patterns and build deep emotional safety."
              />

              <SpecialtyItem
                title="Mood Regulation & Life Transitions"
                subtitle="Structured interventions for mood stability alongside compassionate guidance through identity shifts."
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            CLINICAL EXPERIENCE & PLACEMENTS
        ========================================================= */}
        <section
          id="experience"
          className="bg-[#121c15] text-white py-28 px-6 lg:px-16 border-t border-[#233126]"
        >
          <div className="max-w-7xl mx-auto space-y-16 pl-0 md:pl-12 lg:pl-16">
            <div className="reveal-up text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#8ca591] font-bold block">
                Clinical Track Record
              </span>

              <h3 className="font-serif text-4xl font-light">
                Clinical Experience & Placements
              </h3>

              <p className="text-[#8ca591] text-sm font-light">
                Rigorous training and practice across premier psychiatric hospitals, mental health institutes, and specialized care centers.
              </p>
            </div>

            {/* METRICS BANNER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="reveal-up bg-[#1b2b20] border border-[#2d4131] rounded-2xl p-8 text-center space-y-2 shadow-lg">
                <p className="font-serif text-5xl text-white font-light">500+</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#8ea391] font-bold">
                  Patients Evaluated & Treated
                </p>
              </div>

              <div className="reveal-up bg-[#1b2b20] border border-[#2d4131] rounded-2xl p-8 text-center space-y-2 shadow-lg">
                <p className="font-serif text-5xl text-white font-light">6</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#8ea391] font-bold">
                  Premier Clinical Institutions
                </p>
              </div>
            </div>

            {/* PRACTICE LOCATIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {[
                {
                  name: "Modern Psychiatric Hospital",
                  location: "Agartala",
                },
                {
                  name: "Institute of Mental Health and Hospital",
                  location: "Agra",
                },
                {
                  name: "CHRIST Special School",
                  location: "Bangalore",
                },
                {
                  name: "Calcutta Pavlov Hospital",
                  location: "Kolkata",
                },
                {
                  name: "Asha Trust Foundation",
                  location: "Bangalore",
                },
                {
                  name: "Caring Minds - Institute of Mental Health",
                  location: "Kolkata",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="reveal-up bg-[#1b2b20]/60 border border-[#2d4131] rounded-2xl p-6 hover:border-[#4f6955] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-serif text-lg text-white font-light mb-1">
                        {item.name}
                      </h4>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#8ea391] font-medium">
                        {item.location}
                      </p>
                    </div>

                    <Shield className="w-5 h-5 text-[#6d8873] shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            FOOTER
        ========================================================= */}
        <footer className="bg-[#0f1712] text-[#8da091] py-16 px-6 lg:px-16 border-t border-[#233126]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#233126] pl-0 md:pl-12 lg:pl-16">
            <div className="md:col-span-4 space-y-4">
              <p className="font-serif text-2xl text-white">
                Preetika Mohta
                <span className="text-[#6f8573] text-[10px] ml-1">®</span>
              </p>

              <p className="text-[#708172] font-light leading-relaxed">
                Private therapeutic care space dedicated to emotional
                alignment, healing, resilience, and psychological empowerment.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9cb0a0] font-bold">
                Workspace Index
              </p>

              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    The Practice
                  </a>
                </li>

                <li>
                  <a
                    href="#education"
                    className="hover:text-white transition-colors"
                  >
                    Education
                  </a>
                </li>

                <li>
                  <a
                    href="#experience"
                    className="hover:text-white transition-colors"
                  >
                    Experience
                  </a>
                </li>

                <li>
                  <a
                    href="#philosophy"
                    className="hover:text-white transition-colors"
                  >
                    Methodology
                  </a>
                </li>

                <li>
                  <a
                    href="#specialties"
                    className="hover:text-white transition-colors"
                  >
                    Specialties
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9cb0a0] font-bold">
                Portal Access
              </p>

              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/auth/login"
                    className="hover:text-white"
                  >
                    Login / Signup
                  </Link>
                </li>

                <li>
                  <Link
                    href="/client/proceedToPay"
                    className="hover:text-white"
                  >
                    Make a Payment
                  </Link>
                </li>

                <li>
                  <Link href="/client/query" className="hover:text-white">
                    Urgent Inquiry
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9cb0a0] font-bold">
                Practice Standards
              </p>

              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  HIPAA Compliant Infrastructure
                </p>

                <p className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4" />
                  Registered Clinical Practice
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6c7d6f] pl-0 md:pl-12 lg:pl-16">
            <p>
              © {new Date().getFullYear()} Preetika Mohta Practice. All rights
              reserved.
            </p>

            <div className="flex gap-6">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>

              <a href="#" className="hover:text-white">
                Clinical Guidelines
              </a>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}

/* =========================================================
   CARD COMPONENT
========================================================= */

function CardCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="reveal-up bg-white border border-[#dbe7dc] rounded-3xl p-7 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className="w-fit p-3 rounded-2xl bg-[#eef5ef] border border-[#d9e6da]">
        {icon}
      </div>

      <h4 className="font-serif text-xl text-[#1e2d22]">
        {title}
      </h4>

      <p className="text-[#607264] leading-relaxed text-sm font-light">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SPECIALTY ITEM COMPONENT
========================================================= */

function SpecialtyItem({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="reveal-up bg-[#1b2b20] border border-[#2d4131] rounded-2xl p-6 hover:border-[#4f6955] hover:bg-[#213427] transition-all group">
      <h4 className="flex items-center justify-between text-white font-medium mb-2">
        {title}

        <Target className="w-4 h-4 text-[#7f9884] group-hover:text-[#c3d3c6] transition-colors" />
      </h4>

      <p className="text-[#8ea391] text-sm leading-relaxed font-light">
        {subtitle}
      </p>
    </div>
  );
}