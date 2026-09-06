

// src/app/client/book/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { authAtom } from "@/store/atom";
import dynamic from "next/dynamic";
import {
  Card,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FadeInUp,
  PageTransition,
} from "@/components/motionWrappers";
import {
  Clock,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Slot {
  id: string;
  fromDate: string;
  toDate: string;
  status: string;
}

interface FormData {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  concerns: string;
}

const Calendar = dynamic(
  () =>
    import("@/components/ui/calendar").then(
      (mod) => mod.Calendar
    ),
  { ssr: false }
);

export default function BookSession() {
  const router = useRouter();

  const [auth, setAuth] = useAtom(authAtom);

  // -----------------------------
  // BOOKING STATES
  // -----------------------------

  const [date, setDate] = useState<Date | undefined>(
    new Date()
  );

  const [selectedSlot, setSelectedSlot] =
    useState<Slot | null>(null);

  const [reason, setReason] = useState("");

  const [slots, setSlots] = useState<Slot[]>([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(true);

  // -----------------------------
  // CLIENT FORM STATES
  // -----------------------------

  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    gender: "",
    occupation: "",
    concerns: "",
  });

  // true = form already exists in backend
  // false = form does not exist
  const [hasForm, setHasForm] = useState(false);

  const [isFormLoading, setIsFormLoading] =
    useState(true);

  const [isFormSubmitting, setIsFormSubmitting] =
    useState(false);

  // =====================================================
  // AUTHENTICATION CHECK
  // =====================================================

  useEffect(() => {
    const token =
      sessionStorage.getItem("authToken");

    const userId =
      localStorage.getItem("userId");

    if (token && userId && !auth) {
      setAuth({
        id: userId,
        token: token,
      });
    }

    setIsCheckingAuth(false);
  }, [auth, setAuth]);

  // =====================================================
  // GET FORM DATA
  // =====================================================

  const getFormData = async () => {
    try {
      setIsFormLoading(true);

      const token =
        sessionStorage.getItem("authToken");

      if (!token) {
        return;
      }


const response = await axios.get(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/getFormData`,
  {
    params: {
       userId: localStorage.getItem("userId"),
    },
    headers: {
      Authorization: `${token}`,
    },
  }
);

      const form = response.data.form;

      console.log(
        "Existing form:",
        form
      );

      // Populate form with backend data
      setFormData({
        name: form.name || "",
        age:
          form.age !== null &&
          form.age !== undefined
            ? String(form.age)
            : "",
        gender: form.gender || "",
        occupation: form.occupation || "",
        concerns: form.concerns || "",
      });

      // Form exists
      setHasForm(true);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        // User does NOT have a form
        console.log(
          "No form found for this user"
        );

        setHasForm(false);
      } else {
        console.error(
          "Failed to get form:",
          error
        );

        toast.error(
          "Unable to load your client information."
        );
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  // =====================================================
  // CALL GET FORM AFTER AUTH IS READY
  // =====================================================

  useEffect(() => {
    if (auth) {
      getFormData();
    }
  }, [auth]);

  // =====================================================
  // SAVE FORM
  // =====================================================

  const submitFormData = async () => {
    try {
      setIsFormSubmitting(true);

      const token =
        sessionStorage.getItem("authToken");

      if (!token) {
        toast.error(
          "Authentication token not found."
        );
        return false;
      }

      // Frontend validation
      if (
        !formData.name.trim() ||
        !formData.age ||
        !formData.gender
      ) {
        toast.error(
          "Name, age and gender are required."
        );

        return false;
      }

      const userId = localStorage.getItem("userId");

const response = await axios.post(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/formData`,
  {
    name: formData.name.trim(),
    age: Number(formData.age),
    gender: formData.gender,
    occupation: formData.occupation.trim() || null,
    concerns: formData.concerns.trim() || null,
  },
  {
    params: {
      userId: userId,
    },
    headers: {
      Authorization: `${token}`,
    },
  }
);

      console.log(
        "Form saved:",
        response.data
      );

      // Form now exists
      setHasForm(true);

      toast.success(
        "Client information saved successfully!"
      );

      return true;
    } catch (error) {
      console.error(
        "Failed to save form:",
        error
      );

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Failed to save client information."
        );
      } else {
        toast.error(
          "Something went wrong."
        );
      }

      return false;
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // =====================================================
  // FETCH AVAILABLE SLOTS
  // =====================================================

  const getAvailableSlots = async () => {
    try {
      if (!date) {
        toast.error(
          "Please select a date first."
        );
        return;
      }

      const formattedDate =
        date.toLocaleDateString("en-CA");

      const token =
        sessionStorage.getItem("authToken");

      if (!token) {
        toast.error(
          "Authentication token not found."
        );
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/getAvailableSlots`,
        {
          params: {
            date: formattedDate,
          },
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      setSlots(
        response.data.slots || []
      );

      setSelectedSlot(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Status:",
          error.response?.status
        );

        console.error(
          "Response:",
          error.response?.data
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch available slots."
        );
      } else {
        console.error(
          "Unexpected error:",
          error
        );
      }
    }
  };

  // =====================================================
  // BOOK APPOINTMENT API
  // =====================================================

  const saveAppointmentApi = async (payload: {
    slotId: string;
    reason: string;
    date: string;
  }) => {
    const token =
      sessionStorage.getItem("authToken");

    const userId =
      localStorage.getItem("userId");

    console.log(
      "Booking payload:",
      payload
    );

    return await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/bookAppointment`,
      payload,
      {
        params: {
          userId: userId,
        },
        headers: {
          Authorization: `${token}`,
        },
      }
    );
  };

  // =====================================================
  // BOOKING HANDLER
  // =====================================================

  const handleBooking = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // Make sure form exists
    if (!hasForm) {
      toast.error(
        "Please complete your client information first."
      );
      return;
    }

    if (!date) {
      toast.error(
        "Please select a date."
      );
      return;
    }

    if (!selectedSlot) {
      toast.error(
        "Please select a time slot."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const formattedDate =
        date.toISOString().split("T")[0];

      // Book appointment
      await saveAppointmentApi({
        slotId: selectedSlot.id,
        reason,
        date: formattedDate,
      });

      toast.success(
        "Your clinical session has been requested successfully!"
      );

      // Clear selection
      setSelectedSlot(null);
      setReason("");

      // Refresh available slots
      await getAvailableSlots();

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error(
        "Failed to book session:",
        error
      );

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Failed to confirm booking."
        );
      } else {
        toast.error(
          "Failed to confirm booking."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // AUTH CHECKING SCREEN
  // =====================================================

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#eef4ed] flex items-center justify-center">
        <p className="text-sm text-[#68806d]">
          Checking authentication...
        </p>
      </div>
    );
  }

  // =====================================================
  // AUTHENTICATION GUARD
  // =====================================================

  if (!auth) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#eef4ed] text-[#1f2b23] antialiased selection:bg-[#bfd2c2] flex items-center justify-center px-4 relative overflow-hidden">

          {/* Ambient blobs */}

          <motion.div
            animate={{
              scale: [1, 1.1, 0.95, 1],
              rotate: [0, 90, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#93b59b]/20 rounded-full blur-[100px] pointer-events-none"
          />

          <motion.div
            animate={{
              scale: [1, 0.85, 1.1, 1],
              rotate: [360, 270, 90, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#d8e8d5]/20 rounded-full blur-[120px] pointer-events-none"
          />

          <div className="w-full max-w-md relative z-10">

            <FadeInUp>
              <Card className="bg-white/90 backdrop-blur-md border-[#d8e4d9]/60 shadow-2xl rounded-3xl p-6 text-center space-y-6">

                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#eef5ef] border border-[#d9e6da] flex items-center justify-center text-[#4f6554] shadow-sm">
                  <LockKeyhole className="w-5 h-5" />
                </div>

                <div className="space-y-2">

                  <CardTitle className="font-serif text-2xl tracking-tight font-light text-[#1a2b1f]">
                    Authentication Required
                  </CardTitle>

                  <CardDescription className="text-[#68806d] text-xs font-light max-w-[280px] mx-auto leading-relaxed">
                    You must be logged in to your client profile to book therapeutic sessions.
                  </CardDescription>

                </div>

                <div className="pt-2 space-y-3">

                  <Link
                    href="/auth/login"
                    className="block w-full"
                  >
                    <Button className="w-full bg-[#203127] text-white hover:bg-[#17241c] transition-colors py-6 rounded-xl text-xs uppercase tracking-widest font-medium shadow-md">
                      Continue to Login Portal
                    </Button>
                  </Link>

                  <Link
                    href="/auth/register"
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-[#d8e4d9] text-[#4f6554] hover:bg-[#eef5ef] transition-colors py-6 rounded-xl text-xs uppercase tracking-widest font-medium"
                    >
                      Create Client Account
                    </Button>
                  </Link>

                </div>

                <div className="pt-2 border-t border-[#d8e4d9]">

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#68806d] hover:text-[#1f2b23] transition-colors uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Return to Homepage
                  </Link>

                </div>

              </Card>
            </FadeInUp>

          </div>
        </div>
      </PageTransition>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <PageTransition>

      <div className="min-h-screen bg-[#eef4ed] text-[#1f2b23] antialiased selection:bg-[#bfd2c2] pb-20 relative overflow-x-hidden">

        {/* Background decoration */}

        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#93b59b]/15 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <FadeInUp>

            <div className="flex items-center justify-between border-b border-[#d8e4d9]/60 pb-6">

              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#68806d] hover:text-[#1f2b23] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Return to Home
              </Link>

              <div className="flex items-center gap-3 text-xs tracking-wider text-[#68806d] font-medium">

                Welcome,
                <span className="text-[#1f2b23] font-semibold">
                  User
                </span>

                <span className="text-[#d8e4d9]">
                  |
                </span>

                <span className="text-[10px] tracking-wider text-[#68806d] font-medium uppercase bg-white/80 px-3 py-1.5 rounded-full border border-[#d8e4d9]/60 shadow-sm">
                  Active Session
                </span>

              </div>

            </div>

          </FadeInUp>

          {/* =====================================================
              HERO
          ===================================================== */}

          <FadeInUp delay={0.05}>

            <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">

              <h1 className="font-serif text-4xl sm:text-5xl text-[#1b2c20] tracking-tight font-light">
                Initiate Your{" "}
                <span className="italic font-normal text-[#4f6554]">
                  Healing Workspace
                </span>
              </h1>

              <p className="text-[#607264] text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed">
                Select your parameters below to request a customized, one-on-one professional session block.
              </p>

            </div>

          </FadeInUp>

          {/* =====================================================
              CLIENT FORM
              ONLY SHOW IF FORM DOES NOT EXIST
          ===================================================== */}

          {!isFormLoading && !hasForm && (

            <FadeInUp delay={0.1}>

              <Card className="bg-white/90 border-[#d8e4d9]/60 backdrop-blur-sm shadow-sm p-6 rounded-2xl">

                <div className="space-y-1 mb-6">

                  <span className="text-[10px] font-bold text-[#7a8c7e] uppercase tracking-widest block">
                    Client Information
                  </span>

                  <h3 className="font-serif text-xl text-[#1b2c20]">
                    Complete Your Client Profile
                  </h3>

                  <p className="text-xs text-[#68806d]">
                    Please complete this information before submitting your session request.
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* NAME */}

                  <div>

                    <label className="text-xs font-semibold text-[#4f6554]">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your name"
                      className="mt-1 w-full border border-[#d8e4d9] rounded-xl p-3 text-sm bg-[#f5faf5]/50 focus:outline-none focus:ring-1 focus:ring-[#6d8573]"
                    />

                  </div>

                  {/* AGE */}

                  <div>

                    <label className="text-xs font-semibold text-[#4f6554]">
                      Age *
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: e.target.value,
                        })
                      }
                      placeholder="Enter your age"
                      className="mt-1 w-full border border-[#d8e4d9] rounded-xl p-3 text-sm bg-[#f5faf5]/50 focus:outline-none focus:ring-1 focus:ring-[#6d8573]"
                    />

                  </div>

                  {/* GENDER */}

                  <div>

                    <label className="text-xs font-semibold text-[#4f6554]">
                      Gender *
                    </label>

                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value,
                        })
                      }
                      className="mt-1 w-full border border-[#d8e4d9] rounded-xl p-3 text-sm bg-[#f5faf5]/50 focus:outline-none focus:ring-1 focus:ring-[#6d8573]"
                    >

                      <option value="">
                        Select gender
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>

                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>

                    </select>

                  </div>

                  {/* OCCUPATION */}

                  <div>

                    <label className="text-xs font-semibold text-[#4f6554]">
                      Occupation
                    </label>

                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          occupation: e.target.value,
                        })
                      }
                      placeholder="e.g. Software Engineer"
                      className="mt-1 w-full border border-[#d8e4d9] rounded-xl p-3 text-sm bg-[#f5faf5]/50 focus:outline-none focus:ring-1 focus:ring-[#6d8573]"
                    />

                  </div>

                  {/* CONCERNS */}

                  <div className="md:col-span-2">

                    <label className="text-xs font-semibold text-[#4f6554]">
                      Concerns
                    </label>

                    <textarea
                      value={formData.concerns}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          concerns: e.target.value,
                        })
                      }
                      placeholder="Briefly describe your concerns..."
                      rows={4}
                      className="mt-1 w-full border border-[#d8e4d9] rounded-xl p-3 text-sm bg-[#f5faf5]/50 focus:outline-none focus:ring-1 focus:ring-[#6d8573] resize-none"
                    />

                  </div>

                </div>

                {/* SAVE FORM BUTTON */}

                <div className="mt-5">

                  <Button
                    type="button"
                    disabled={
                      isFormSubmitting ||
                      !formData.name.trim() ||
                      !formData.age ||
                      !formData.gender
                    }
                    onClick={submitFormData}
                    className="w-full bg-[#203127] text-white hover:bg-[#17241c] rounded-xl"
                  >
                    {isFormSubmitting
                      ? "Saving..."
                      : "Save Client Information"}
                  </Button>

                </div>

              </Card>

            </FadeInUp>

          )}

          {/* FORM LOADING */}

          {isFormLoading && (

            <Card className="bg-white/90 border-[#d8e4d9]/60 p-6 rounded-2xl">

              <div className="text-center text-sm text-[#68806d]">
                Loading client information...
              </div>

            </Card>

          )}

          {/* =====================================================
              MAIN BOOKING AREA
          ===================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <div className="lg:col-span-4 space-y-6">

              <FadeInUp delay={0.1}>

                <Card className="bg-white/90 border-[#d8e4d9]/60 h-[520px] backdrop-blur-sm shadow-sm p-6 space-y-6 rounded-2xl">

                  <div className="border-b border-[#d8e4d9] pb-4">

                    <h3 className="font-serif text-xl text-[#1b2c20]">
                      Session Framework
                    </h3>

                    <p className="text-xs text-[#68806d] mt-1">
                      What to expect inside the workspace
                    </p>

                  </div>

                  <div className="space-y-4">

                    {[
                      {
                        icon: Clock,
                        title: "60-Minute Duration",
                        desc: "Dedicated safe timeline blocks for parsing complex identity metrics and systemic constraints.",
                      },
                      {
                        icon: ShieldCheck,
                        title: "Absolute Privacy",
                        desc: "Encrypted data channels maintaining deep medical configuration security and client anonymity.",
                      },
                      {
                        icon: Sparkles,
                        title: "Tailored Modalities",
                        desc: "Integrated narrative frameworks adjusted around your lifestyle matrix.",
                      },
                    ].map(
                      ({
                        icon: Icon,
                        title,
                        desc,
                      }) => (

                        <div
                          key={title}
                          className="flex gap-3 items-start"
                        >

                          <div className="p-2 bg-[#eef5ef] rounded-lg text-[#4f6554] border border-[#d9e6da] shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>

                          <div>

                            <h4 className="text-sm font-semibold text-[#1b2c20]">
                              {title}
                            </h4>

                            <p className="text-xs text-[#68806d] mt-0.5 leading-relaxed">
                              {desc}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                  <div className="bg-[#eef5ef] p-4 rounded-xl border border-[#d9e6da] flex gap-2.5 items-start">

                    <HelpCircle className="w-4 h-4 text-[#6d8573] shrink-0 mt-0.5" />

                    <p className="text-[11px] text-[#607264] leading-relaxed font-light">
                      Need adjustments or custom timezone processing? Leave a text note via our portal query workspace.
                    </p>

                  </div>

                </Card>

              </FadeInUp>

            </div>

            {/* =================================================
                BOOKING PANEL
            ================================================= */}

            <div className="lg:col-span-8">

              <form
                onSubmit={handleBooking}
                className="space-y-6"
              >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                  {/* =================================================
                      MILESTONE 01
                  ================================================= */}

                  <FadeInUp delay={0.15}>

                    <Card className="bg-white/90 border-[#d8e4d9]/60 backdrop-blur-sm shadow-sm p-4 h-[520px] flex flex-col rounded-2xl">

                      <div className="px-2 pt-2 pb-4 border-b border-[#d8e4d9] space-y-1 shrink-0">

                        <span className="text-[10px] font-bold text-[#7a8c7e] uppercase tracking-widest block">
                          Milestone 01
                        </span>

                        <h3 className="font-serif text-lg text-[#1b2c20]">
                          Select Session Date
                        </h3>

                      </div>

                      <div className="flex-1 overflow-y-auto py-4 flex justify-center items-center">

                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md"
                        />

                      </div>

                      <div className="pt-2 shrink-0">

                        <Button
                          type="button"
                          className="w-full bg-[#1b2c20] hover:bg-[#2c4633] text-white"
                          disabled={
                            !date ||
                            !hasForm ||
                            isFormLoading
                          }
                          onClick={
                            getAvailableSlots
                          }
                        >
                          {isFormLoading
                            ? "Loading..."
                            : !hasForm
                            ? "Complete Client Form First"
                            : "Get Available Slots"}
                        </Button>

                      </div>

                    </Card>

                  </FadeInUp>

                  {/* =================================================
                      MILESTONE 02
                  ================================================= */}

                  <FadeInUp delay={0.2}>

                    <Card className="bg-white/90 border-[#d8e4d9]/60 backdrop-blur-sm shadow-sm p-5 h-[520px] flex flex-col rounded-2xl overflow-hidden">

                      <div className="flex-1 flex flex-col min-h-0">

                        <div className="pb-4 border-b border-[#d8e4d9] space-y-1">

                          <span className="text-[10px] font-bold text-[#7a8c7e] uppercase tracking-widest block">
                            Milestone 02
                          </span>

                          <h3 className="font-serif text-lg text-[#1b2c20]">
                            Choose Available Slot
                          </h3>

                        </div>

                        <div className="pt-4 flex-1 overflow-y-auto pr-2">

                          {slots.length === 0 ? (

                            <div className="flex items-center justify-center h-full rounded-xl border border-dashed border-[#d8e4d9] bg-[#f8fbf8] p-4">

                              <p className="text-sm text-[#7a8c7e] text-center">

                                {!hasForm
                                  ? "Please complete your client information first."
                                  : "📅 Select a date from the calendar and click Get Available Slots."}

                              </p>

                            </div>

                          ) : (

                            <div className="grid grid-cols-1 gap-2">

                              {slots.map(
                                (slot) => {

                                  const from =
                                    new Date(
                                      slot.fromDate
                                    ).toLocaleTimeString(
                                      "en-IN",
                                      {
                                        hour: "2-digit",
                                        minute:
                                          "2-digit",
                                        hour12:
                                          false,
                                      }
                                    );

                                  const to =
                                    new Date(
                                      slot.toDate
                                    ).toLocaleTimeString(
                                      "en-IN",
                                      {
                                        hour: "2-digit",
                                        minute:
                                          "2-digit",
                                        hour12:
                                          false,
                                      }
                                    );

                                  const isSelected =
                                    selectedSlot?.id ===
                                    slot.id;

                                  return (

                                    <button
                                      key={slot.id}
                                      type="button"
                                      onClick={() =>
                                        setSelectedSlot(
                                          slot
                                        )
                                      }
                                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                                        isSelected
                                          ? "bg-[#203127] text-white border-[#203127] shadow-sm translate-x-1"
                                          : "bg-[#eef5ef]/50 text-[#4f6554] border-[#d8e4d9] hover:bg-[#e5f0e6]"
                                      }`}
                                    >

                                      <div className="flex flex-col">

                                        <span className="font-semibold">
                                          {from} - {to}
                                        </span>

                                        <span
                                          className={`text-[10px] mt-1 ${
                                            isSelected
                                              ? "text-green-200"
                                              : "text-[#7a8c7e]"
                                          }`}
                                        >
                                          {slot.status}
                                        </span>

                                      </div>

                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          isSelected
                                            ? "bg-white"
                                            : "bg-[#93b59b]"
                                        }`}
                                      />

                                    </button>

                                  );
                                }
                              )}

                            </div>

                          )}

                        </div>

                      </div>

                      <div className="mt-4 text-[11px] text-[#68806d] text-center bg-[#eef5ef] p-2.5 rounded-xl border border-[#d9e6da]">

                        Selected:{" "}

                        {date
                          ? date.toLocaleDateString(
                              "en-US",
                              {
                                dateStyle:
                                  "medium",
                              }
                            )
                          : "None"}

                        {selectedSlot && (
                          <>
                            {" "}at{" "}

                            {new Date(
                              selectedSlot.fromDate
                            ).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                                hour12:
                                  false,
                              }
                            )}

                            {" - "}

                            {new Date(
                              selectedSlot.toDate
                            ).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                                hour12:
                                  false,
                              }
                            )}
                          </>
                        )}

                      </div>

                    </Card>

                  </FadeInUp>

                </div>

                {/* =================================================
                    MILESTONE 03
                ================================================= */}

                <FadeInUp delay={0.25}>

                  <Card className="bg-white/90 border-[#d8e4d9]/60 backdrop-blur-sm shadow-sm p-6 space-y-4 rounded-2xl">

                    <div className="space-y-1">

                      <span className="text-[10px] font-bold text-[#7a8c7e] uppercase tracking-widest block">
                        Milestone 03
                      </span>

                      <h4 className="font-serif text-lg text-[#1b2c20]">
                        Clinical Background Focus (Optional)
                      </h4>

                      <p className="text-xs text-[#68806d]">
                        Share briefly any specific topics you would care to cover.
                      </p>

                    </div>

                    <textarea
                      placeholder="Type details or leave blank..."
                      rows={3}
                      className="w-full border border-[#d8e4d9] rounded-xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6d8573]/60 transition-shadow bg-[#f5faf5]/50 text-[#1f2b23] placeholder:text-[#a5b8aa] resize-none"
                      value={reason}
                      onChange={(e) =>
                        setReason(
                          e.target.value
                        )
                      }
                    />

                    <Button
                      type="submit"
                      disabled={
                        !date ||
                        !selectedSlot ||
                        !hasForm ||
                        isSubmitting ||
                        isFormLoading
                      }
                      className="w-full bg-[#203127] text-white hover:bg-[#17241c] transition-colors py-3 font-medium rounded-xl text-xs uppercase tracking-widest shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Processing Request..."
                        : !hasForm
                        ? "Complete Client Form First"
                        : "Confirm Session Request"}
                    </Button>

                  </Card>

                </FadeInUp>

              </form>

            </div>

          </div>

        </div>

      </div>

    </PageTransition>
  );
}