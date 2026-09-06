// src/app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { authAtom } from '@/store/atom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/motionWrappers';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const cardEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.96,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const inputContainerVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.15 * i,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function LoginPortal() {
  const router = useRouter();
  const setAuth = useSetAtom(authAtom);

  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


const userLogin = async (data: any): Promise<boolean> => {
  const res = await axios.post(
    `${apiUrl}/user/loginUser`,
    data,
    {
      validateStatus: () => true, // prevents Axios from throwing
    }
  );

console.log('Login API response:', res.status, res.data);

  if (res.status === 200 || res.data.success===true) {
    sessionStorage.setItem(
      "authToken",
      `Bearer ${res.data.token}`
    );

    localStorage.setItem("userId", res.data.userId);
    setAuth(res.data.userId); 

    toast.success("Login successful");
    return true;
  }

  if (res.status === 401) {
    toast.error(
      res.data?.message || "Invalid credentials"
    );
    return false;
  }

  if (res.status === 404) {
    // console.log(res.data);
    toast.error(`${res.data || "Login API not found"}`);
    return false;
  }

  if (res.status >= 500) {
    toast.error("Server error");
    return false;
  }

  toast.error(res.data?.message || "Login failed");
  return false;
};



const adminLogin = async (data: any): Promise<boolean> => {
  const res = await axios.post(
    `${apiUrl}/admin/loginAdmin`,
    data,
    {
      validateStatus: () => true, // prevents Axios from throwing
    }
  );

  if (res.status === 200 && res.data.success) {
    sessionStorage.setItem(
      "authToken",
      `Bearer ${res.data.token}`
    );

    toast.success("Admin login successful");
    return true;
  }

  if (res.status === 401) {
    toast.error(
      res.data?.message || "Invalid credentials"
    );
    return false;
  }

  if (res.status === 404) {
    // console.log(res.data);
    toast.error(`${res.data.message || "Login API not found"}`);
    return false;
  }

  if (res.status >= 500) {
    toast.error("Server error");
    return false;
  }

  toast.error(res.data?.message || "Login failed");
  return false;
};

const handleLoginSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (!email || !password) {
    toast.error("Please enter email and password");
    return;
  }

  if (role === "admin") {
    const success = await adminLogin({
      email,
      password,
    });

    if (!success) return;
  }else{
     const success = await userLogin({
      email,
      password,
    });

    if (!success) return;
  }

  // const mockUser = {
  //   id: role === "admin" ? "admin-1" : "client-1",
  //   name: role === "admin" ? "Preetika" : "Client User",
  //   email,
  //   role,
  // };

  

  router.push(
    role === "admin"
      ? "/admin/dashboard"
      : "/client/book"
  );
};





  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-[#eef4ed] px-4 relative overflow-hidden selection:bg-[#bfd2c2] antialiased">

        {/* Floating forest-green ambient blobs */}
        <motion.div
          animate={{ scale: [1, 1.15, 0.95, 1], rotate: [0, 90, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#93b59b]/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 0.85, 1.1, 1], rotate: [360, 270, 90, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#d8e8d5]/30 rounded-full blur-[120px] pointer-events-none"
        />

        {/* Grain dot overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#1f2b23_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Cinematic watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
          <AnimatePresence mode="wait">
            <motion.h2
              key={role}
              initial={{ opacity: 0, scale: 0.85, letterSpacing: '0.05em', filter: 'blur(8px)' }}
              animate={{ opacity: 0.04, scale: 1, letterSpacing: '0.22em', filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, letterSpacing: '0.3em', filter: 'blur(12px)' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[15vw] font-bold text-[#1f2b23] uppercase text-center whitespace-nowrap leading-none tracking-widest pt-12"
            >
              {role === 'admin' ? 'Space' : 'Portal'}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Form content */}
        <div className="w-full max-w-md relative z-10 space-y-8">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="text-center"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#68806d] hover:text-[#1f2b23] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Return to Showcase
            </Link>
          </motion.div>

          <motion.div variants={cardEntranceVariants} initial="hidden" animate="visible">

            {/* Role toggle */}
            <div className="flex justify-center mb-6 p-1.5 bg-[#d8e4d9]/50 backdrop-blur-sm border border-[#c4d5c6]/40 rounded-2xl max-w-[260px] mx-auto shadow-inner relative">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex-1 text-xs py-2.5 rounded-xl font-semibold uppercase tracking-wider transition-all duration-300 z-10 relative ${
                  role === 'client' ? 'text-[#1f2b23]' : 'text-[#68806d] hover:text-[#1f2b23]'
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 text-xs py-2.5 rounded-xl font-semibold uppercase tracking-wider transition-all duration-300 z-10 relative ${
                  role === 'admin' ? 'text-[#1f2b23]' : 'text-[#68806d] hover:text-[#1f2b23]'
                }`}
              >
                Therapist
              </button>

              <motion.div
                layoutId="activeRoleIndicator"
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md z-0"
                style={{ left: role === 'client' ? '6px' : 'calc(50% + 0px)' }}
              />
            </div>

            {/* Card */}
            <Card className="bg-white/90 backdrop-blur-md border-[#d8e4d9]/60 shadow-2xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#6d8573]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />

              <CardHeader className="space-y-2 text-center pt-8 pb-4">
                <motion.div
                  key={role}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="mx-auto w-10 h-10 rounded-xl bg-[#eef5ef] border border-[#d9e6da] flex items-center justify-center text-[#4f6554] shadow-sm mb-1"
                >
                  {role === 'admin' ? <KeyRound className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </motion.div>

                <CardTitle className="font-serif text-3xl tracking-tight font-light text-[#1a2b1f]">
                  {role === 'admin' ? 'Secure Terminal' : 'Portal Sign In'}
                </CardTitle>
                <CardDescription className="text-[#68806d] text-xs font-light max-w-[260px] mx-auto leading-relaxed">
                  Enter credentials to access your workspace.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleLoginSubmit} className="space-y-5">

                  <motion.div custom={0} variants={inputContainerVariants} className="space-y-1">
                    <label className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest pl-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@practice.com"
                      className="border-[#d8e4d9] focus-visible:ring-[#6d8573]/60 rounded-xl h-11 bg-[#f5faf5]/50 text-sm transition-all text-[#1f2b23]"
                    />
                  </motion.div>

                  <motion.div custom={1} variants={inputContainerVariants} className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest">Password</label>
                      <a href="#" className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest hover:text-[#1f2b23] transition-colors">
                        Forgot?
                      </a>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="border-[#d8e4d9] focus-visible:ring-[#6d8573]/60 rounded-xl h-11 bg-[#f5faf5]/50 text-sm transition-all text-[#1f2b23]"
                    />
                  </motion.div>

                  <motion.div custom={2} variants={inputContainerVariants} className="pt-3">
                    <Button
                      type="submit"
                      className="w-full bg-[#203127] text-white hover:bg-[#17241c] transition-all font-medium py-6 rounded-xl text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 group/btn"
                      disabled={!email || !password}
                    >
                      <span>Authorize Access</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.span>
                    </Button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="mt-6 border-t border-[#d8e4d9] pt-5 text-center"
                >
                  <p className="text-xs text-[#68806d] font-light">
                    {role === 'admin'
                      ? 'Protected practitioner channel. Unauthorized access is logged.'
                      : 'New to the practice? '}
                    {role !== 'admin' && (
                      <Link
                        href="/auth/register"
                        className="font-semibold text-[#1f2b23] hover:text-[#203127] transition-colors underline underline-offset-4"
                      >
                        Request Access
                      </Link>
                    )}
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}