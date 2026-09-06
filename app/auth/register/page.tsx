// src/app/auth/register/page.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/motionWrappers';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, UserPlus, Fingerprint, ShieldCheck, KeyRound, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const cardEntranceVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.96, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const inputContainerVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const stepTransitionVariants: Variants = {
  initial: { opacity: 0, x: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, filter: 'blur(4px)', transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function RegisterPortal() {
  const router = useRouter();

  // Multi-step State
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Step 1: Submit Details & Request OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsSubmitting(true);
    try {

      console.log(process.env.NEXT_PUBLIC_API_BASE_URL, 'API Base URL');
      // Sends initial registration data and triggers OTP generation on backend
      const response = await axios.post(`${apiUrl}/user/registeruser`, {
        name,
        email,
        password,
        role,
      });

      toast.success(response.data?.message || 'Verification code sent to your email');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length === 0) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${apiUrl}/user/verifyOtp`, {
        email,
        otp: otp.trim(),
      });

      toast.success(response.data?.message || 'Account verified successfully!');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await axios.post(`${apiUrl}/user/resendOtp`, { email });
      toast.success(response.data?.message || 'A fresh code has been sent.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-[#eef4ed] px-4 relative overflow-hidden selection:bg-[#bfd2c2] antialiased">
        {/* Floating Ambient Blobs */}
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.05, 1], rotate: [360, 240, 120, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-[#93b59b]/20 rounded-full blur-[110px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 0.85, 1], rotate: [0, 120, 270, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d8e8d5]/25 rounded-full blur-[90px] pointer-events-none"
        />

        {/* Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#1f2b23_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Cinematic Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
          <AnimatePresence mode="wait">
            <motion.h2
              key={`${role}-${step}`}
              initial={{ opacity: 0, scale: 0.9, letterSpacing: '0.05em', filter: 'blur(6px)' }}
              animate={{ opacity: 0.04, scale: 1, letterSpacing: '0.24em', filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.08, letterSpacing: '0.32em', filter: 'blur(10px)' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[14vw] font-bold text-[#1f2b23] uppercase text-center whitespace-nowrap leading-none tracking-widest pt-16"
            >
              {step === 'otp' ? 'Verify' : role === 'admin' ? 'Build' : 'Join'}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Main Form Container */}
        <div className="w-full max-w-md relative z-10 space-y-8">
          {/* Back Navigation Link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="text-center"
          >
            {step === 'otp' ? (
              <button
                type="button"
                onClick={() => setStep('details')}
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#68806d] hover:text-[#1f2b23] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Change Email / Details
              </button>
            ) : (
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#68806d] hover:text-[#1f2b23] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Return to Showcase
              </Link>
            )}
          </motion.div>

          <motion.div variants={cardEntranceVariants} initial="hidden" animate="visible">
            {/* Role Toggle - Hidden on OTP step */}
            {step === 'details' && (
              <div className="flex justify-center mb-6 p-1.5 bg-[#d8e4d9]/50 backdrop-blur-sm border border-[#c4d5c6]/40 rounded-2xl max-w-[260px] mx-auto shadow-inner relative">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex-1 text-xs py-2.5 rounded-xl font-semibold uppercase tracking-wider transition-all duration-300 z-10 relative ${
                    role === 'client' ? 'text-[#1f2b23]' : 'text-[#68806d]'
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 text-xs py-2.5 rounded-xl font-semibold uppercase tracking-wider transition-all duration-300 z-10 relative ${
                    role === 'admin' ? 'text-[#1f2b23]' : 'text-[#68806d]'
                  }`}
                >
                  Therapist
                </button>

                <motion.div
                  layoutId="activeRegisterIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md z-0"
                  style={{ left: role === 'client' ? '6px' : 'calc(50% + 0px)' }}
                />
              </div>
            )}

            {/* Main Interactive Card */}
            <Card className="bg-white/90 backdrop-blur-md border-[#d8e4d9]/60 shadow-2xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#6d8573]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />

              <AnimatePresence mode="wait">
                {step === 'details' ? (
                  /* Step 1: User Registration Fields */
                  <motion.div
                    key="step-details"
                    variants={stepTransitionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <CardHeader className="space-y-2 text-center pt-8 pb-4">
                      <motion.div
                        key={role}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="mx-auto w-10 h-10 rounded-xl bg-[#eef5ef] border border-[#d9e6da] flex items-center justify-center text-[#4f6554] shadow-sm mb-1"
                      >
                        {role === 'admin' ? <Fingerprint className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      </motion.div>

                      <CardTitle className="font-serif text-3xl tracking-tight font-light text-[#1a2b1f]">
                        Create Account
                      </CardTitle>
                      <CardDescription className="text-[#68806d] text-xs font-light max-w-[280px] mx-auto leading-relaxed">
                        Register to join the practice workspace.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                      <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <motion.div custom={0} variants={inputContainerVariants} className="space-y-1">
                          <label className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest pl-1">
                            Full Name
                          </label>
                          <Input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Jane Doe"
                            className="border-[#d8e4d9] focus-visible:ring-[#6d8573]/60 rounded-xl h-11 bg-[#f5faf5]/50 text-sm transition-all text-[#1f2b23]"
                          />
                        </motion.div>

                        <motion.div custom={1} variants={inputContainerVariants} className="space-y-1">
                          <label className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest pl-1">
                            Email Address
                          </label>
                          <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@domain.com"
                            className="border-[#d8e4d9] focus-visible:ring-[#6d8573]/60 rounded-xl h-11 bg-[#f5faf5]/50 text-sm transition-all text-[#1f2b23]"
                          />
                        </motion.div>

                        <motion.div custom={2} variants={inputContainerVariants} className="space-y-1">
                          <label className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest pl-1">
                            Security Password
                          </label>
                          <Input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="border-[#d8e4d9] focus-visible:ring-[#6d8573]/60 rounded-xl h-11 bg-[#f5faf5]/50 text-sm transition-all text-[#1f2b23]"
                          />
                        </motion.div>

                        <motion.div custom={3} variants={inputContainerVariants} className="pt-3">
                          <Button
                            type="submit"
                            disabled={!name || !email || !password || isSubmitting}
                            className="w-full bg-[#203127] text-white hover:bg-[#17241c] transition-all font-medium py-6 rounded-xl text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Continue to Verification</span>
                                <motion.span
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </motion.span>
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-6 border-t border-[#d8e4d9] pt-5 text-center"
                      >
                        <p className="text-xs text-[#68806d] font-light">
                          Already registered?{' '}
                          <Link
                            href="/auth/login"
                            className="font-semibold text-[#1f2b23] hover:text-[#203127] transition-colors underline underline-offset-4"
                          >
                            Log In
                          </Link>
                        </p>
                      </motion.div>
                    </CardContent>
                  </motion.div>
                ) : (
                  /* Step 2: OTP Verification Screen */
                  <motion.div
                    key="step-otp"
                    variants={stepTransitionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <CardHeader className="space-y-2 text-center pt-8 pb-4">
                      <div className="mx-auto w-10 h-10 rounded-xl bg-[#eef5ef] border border-[#d9e6da] flex items-center justify-center text-[#4f6554] shadow-sm mb-1">
                        <KeyRound className="w-4 h-4" />
                      </div>

                      <CardTitle className="font-serif text-3xl tracking-tight font-light text-[#1a2b1f]">
                        Verify Code
                      </CardTitle>
                      <CardDescription className="text-[#68806d] text-xs font-light max-w-[300px] mx-auto leading-relaxed">
                        We sent a 6-digit security code to <br />
                        <span className="font-semibold text-[#1f2b23]">{email}</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                      <form onSubmit={handleOtpSubmit} className="space-y-5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest pl-1">
                            Verification Code
                          </label>
                          <Input
                            type="text"
                            maxLength={8}
                            autoFocus
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                            placeholder="Enter code"
                            className="border-[#d8e4d9] focus-visible:ring-[#6d8573]/60 rounded-xl h-12 bg-[#f5faf5]/50 text-center tracking-[0.4em] font-mono text-base font-semibold transition-all text-[#1f2b23]"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={!otp || isSubmitting}
                          className="w-full bg-[#203127] text-white hover:bg-[#17241c] transition-all font-medium py-6 rounded-xl text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Verify & Access Account</span>
                            </>
                          )}
                        </Button>
                      </form>

                      <div className="mt-6 border-t border-[#d8e4d9] pt-5 text-center flex flex-col items-center gap-2">
                        <p className="text-xs text-[#68806d] font-light">Didn't receive the code?</p>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isResending}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f2b23] hover:text-[#4f6554] transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                          {isResending ? 'Resending...' : 'Resend Code'}
                        </button>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}