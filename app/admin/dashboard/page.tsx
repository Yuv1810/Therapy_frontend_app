// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Heart,
  Sparkles,
  Star,
  Target,
  Shield,
  ArrowUpRight,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { FadeInUp, PageTransition } from '@/components/motionWrappers';
import dynamic from 'next/dynamic';
import axios from 'axios';

import { MessageCircleQuestion } from 'lucide-react';

// Dynamically load the WebGL 3D Sanctuary Canvas to prevent SSR hydration errors
const ImmersiveSanctuary = dynamic(
  () => import('@/components/ImmersiveSanctuary'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] sm:h-[520px] rounded-[40px] bg-[#d8e4d9]/30 animate-pulse border border-[#d8e4d9]/60 flex items-center justify-center text-[#68806d] text-xs uppercase tracking-widest font-medium">
        Initializing 3D Sanctuary Environment...
      </div>
    ),
  }
);

const titleContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.3 },
  },
};

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: 45,
    scale: 0.92,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function AdminDashboard() {
  const practiceOwnerName = 'Preetika Mohta';

  // State to track admin authentication and loading status
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Send authorization verification request to backend
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/checkAuth`, {
          headers: { Authorization: `${token}` },
        });

        console.log('Admin authorization verification response:', response.data);

        if (response.data.success && response.data.admin.role === 'ADMIN') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Admin authorization verification failed:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef4ed] flex flex-col items-center justify-center text-[#203127]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#4f6554]" />
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#68806d]">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  // 2. Restricted View (Non-Admin Users)
  if (!isAdmin) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#eef4ed] flex items-center justify-center px-6 py-12 text-[#1f2b23]">
          <div className="max-w-md w-full bg-white border border-[#d8e4d9] rounded-3xl p-8 text-center shadow-lg space-y-6">
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto text-red-600">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-[#1f2b23]">
                Access Restricted
              </h2>
              <p className="text-sm text-[#607264] leading-relaxed font-light">
                You do not have administrative permissions to view this sanctuary workspace. Please sign in with an authorized administrator account.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/auth/login"
                className="w-full bg-[#203127] hover:bg-[#17241c] text-white text-xs uppercase tracking-[0.2em] font-semibold py-3.5 rounded-full transition-all shadow-md block"
              >
                Go to Portal Login
              </Link>
              <Link
                href="/"
                className="w-full bg-[#eef5ef] hover:bg-[#e2ece4] text-[#203127] border border-[#d8e4d9] text-xs uppercase tracking-[0.2em] font-semibold py-3.5 rounded-full transition-all block"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // 3. Authorized View (Admin Workspace)
  return (
    <PageTransition>
      <div className="bg-[#eef4ed] min-h-screen text-[#1f2b23] overflow-x-hidden antialiased selection:bg-[#bfd2c2]">

        {/* =========================================================
            NAVBAR
        ========================================================= */}

        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#eef4ed]/80 border-b border-[#d8e4d9]/60 px-6 lg:px-16 py-5 flex items-center justify-between">

          <Link href="/" className="font-serif text-xl tracking-wide text-[#203127]">
            Preetika Mohta
            <span className="text-[#6d8573] text-[10px] align-super ml-0.5">®</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.22em] font-semibold text-[#68806d]">
            <a href="#about" className="hover:text-[#102015] transition-colors">About</a>
            <a href="#philosophy" className="hover:text-[#102015] transition-colors">Philosophy</a>
            <a href="#specialties" className="hover:text-[#102015] transition-colors">Specialties</a>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/auth/register"
              className="hidden sm:block text-xs uppercase tracking-[0.2em] font-semibold text-[#68806d] hover:text-[#102015]"
            >
              Join Practice
            </Link>
            <Link
              href="/auth/login"
              className="text-xs uppercase tracking-[0.2em] font-semibold text-[#68806d] hover:text-[#102015]"
            >
              Portal Access
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
            HERO BANNER
        ========================================================= */}

        <section className="bg-[#e8f0e9] border-b border-[#d8e4d9]/50 py-28 px-6 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[55vh]">

          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[radial-gradient(#1f2b23_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Floating blobs */}
          <motion.div
            animate={{ x: [0, 40, -20, 0], y: [0, -20, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-16 left-16 w-64 h-64 rounded-full bg-[#93b59b]/20 blur-[80px]"
          />
          <motion.div
            animate={{ x: [0, -50, 20, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 right-16 w-80 h-80 rounded-full bg-[#c4d5c6]/25 blur-[100px]"
          />

          <div className="max-w-4xl mx-auto space-y-8 relative z-10">

            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.1em', y: -15 }}
              animate={{ opacity: 1, letterSpacing: '0.28em', y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[11px] uppercase text-[#68806d] font-bold tracking-[0.28em]"
            >
              Clinical Psychologist
            </motion.p>

            <motion.h1
              variants={titleContainerVariants}
              initial="hidden"
              animate="visible"
              className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#1b2c20] tracking-tight select-none italic font-light py-2 px-4"
            >
              {practiceOwnerName.split('').map((letter, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  whileHover={{
                    y: -12,
                    scale: 1.04,
                    transition: { type: 'spring', stiffness: 350, damping: 15 },
                  }}
                  className="inline-block origin-bottom transition-colors duration-200 hover:text-[#203127] cursor-pointer"
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.h1>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.9, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-56 h-[1px] bg-gradient-to-r from-transparent via-[#6d8573]/50 to-transparent mx-auto relative my-6"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#eef4ed] border border-[#93b59b] flex items-center justify-center rounded-sm">
                <div className="w-1 h-1 bg-[#6d8573] rounded-full" />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-base sm:text-lg md:text-xl text-[#607264] font-light max-w-2xl mx-auto leading-relaxed"
            >
              Your safe space to be{' '}
              <span className="italic text-[#1b2c20] font-normal">heard</span>,{' '}
              <span className="italic text-[#1b2c20] font-normal">understood</span>{' '}
              &{' '}
              <span className="italic text-[#1b2c20] font-normal">grow</span>.
            </motion.p>
          </div>
        </section>

        {/* =========================================================
            ABOUT
        ========================================================= */}

        <section id="about" className="bg-white border-y border-[#d9e4db] py-28 px-6 lg:px-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-14">

            <div className="md:col-span-4 sticky top-28 space-y-3">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#7b8d7f] font-bold">
                The Clinician
              </span>
              <h2 className="font-serif text-4xl text-[#1a2b1f] font-light">
                About the Practice
              </h2>
            </div>

            <div className="md:col-span-8 space-y-8 text-[#5e7163] text-lg leading-relaxed font-light">
              <FadeInUp>
                <p>
                  Welcome to a space designed around quiet introspection. I am{' '}
                  <strong className="text-[#1d2c22] font-normal">Preetika Mohta</strong>, a
                  dedicated Clinical Psychologist specializing in systemic, cognitive, and
                  narrative-focused emotional realignment.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.1}>
                <p>
                  Modern professional systems frequently introduce cognitive frictions — burnout
                  cycles, identity fragmentations, and transition anxiety. By synthesizing
                  evidence-based modalities with relational dialogue parameters, we actively
                  collaborate to dismantle automatic cognitive loops.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.15}>
                <p>
                  Whether navigating anxiety, transitions, self-worth concerns, or emotional
                  regulation difficulties, this practice is designed as a calm collaborative
                  partnership centered around your growth.
                </p>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* =========================================================
            PHILOSOPHY
        ========================================================= */}

        <section id="philosophy" className="py-28 px-6 lg:px-16 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#7a8c7e] font-bold block mb-3">
              Methodological Pillars
            </span>
            <h3 className="font-serif text-4xl text-[#1c2d22] font-light">
              The Therapeutic Philosophy
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/admin/answerQuery">
              <div className="cursor-pointer">
                <PhilCard
                  icon={
                    <MessageCircleQuestion className="w-5 h-5 text-[#4f6554]" />
                  }
                  title="Client Query Management"
                  description="Review client concerns, respond to inquiries, and maintain meaningful communication through a dedicated query resolution workspace."
                />
              </div>
            </Link>
            
            <PhilCard
              icon={<Compass className="w-5 h-5 text-[#4f6554]" />}
              title="Narrative Extraction"
              description="Deconstructing the internal scripts and performance pressures that limit personal agency, allowing you to reauthor your primary life path."
            />
            <PhilCard
              icon={<Heart className="w-5 h-5 text-[#4f6554]" />}
              title="Somatic Integration"
              description="Recognizing emotional friction patterns where they manifest physically, processing systemic stress markers safely within the nervous system."
            />
            <PhilCard
              icon={<Sparkles className="w-5 h-5 text-[#4f6554]" />}
              title="Cognitive Recalibration"
              description="Deploying evidence-backed behavioral tools to notice cognitive biases, transform automatic friction loops, and foster structural resilience."
            />
          </div>
        </section>

        {/* =========================================================
            SPECIALTIES
        ========================================================= */}

        <section id="specialties" className="bg-[#16231a] py-28 px-6 lg:px-16 text-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14">

            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#8ca591] font-bold">
                Scope of Support
              </span>
              <h3 className="font-serif text-4xl font-light leading-tight">
                Specialized Care for{' '}
                <span className="italic text-[#b8cabd]">Modern Lives</span>
              </h3>
              <p className="text-[#8ca591] text-sm leading-relaxed max-w-sm font-light">
                Focused therapeutic support designed for anxiety systems, burnout recovery,
                emotional processing, and relational wellbeing.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SpecItem title="Executive Burnout Synergies" subtitle="Navigating performance fatigue, career pacing, and professional boundary structures." />
              <SpecItem title="Systemic Anxiety Matrices" subtitle="Deconstructing underlying thought dynamics and panic cycles." />
              <SpecItem title="Relational Integration" subtitle="Resolving interpersonal friction patterns and building emotional communication tools." />
              <SpecItem title="Identity Transitions" subtitle="Processing lifestyle updates, self-evaluation shifts, and situational changes." />
            </div>
          </div>
        </section>

        {/* =========================================================
            FOOTER
        ========================================================= */}

        <footer className="bg-[#0f1712] text-[#8da091] py-16 px-6 lg:px-16 border-t border-[#233126]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#233126]">

            <div className="md:col-span-4 space-y-4">
              <p className="font-serif text-2xl text-white">
                Preetika Mohta
                <span className="text-[#6f8573] text-[10px] ml-1">®</span>
              </p>
              <p className="text-[#708172] font-light leading-relaxed">
                Private therapeutic care space dedicated to emotional alignment,
                healing, resilience, and psychological empowerment.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9cb0a0] font-bold">Workspace Index</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">The Practice</a></li>
                <li><a href="#philosophy" className="hover:text-white transition-colors">Methodology</a></li>
                <li><a href="#specialties" className="hover:text-white transition-colors">Specialties</a></li>
                <li>
                  <Link href="/client/book" className="text-white hover:text-[#c9d8cb] flex items-center gap-1">
                    Schedule Consultation <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9cb0a0] font-bold">Portal Access</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/register" className="hover:text-white">Client Registration</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Client Login</Link></li>
                <li><Link href="/client/query" className="hover:text-white">Urgent Inquiry</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9cb0a0] font-bold">Practice Standards</p>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" /> HIPAA Compliant Infrastructure
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4" /> Registered Clinical Practice
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6c7d6f]">
            <p>© {new Date().getFullYear()} Preetika Mohta Practice. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Clinical Guidelines</a>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}

/* =========================================================
   PHILOSOPHY CARD
========================================================= */

function PhilCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <FadeInUp>
      <div className="bg-white border border-[#dbe7dc] rounded-3xl p-7 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
        <div className="w-fit p-3 rounded-2xl bg-[#eef5ef] border border-[#d9e6da]">
          {icon}
        </div>
        <h4 className="font-serif text-xl text-[#1e2d22]">{title}</h4>
        <p className="text-[#607264] leading-relaxed text-sm font-light">{description}</p>
      </div>
    </FadeInUp>
  );
}

/* =========================================================
   SPECIALTY ITEM
========================================================= */

function SpecItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-[#1b2b20] border border-[#2d4131] rounded-2xl p-6 hover:border-[#4f6955] hover:bg-[#213427] transition-all group">
      <h4 className="flex items-center justify-between text-white font-medium mb-2">
        {title}
        <Target className="w-4 h-4 text-[#7f9884] group-hover:text-[#c3d3c6] transition-colors" />
      </h4>
      <p className="text-[#8ea391] text-sm leading-relaxed font-light">{subtitle}</p>
    </div>
  );
}