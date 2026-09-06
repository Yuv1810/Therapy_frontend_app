
// src/app/client/appointments/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Script from "next/script";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Mail,
  Phone,
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FadeInUp,
  PageTransition,
} from "@/components/motionWrappers";

// ============================================================
// RAZORPAY TYPE
// ============================================================

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ============================================================
// TYPES
// ============================================================

interface Slot {
  id: string;
  fromDate?: string;
  toDate?: string;
  date?: string;
  time?: string;
}

interface Appointment {
  id: number;

  name: string | null;

  reason: string | null;

  email: string;

  phoneNo: string | null;

  status: string;

  createdAt: string;

  // Stored in paise
  // 99900 = ₹999
  amount: number;

  slots: Slot[];

  // Optional payment information
  payment?: {
    id: string;
    status: string;
    razorpayPaymentId?: string | null;
  } | null;
}

// ============================================================
// COMPONENT
// ============================================================

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);

  // Appointment currently being paid
  const [payingAppointmentId, setPayingAppointmentId] =
    useState<number | null>(null);

  // ============================================================
  // FETCH APPOINTMENTS
  // ============================================================

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        toast.error(
          "Authentication required to view sessions."
        );

        setIsLoading(false);

        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/listofAppointments`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      console.log(
        "Appointments response:",
        response.data
      );

      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch appointments:",
        error
      );

      toast.error(
        "Unable to load your session archives."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (dateString: string) => {
    return new Date(
      dateString
    ).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================================================
  // TIME FORMAT
  // ============================================================

  const formatTime = (dateString: string) => {
    return new Date(
      dateString
    ).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // ============================================================
  // RAZORPAY PAYMENT
  // ============================================================

  const handlePayment = async (
    appointmentId: number
  ) => {
    try {
      // --------------------------------------------------------
      // Prevent multiple clicks
      // --------------------------------------------------------

      setPayingAppointmentId(appointmentId);

      // --------------------------------------------------------
      // Get authentication token
      // --------------------------------------------------------

      const token =
        sessionStorage.getItem("authToken");

      if (!token) {
        toast.error(
          "Authentication required."
        );

        setPayingAppointmentId(null);

        return;
      }

      // --------------------------------------------------------
      // Find appointment
      // --------------------------------------------------------

      const appointment =
        appointments.find(
          (apt) =>
            apt.id === appointmentId
        );

      if (!appointment) {
        toast.error(
          "Appointment not found."
        );

        setPayingAppointmentId(null);

        return;
      }

      console.log(
        "Starting payment for appointment:",
        appointment
      );

      // ========================================================
      // STEP 1
      // CREATE RAZORPAY ORDER
      // ========================================================
      //
      // IMPORTANT:
      //
      // We ONLY send appointmentId.
      //
      // We DO NOT send amount from frontend.
      //
      // Backend gets amount from database.
      //
      // ========================================================

      const response =
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/createOrder`,

          {
            appointmentId:
              appointmentId,
          },

          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

      console.log(
        "Create order response:",
        response.data
      );

      const data = response.data;

      // --------------------------------------------------------
      // Check backend response
      // --------------------------------------------------------

      if (!data.success) {
        toast.error(
          data.message ||
            "Unable to create payment order."
        );

        setPayingAppointmentId(null);

        return;
      }

      // ========================================================
      // STEP 2
      // GET DATA FROM BACKEND
      // ========================================================

      const razorpayOrderId =
        data.razorpayOrderId;

      const amount =
        data.amount;

      const currency =
        data.currency;

      const razorpayKey =
        data.key;

      console.log(
        "Razorpay Key:",
        razorpayKey
      );

      console.log(
        "Razorpay Order ID:",
        razorpayOrderId
      );

      console.log(
        "Amount:",
        amount
      );

      console.log(
        "Currency:",
        currency
      );

      // ========================================================
      // VALIDATION
      // ========================================================

      if (!razorpayKey) {
        console.error(
          "Razorpay key missing"
        );

        toast.error(
          "Razorpay configuration error."
        );

        setPayingAppointmentId(null);

        return;
      }

      if (!razorpayOrderId) {
        console.error(
          "Razorpay order ID missing"
        );

        toast.error(
          "Razorpay order was not created."
        );

        setPayingAppointmentId(null);

        return;
      }

      if (!amount) {
        console.error(
          "Payment amount missing"
        );

        toast.error(
          "Payment amount is missing."
        );

        setPayingAppointmentId(null);

        return;
      }

      // ========================================================
      // STEP 3
      // CHECK RAZORPAY SCRIPT
      // ========================================================

      if (!window.Razorpay) {
        toast.error(
          "Razorpay Checkout is still loading. Please try again."
        );

        setPayingAppointmentId(null);

        return;
      }

      // ========================================================
      // STEP 4
      // RAZORPAY OPTIONS
      // ========================================================

      const options = {
        // ------------------------------------------------------
        // PUBLIC Razorpay key
        // ------------------------------------------------------

        key: razorpayKey,

        // ------------------------------------------------------
        // Amount is already in paise
        //
        // 99900 = ₹999
        // ------------------------------------------------------

        amount: amount,

        currency: currency,

        // ------------------------------------------------------
        // Your application name
        // ------------------------------------------------------

        name: "Preetika",

        // ------------------------------------------------------
        // Payment description
        // ------------------------------------------------------

        description:
          `Appointment #${appointmentId}`,

        // ------------------------------------------------------
        // Razorpay Order ID
        // ------------------------------------------------------

        order_id:
          razorpayOrderId,

        // ======================================================
        // CUSTOMER DETAILS
        // ======================================================

        prefill: {
          name:
            appointment.name ||
            "",

          email:
            appointment.email ||
            "",

          contact:
            appointment.phoneNo ||
            "",
        },

        // ======================================================
        // THEME
        // ======================================================

        theme: {
          color: "#203127",
        },

        // ======================================================
        // PAYMENT SUCCESS
        // ======================================================

        handler:
          async function (
            razorpayResponse: any
          ) {
            try {
              console.log(
                "Payment completed."
              );

              console.log(
                "Payment ID:",
                razorpayResponse
                  .razorpay_payment_id
              );

              console.log(
                "Order ID:",
                razorpayResponse
                  .razorpay_order_id
              );

              console.log(
                "Signature:",
                razorpayResponse
                  .razorpay_signature
              );

              // =================================================
              // STEP 5
              // VERIFY PAYMENT ON BACKEND
              // =================================================

              const verifyResponse =
                await axios.post(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/verifyPayment`,

                  {
                    appointmentId:
                      appointmentId,

                    razorpay_payment_id:
                      razorpayResponse
                        .razorpay_payment_id,

                    razorpay_order_id:
                      razorpayResponse
                        .razorpay_order_id,

                    razorpay_signature:
                      razorpayResponse
                        .razorpay_signature,
                  },

                  {
                    headers: {
                      Authorization:
                        `${token}`,
                    },
                  }
                );

              console.log(
                "Verify payment response:",
                verifyResponse.data
              );

              // =================================================
              // PAYMENT VERIFIED
              // =================================================

              if (
                verifyResponse.data
                  .success
              ) {
                toast.success(
                  "Payment successful!"
                );

                // Refresh appointments
                await fetchAppointments();
              }

              // =================================================
              // PAYMENT VERIFICATION FAILED
              // =================================================

              else {
                toast.error(
                  verifyResponse
                    .data
                    .message ||
                    "Payment verification failed."
                );
              }
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              if (
                axios.isAxiosError(
                  error
                )
              ) {
                console.error(
                  "Backend verification error:",
                  error.response
                    ?.data
                );
              }

              toast.error(
                "Payment completed but verification failed. Please contact support."
              );
            } finally {
              setPayingAppointmentId(
                null
              );
            }
          },

        // ======================================================
        // PAYMENT FAILED
        // ======================================================

        modal: {
          ondismiss:
            function () {
              console.log(
                "Razorpay checkout closed"
              );

              setPayingAppointmentId(
                null
              );
            },
        },
      };

      // ========================================================
      // STEP 6
      // CREATE RAZORPAY INSTANCE
      // ========================================================

      console.log(
        "Opening Razorpay..."
      );

      const razorpay =
        new window.Razorpay(
          options
        );

      // ========================================================
      // PAYMENT FAILED EVENT
      // ========================================================

      razorpay.on(
        "payment.failed",
        function (
          response: any
        ) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          toast.error(
            response.error
              ?.description ||
              "Payment failed."
          );

          setPayingAppointmentId(
            null
          );
        }
      );

      // ========================================================
      // OPEN CHECKOUT
      // ========================================================

      razorpay.open();

    } catch (error) {
      // ========================================================
      // GENERAL ERROR
      // ========================================================

      console.error(
        "Payment error:",
        error
      );

      if (
        axios.isAxiosError(
          error
        )
      ) {
        console.error(
          "Backend error:",
          error.response
            ?.data
        );

        toast.error(
          error.response
            ?.data
            ?.message ||
            "Unable to create payment order."
        );
      } else {
        toast.error(
          "Unable to start payment."
        );
      }

      setPayingAppointmentId(
        null
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <PageTransition>

      {/* ======================================================
          RAZORPAY CHECKOUT SCRIPT
      ======================================================= */}

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-[#eef4ed] text-[#1f2b23] antialiased selection:bg-[#bfd2c2] pb-20 relative overflow-x-hidden">

        {/* ====================================================
            BACKGROUND BLOBS
        ===================================================== */}

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

        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[#d8e8d5]/20 rounded-full blur-[120px] pointer-events-none"
        />

        {/* ====================================================
            MAIN CONTAINER
        ===================================================== */}

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">

          {/* ==================================================
              HEADER
          =================================================== */}

          <FadeInUp>

            <div className="flex items-center justify-between border-b border-[#d8e4d9]/60 pb-6">

              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#68806d] hover:text-[#1f2b23] transition-colors"
              >

                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />

                Return to Portal

              </Link>

              <div className="flex items-center gap-3 text-xs tracking-wider text-[#68806d] font-medium">

                <span className="text-[10px] tracking-wider text-[#68806d] font-medium uppercase bg-white/80 px-3 py-1.5 rounded-full border border-[#d8e4d9]/60 shadow-sm">

                  Client Archive

                </span>

              </div>

            </div>

          </FadeInUp>

          {/* ==================================================
              HERO
          =================================================== */}

          <FadeInUp delay={0.05}>

            <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">

              <h1 className="font-serif text-4xl sm:text-5xl text-[#1b2c20] tracking-tight font-light">

                Your{" "}

                <span className="italic font-normal text-[#4f6554]">

                  Active Sessions

                </span>

              </h1>

              <p className="text-[#607264] text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed">

                Review your upcoming clinical blocks and therapeutic workspace parameters.

              </p>

            </div>

          </FadeInUp>

          {/* ==================================================
              CONTENT
          =================================================== */}

          <div className="pt-4">

            {/* =================================================
                LOADING
            ================================================== */}

            {isLoading ? (

              <FadeInUp delay={0.1}>

                <div className="flex flex-col items-center justify-center py-20 space-y-4">

                  <div className="w-8 h-8 rounded-full border-2 border-[#93b59b] border-t-[#203127] animate-spin" />

                  <p className="text-xs text-[#68806d] tracking-widest uppercase font-medium">

                    Retrieving records...

                  </p>

                </div>

              </FadeInUp>

            ) : appointments.length === 0 ? (

              /* =================================================
                 EMPTY STATE
              ================================================== */

              <FadeInUp delay={0.1}>

                <Card className="bg-white/70 border-[#d8e4d9]/60 backdrop-blur-sm shadow-sm p-12 rounded-3xl text-center flex flex-col items-center">

                  <div className="w-16 h-16 rounded-2xl bg-[#eef5ef] border border-[#d9e6da] flex items-center justify-center text-[#4f6554] shadow-sm mb-6">

                    <CalendarIcon className="w-7 h-7" />

                  </div>

                  <h3 className="font-serif text-2xl text-[#1b2c20] mb-2">

                    No Active Sessions

                  </h3>

                  <p className="text-sm text-[#68806d] max-w-sm mb-8">

                    You currently do not have any approved therapeutic blocks scheduled in your workspace.

                  </p>

                  <Link href="/client/book">

                    <Button className="bg-[#203127] text-white hover:bg-[#17241c] transition-colors py-6 px-8 rounded-xl text-xs uppercase tracking-widest font-medium shadow-md">

                      Request a Session

                    </Button>

                  </Link>

                </Card>

              </FadeInUp>

            ) : (

              /* =================================================
                 APPOINTMENTS
              ================================================== */

              <div className="space-y-6">

                {appointments.map(
                  (apt, index) => (

                    <FadeInUp
                      key={apt.id}
                      delay={
                        0.1 +
                        index *
                          0.05
                      }
                    >

                      <Card className="bg-white/90 border-[#d8e4d9]/60 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md hover:border-[#93b59b]/50">

                        {/* ======================================
                            CARD HEADER
                        ======================================= */}

                        <div className="px-6 py-5 border-b border-[#d8e4d9]/60 bg-[#f5faf5]/50 flex justify-between items-center flex-wrap gap-4">

                          <div>

                            <span className="text-[10px] font-bold text-[#7a8c7e] uppercase tracking-widest block mb-1">

                              Session Reference #{apt.id}

                            </span>

                            <h3 className="font-serif text-xl text-[#1b2c20]">

                              {apt.name ||
                                "Clinical Session"}

                            </h3>

                          </div>

                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#eef5ef] text-[#4f6554] border border-[#d9e6da] shadow-sm">

                            {apt.status}

                          </span>

                        </div>

                        {/* ======================================
                            CARD BODY
                        ======================================= */}

                        <div className="px-6 py-6">

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* ==================================
                                LEFT COLUMN
                            =================================== */}

                            <div className="space-y-5">

                              <div className="flex gap-3 items-start">

                                <FileText className="w-4 h-4 text-[#93b59b] shrink-0 mt-0.5" />

                                <div>

                                  <h4 className="text-xs font-semibold text-[#4f6554] uppercase tracking-wider mb-1">

                                    Clinical Focus

                                  </h4>

                                  <p className="text-sm text-[#1f2b23] leading-relaxed">

                                    {apt.reason ||
                                      "No specific concerns provided."}

                                  </p>

                                </div>

                              </div>

                              <div className="flex gap-3 items-start">

                                <Mail className="w-4 h-4 text-[#93b59b] shrink-0 mt-0.5" />

                                <div>

                                  <h4 className="text-xs font-semibold text-[#4f6554] uppercase tracking-wider mb-1">

                                    Contact Email

                                  </h4>

                                  <p className="text-sm text-[#1f2b23]">

                                    {apt.email}

                                  </p>

                                </div>

                              </div>

                              {apt.phoneNo && (

                                <div className="flex gap-3 items-start">

                                  <Phone className="w-4 h-4 text-[#93b59b] shrink-0 mt-0.5" />

                                  <div>

                                    <h4 className="text-xs font-semibold text-[#4f6554] uppercase tracking-wider mb-1">

                                      Contact Phone

                                    </h4>

                                    <p className="text-sm text-[#1f2b23]">

                                      {apt.phoneNo}

                                    </p>

                                  </div>

                                </div>

                              )}

                            </div>

                            {/* ==================================
                                RIGHT COLUMN
                            =================================== */}

                            <div className="bg-[#f8fbf8] rounded-xl border border-dashed border-[#d8e4d9] p-5 h-full">

                              <h4 className="flex items-center gap-2 text-xs font-semibold text-[#4f6554] uppercase tracking-wider mb-4">

                                <Clock className="w-4 h-4 text-[#93b59b]" />

                                Allocated Timeline Blocks

                              </h4>

                              {apt.slots &&
                              apt.slots.length >
                                0 ? (

                                <div className="space-y-3">

                                  {apt.slots.map(
                                    (slot) => (

                                      <div
                                        key={
                                          slot.id
                                        }
                                        className="bg-white border border-[#d8e4d9] rounded-lg p-3 flex flex-col shadow-sm"
                                      >

                                        <span className="text-sm font-medium text-[#1b2c20]">

                                          {slot.fromDate
                                            ? formatDate(
                                                slot.fromDate
                                              )
                                            : slot.date
                                            ? formatDate(
                                                slot.date
                                              )
                                            : "TBD"}

                                        </span>

                                        <span className="text-xs text-[#68806d] mt-1">

                                          {slot.fromDate &&
                                          slot.toDate
                                            ? `${formatTime(
                                                slot.fromDate
                                              )} - ${formatTime(
                                                slot.toDate
                                              )}`
                                            : slot.time
                                            ? slot.time
                                            : ""}

                                        </span>

                                      </div>

                                    )
                                  )}

                                </div>

                              ) : (

                                <p className="text-sm text-[#7a8c7e] italic">

                                  Timeline blocks pending assignment.

                                </p>

                              )}

                            </div>

                          </div>

                          {/* ====================================
                              PAYMENT SECTION
                          ===================================== */}

                          <div className="mt-6 pt-5 border-t border-[#d8e4d9]/60 flex items-center justify-between gap-4 flex-wrap">

                            {/* PAYMENT AMOUNT */}

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-[#eef5ef] border border-[#d9e6da] flex items-center justify-center">

                                <CreditCard className="w-5 h-5 text-[#4f6554]" />

                              </div>

                              <div>

                                <p className="text-[10px] uppercase tracking-widest font-semibold text-[#7a8c7e]">

                                  Session Fee

                                </p>

                                <p className="text-xl font-semibold text-[#1b2c20]">

                                  ₹
                                  {(
                                    apt.amount /
                                    100
                                  ).toFixed(
                                    2
                                  )}

                                </p>

                              </div>

                            </div>

                            {/* =================================
                                ALREADY PAID
                            ================================== */}

                            {apt.payment?.status ===
                            "CAPTURED" ? (

                              <Button
                                disabled
                                className="bg-green-700 text-white py-5 px-7 rounded-xl text-xs uppercase tracking-widest font-medium"
                              >

                                Payment Completed

                              </Button>

                            ) : (

                              /* =================================
                                 PAY BUTTON
                              ================================== */

                              <Button
                                onClick={() =>
                                  handlePayment(
                                    apt.id
                                  )
                                }
                                disabled={
                                  payingAppointmentId ===
                                  apt.id
                                }
                                className="bg-[#203127] text-white hover:bg-[#17241c] transition-colors py-5 px-7 rounded-xl text-xs uppercase tracking-widest font-medium shadow-md"
                              >

                                {payingAppointmentId ===
                                apt.id ? (

                                  <>

                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                                    Processing...

                                  </>

                                ) : (

                                  <>

                                    <CreditCard className="w-4 h-4 mr-2" />

                                    Pay ₹
                                    {(
                                      apt.amount /
                                      100
                                    ).toFixed(
                                      2
                                    )}

                                  </>

                                )}

                              </Button>

                            )}

                          </div>

                        </div>

                      </Card>

                    </FadeInUp>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </PageTransition>
  );
}
