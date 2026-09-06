// src/app/client/query/page.tsx
'use client';

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { queriesAtom } from '@/store/atom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageTransition, FadeInUp } from '@/components/motionWrappers';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RaiseQuery() {
  const [queries, setQueries] = useAtom(queriesAtom);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    await sendQueryApi({ subject, message });

    setQueries([
      ...queries,
      {
        id: Math.random().toString(),
        clientId: 'user-id',
        clientName: 'Client User',
        subject,
        message,
        status: 'open',
      },
    ]);

    setSubject('');
    setMessage('');
    alert('Query submitted successfully!');
  };

  const sendQueryApi = async (data: any) => {
    console.log('Query structure finalized:', data);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#eef4ed] text-[#1f2b23] antialiased selection:bg-[#bfd2c2] relative overflow-hidden">

        {/* Ambient blobs */}
        <motion.div
          animate={{ scale: [1, 1.1, 0.95, 1], rotate: [0, 60, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#93b59b]/15 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 0.9, 1.1, 1], rotate: [360, 240, 120, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#d8e8d5]/20 rounded-full blur-[90px] pointer-events-none"
        />

        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#1f2b23_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative z-10 max-w-xl mx-auto py-16 px-4">

          {/* Back link */}
          <FadeInUp>
            <div className="text-center mb-8">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#68806d] hover:text-[#1f2b23] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Return to Showcase
              </Link>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <Card className="bg-white/90 backdrop-blur-md border-[#d8e4d9]/60 shadow-2xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#6d8573]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />

              <CardHeader className="pt-8 pb-4 px-8">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#7a8c7e] font-bold block mb-2">
                  Clinical Inquiry
                </span>
                <CardTitle className="font-serif text-3xl text-[#1a2b1f] font-light">
                  Submit Practice Query
                </CardTitle>
                <p className="text-[#68806d] text-sm font-light leading-relaxed mt-1">
                  Share your question or concern and our team will drop you an email.
                </p>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest pl-1">Subject</label>
                    <Input
                      placeholder="e.g., Question regarding scheduling"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="border-[#d8e4d9] focus-visible:ring-[#6d8573]/60 rounded-xl h-11 bg-[#f5faf5]/50 text-sm text-[#1f2b23]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#68806d] uppercase tracking-widest pl-1">Message</label>
                    <textarea
                      placeholder="Detail your question or specific concerns..."
                      rows={5}
                      className="w-full border border-[#d8e4d9] rounded-xl p-3.5 text-sm bg-[#f5faf5]/50 text-[#1f2b23] focus:outline-none focus:ring-1 focus:ring-[#6d8573]/60 transition-all placeholder:text-[#a5b8aa] resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#203127] text-white hover:bg-[#17241c] transition-all font-medium py-6 rounded-xl text-xs uppercase tracking-widest shadow-md"
                    disabled={!subject || !message}
                  >
                    Send Query
                  </Button>
                </form>

                <div className="mt-6 border-t border-[#d8e4d9] pt-5 text-center">
                  <p className="text-xs text-[#68806d] font-light">
                    Want to book a session instead?{' '}
                    <Link
                      href="/client/book"
                      className="font-semibold text-[#1f2b23] underline underline-offset-4 hover:text-[#203127] transition-colors"
                    >
                      Schedule Consultation
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeInUp>
        </div>
      </div>
    </PageTransition>
  );
}