"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock3,
  CornerDownRight,
  Filter,
  ShieldAlert,
  Loader2,
  UserRound,
  FileText,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";

interface QueryData {
  id: number;
  subject: string;
  message: string;
  response: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SlotData {
  id: number;
  fromDate: string;
  toDate: string;
  status: string;
}

interface AppointmentData {
  id: number;
  userId: number;
  name: string | null;
  age: number | null;
  gender: string | null;
  phoneNo: string | null;
  email: string;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  slots: SlotData[];
}

interface FormData {
  id: number;
  userId: number;
  name: string;
  age: number;
  gender: string;
  occupation: string | null;
  concerns: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [queries, setQueries] = useState<QueryData[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(true);

  const [submittingReplyId, setSubmittingReplyId] = useState<number | null>(
    null
  );

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);

  const [replies, setReplies] = useState<{
    [key: number]: string;
  }>({});

  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // ============================================
  // CLIENT FORM DATA STATE
  // ============================================

  const [selectedUserForm, setSelectedUserForm] =
    useState<FormData | null>(null);

  const [loadingUserForm, setLoadingUserForm] = useState<number | null>(null);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);

  // ============================================
  // ADMIN AUTHENTICATION
  // ============================================

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = sessionStorage.getItem("authToken");

        if (!token) {
          setIsAdmin(false);
          setLoadingAuth(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/checkAuth`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (
          response.data.success &&
          response.data.admin.role === "ADMIN"
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Admin authorization check failed:", error);
        setIsAdmin(false);
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAdminAuth();
  }, []);

  // ============================================
  // FETCH QUERIES
  // ============================================

  useEffect(() => {
    if (isAdmin) {
      fetchQueries();
    }
  }, [isAdmin]);

  // ============================================
  // FETCH APPOINTMENTS
  // ============================================

  useEffect(() => {
    if (isAdmin) {
      fetchAppointments(appointmentDate);
    }
  }, [appointmentDate, isAdmin]);

  // ============================================
  // FETCH SLOTS
  // ============================================

  useEffect(() => {
    if (isAdmin) {
      fetchSlotsByDate(selectedDate);
    }
  }, [selectedDate, isAdmin]);

  // ============================================
  // GET QUERIES
  // ============================================

  const fetchQueries = async () => {
    setLoadingQueries(true);

    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getQueries`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        setQueries(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch queries:", error);
      toast.error("Failed to load client queries.");
    } finally {
      setLoadingQueries(false);
    }
  };

  // ============================================
  // GET APPOINTMENTS
  // ============================================

  const fetchAppointments = async (date: string) => {
    setLoadingAppointments(true);

    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getAllAppointments`,
        {
          headers: {
            Authorization: `${token}`,
          },
          params: {
            date,
          },
        }
      );

      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error(
        "Failed to load appointments for the selected date."
      );
    } finally {
      setLoadingAppointments(false);
    }
  };

  // ============================================
  // GET SLOTS
  // ============================================

  const fetchSlotsByDate = async (date: string) => {
    setLoadingSlots(true);

    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getSlotsByDate`,
        {
          headers: {
            Authorization: `${token}`,
          },
          params: {
            date,
          },
        }
      );

      if (response.data.success) {
        setSlots(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      toast.error(
        "Failed to load time slots for the selected date."
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  // ============================================
  // GET USER FORM DATA
  // ============================================

  const fetchUserFormData = async (
    userId: number,
    appointmentId: number
  ) => {
    // If clicking the same appointment, close the form
    if (selectedAppointmentId === appointmentId) {
      setSelectedAppointmentId(null);
      setSelectedUserForm(null);
      return;
    }

    try {
      setLoadingUserForm(appointmentId);
      setSelectedAppointmentId(appointmentId);
      setSelectedUserForm(null);

      const token = sessionStorage.getItem("authToken");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getFormDataByUserId`,
        {
          headers: {
            Authorization: `${token}`,
          },
          params: {
            userId: userId,
          },
        }
      );

      if (response.data.success) {
        setSelectedUserForm(response.data.data);
      } else {
        toast.error(
          response.data.message || "Failed to load client form."
        );
      }
    } catch (error: any) {
      console.error("Failed to fetch user form:", error);

      if (error.response?.status === 404) {
        toast.error("Form data not found for this client.");
      } else {
        toast.error("Failed to load client form data.");
      }

      setSelectedUserForm(null);
    } finally {
      setLoadingUserForm(null);
    }
  };

  // ============================================
  // APPROVE / REJECT APPOINTMENT
  // ============================================

  const handleUpdateAppointmentStatus = async (
    appointmentId: number,
    newStatus: "APPROVED" | "REJECTED"
  ) => {
    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/approveOrRejectAppointment`,
        {
          appointmentId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId
              ? {
                  ...app,
                  status: newStatus,
                  slots: app.slots.map((s) => ({
                    ...s,
                    status:
                      newStatus === "APPROVED"
                        ? "BOOKED"
                        : "AVAILABLE",
                  })),
                }
              : app
          )
        );

        toast.success(
          response.data.message ||
            `Appointment ${newStatus.toLowerCase()} successfully`
        );

        fetchSlotsByDate(selectedDate);
      }
    } catch (error: any) {
      console.error("Failed to update status:", error);

      toast.error(
        error.response?.data?.message ||
          "Error updating appointment status."
      );
    }
  };

  // ============================================
  // UPDATE SLOT STATUS
  // ============================================

  const updateSlotStatus = (
    index: number,
    status: "AVAILABLE" | "BLOCKED" | "BOOKED"
  ) => {
    const updated = [...slots];

    updated[index].status = status;

    setSlots(updated);

    const slot = updated[index];
    const slotId = slot.id;

    const token = sessionStorage.getItem("authToken");

    axios
      .put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/toggleSlots`,
        {
          slotId,
          status,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          toast.success(
            res.data.message ||
              "Slot status updated successfully"
          );
        } else {
          toast.error(
            res.data.message ||
              "Failed to update slot status"
          );
        }
      })
      .catch((err) => {
        console.error("Error updating slot status:", err);

        toast.error("Error updating slot status");
      });
  };

  // ============================================
  // QUERY REPLY
  // ============================================

  const handleReplyChange = (
    id: number,
    value: string
  ) => {
    setReplies((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSendReply = async (id: number) => {
    const textToSend = replies[id];

    if (!textToSend?.trim()) return;

    setSubmittingReplyId(id);

    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/answerQuery`,
        {
          queryId: id,
          response: textToSend,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Query answered successfully"
        );

        setQueries((prevQueries) =>
          prevQueries.map((q) =>
            q.id === id ? response.data.data : q
          )
        );

        handleReplyChange(id, "");
      }
    } catch (error: any) {
      console.error(
        "Error sending query response:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to submit response."
      );
    } finally {
      setSubmittingReplyId(null);
    }
  };

  // ============================================
  // AUTH LOADING
  // ============================================

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#eef4ed] flex flex-col items-center justify-center text-[#203127]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#4f6554]" />

        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#68806d]">
          Verifying Admin Authorization...
        </p>
      </div>
    );
  }

  // ============================================
  // ACCESS RESTRICTED
  // ============================================

  if (!isAdmin) {
    return (
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
              You do not have administrative permissions to
              view this workspace. Please sign in with an
              authorized administrator account.
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
    );
  }

  // ============================================
  // ADMIN DASHBOARD
  // ============================================

  return (
    <div className="min-h-screen bg-[#eef4ed] p-8">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-[#203127]">
          Admin Dashboard
        </h1>

        <p className="text-[#6d8573] mt-2">
          Manage appointments, client queries and slot
          availability.
        </p>
      </div>

      {/* ============================================
          MAIN GRID
      ============================================ */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ============================================
            CLIENT QUERIES
        ============================================ */}

        <div className="bg-white rounded-3xl border border-[#d8e4d9] p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="text-[#203127]" />

            <h2 className="text-xl font-semibold text-[#203127]">
              Client Queries ({queries.length})
            </h2>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">

            {loadingQueries ? (
              <p className="text-sm text-[#6d8573] text-center py-6 animate-pulse">
                Loading client queries...
              </p>
            ) : queries.length === 0 ? (
              <p className="text-sm text-[#6d8573] text-center py-6">
                No queries found.
              </p>
            ) : (
              queries.map((item) => (
                <div
                  key={item.id}
                  className="border border-[#d8e4d9] rounded-2xl p-5 bg-[#fafcf9] transition-all duration-200"
                >

                  <div className="flex justify-between items-start gap-2 mb-2">

                    <div>
                      <span className="text-xs font-mono uppercase bg-[#e2ece4] px-2 py-1 rounded text-[#203127] tracking-wider font-semibold mr-2">
                        ID: #{item.id}
                      </span>

                      <h3 className="font-semibold text-[#203127] inline-block">
                        {item.subject}
                      </h3>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        item.response
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.response
                        ? "Replied"
                        : "Pending Action"}
                    </span>
                  </div>

                  <p
                    className="text-[11px] text-[#90a495] mb-3"
                    suppressHydrationWarning
                  >
                    Received:{" "}
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString("en-US")}{" "}
                    at{" "}
                    {new Date(
                      item.createdAt
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <p className="text-[#415547] text-sm bg-white border border-[#e4ebe5] p-3 rounded-xl italic">
                    "{item.message}"
                  </p>

                  {item.response ? (
                    <div className="mt-4 pt-3 border-t border-[#e8efe9] flex gap-2 items-start">

                      <CornerDownRight
                        className="text-green-600 shrink-0 mt-0.5"
                        size={16}
                      />

                      <div className="w-full">

                        <span className="text-xs font-semibold text-green-700">
                          Admin Response:
                        </span>

                        <p className="text-sm text-[#55695b] mt-0.5 bg-green-50/50 p-2.5 rounded-xl border border-green-100/60">
                          {item.response}
                        </p>

                        <p
                          className="text-[10px] text-[#90a495] mt-1 text-right"
                          suppressHydrationWarning
                        >
                          Updated:{" "}
                          {new Date(
                            item.updatedAt
                          ).toLocaleDateString("en-US")}
                        </p>

                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">

                      <textarea
                        placeholder="Type official system response here..."
                        value={replies[item.id] || ""}
                        onChange={(e) =>
                          handleReplyChange(
                            item.id,
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-[#d8e4d9] p-3 text-sm outline-none focus:border-[#203127] transition"
                        rows={2}
                      />

                      <button
                        onClick={() =>
                          handleSendReply(item.id)
                        }
                        disabled={
                          !replies[item.id]?.trim() ||
                          submittingReplyId === item.id
                        }
                        className="mt-2 w-full bg-[#203127] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#17241c] disabled:bg-gray-200 disabled:text-gray-400 transition"
                      >
                        {submittingReplyId === item.id
                          ? "Submitting Response..."
                          : "Submit Response"}
                      </button>

                    </div>
                  )}
                </div>
              ))
            )}

          </div>
        </div>

        {/* ============================================
            APPOINTMENT REQUESTS
        ============================================ */}

        <div className="bg-white rounded-3xl border border-[#d8e4d9] p-6 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

            <div className="flex items-center gap-3">

              <Clock3 className="text-[#203127]" />

              <h2 className="text-xl font-semibold text-[#203127]">
                Appointment Requests ({appointments.length})
              </h2>

            </div>

            <div className="flex items-center gap-2 bg-[#fafcf9] border border-[#d8e4d9] rounded-xl px-3 py-1.5">

              <Filter
                size={14}
                className="text-[#6d8573]"
              />

              <input
                type="date"
                value={appointmentDate}
                onChange={(e) =>
                  setAppointmentDate(e.target.value)
                }
                className="bg-transparent text-xs text-[#203127] outline-none font-medium"
              />

            </div>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">

            {loadingAppointments ? (
              <p className="text-sm text-[#6d8573] text-center py-6 animate-pulse">
                Loading appointments...
              </p>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-[#6d8573] text-center py-6">
                No appointments found for{" "}
                {appointmentDate}.
              </p>
            ) : (
              appointments.map((appointment) => {

                const clientName =
                  appointment.user?.name ||
                  appointment.name ||
                  "Unknown User";

                const clientEmail =
                  appointment.user?.email ||
                  appointment.email;

                const slotInfo =
                  appointment.slots?.[0];

                const formattedDate = slotInfo
                  ? new Date(
                      slotInfo.fromDate
                    ).toLocaleDateString("en-US")
                  : new Date(
                      appointment.createdAt
                    ).toLocaleDateString("en-US");

                const startTime = slotInfo
                  ? new Date(
                      slotInfo.fromDate
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                const endTime = slotInfo
                  ? new Date(
                      slotInfo.toDate
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                const isSelected =
                  selectedAppointmentId ===
                  appointment.id;

                return (
                  <div
                    key={appointment.id}
                    onClick={() =>
                      fetchUserFormData(
                        appointment.userId,
                        appointment.id
                      )
                    }
                    className={`border rounded-2xl p-4 bg-[#fafcf9] space-y-3 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-[#203127] shadow-md bg-[#f7faf7]"
                        : "border-[#d8e4d9] hover:border-[#9db4a2] hover:shadow-sm"
                    }`}
                  >

                    {/* Appointment Header */}

                    <div className="flex justify-between items-center">

                      <span className="text-xs font-mono uppercase bg-[#e2ece4] px-2 py-0.5 rounded text-[#203127] tracking-wider font-semibold">
                        ID: #{appointment.id}
                      </span>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          appointment.status ===
                          "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : appointment.status ===
                              "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {appointment.status}
                      </span>

                    </div>

                    {/* USER INFO */}

                    <div>
                      <h3 className="font-semibold text-[#203127] text-base">
                        {clientName}
                      </h3>

                      <p className="text-xs text-[#68806d]">
                        {clientEmail}
                      </p>

                      <p className="text-[11px] text-[#90a495] mt-1">
                        User ID: {appointment.userId}
                      </p>
                    </div>

                    {/* APPOINTMENT INFO */}

                    <div className="text-xs text-[#55695b] bg-white p-2.5 rounded-xl border border-[#e4ebe5] space-y-1">

                      <p suppressHydrationWarning>
                        <span className="font-medium text-[#203127]">
                          Scheduled Date:
                        </span>{" "}
                        {formattedDate}
                      </p>

                      <p suppressHydrationWarning>
                        <span className="font-medium text-[#203127]">
                          Slot:
                        </span>{" "}
                        {startTime} - {endTime}
                      </p>

                      {appointment.reason && (
                        <p className="italic text-[#708474]">

                          <span className="font-medium not-italic text-[#203127]">
                            Reason:
                          </span>{" "}

                          "{appointment.reason}"

                        </p>
                      )}

                    </div>

                    {/* ============================================
                        CLIENT FORM DATA
                    ============================================ */}

                    {isSelected && (
                      <div
                        className="bg-[#eef5ef] border border-[#d9e6da] rounded-xl p-4"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        <div className="flex items-center gap-2 mb-4">

                          <FileText
                            size={17}
                            className="text-[#4f6554]"
                          />

                          <h4 className="font-semibold text-[#203127] text-sm">
                            Client Form Information
                          </h4>

                        </div>

                        {loadingUserForm ===
                        appointment.id ? (

                          <div className="flex items-center justify-center gap-2 py-5">

                            <Loader2
                              className="w-4 h-4 animate-spin text-[#4f6554]"
                            />

                            <span className="text-xs text-[#68806d]">
                              Loading client information...
                            </span>

                          </div>

                        ) : selectedUserForm ? (

                          <div className="space-y-4">

                            {/* BASIC INFORMATION */}

                            <div className="grid grid-cols-2 gap-3">

                              <div className="bg-white rounded-lg p-3 border border-[#e4ebe5]">

                                <p className="text-[10px] uppercase tracking-wider text-[#90a495]">
                                  Name
                                </p>

                                <p className="text-sm font-semibold text-[#203127] mt-1">
                                  {selectedUserForm.name}
                                </p>

                              </div>

                              <div className="bg-white rounded-lg p-3 border border-[#e4ebe5]">

                                <p className="text-[10px] uppercase tracking-wider text-[#90a495]">
                                  Age
                                </p>

                                <p className="text-sm font-semibold text-[#203127] mt-1">
                                  {selectedUserForm.age}
                                </p>

                              </div>

                              <div className="bg-white rounded-lg p-3 border border-[#e4ebe5]">

                                <p className="text-[10px] uppercase tracking-wider text-[#90a495]">
                                  Gender
                                </p>

                                <p className="text-sm font-semibold text-[#203127] mt-1">
                                  {selectedUserForm.gender}
                                </p>

                              </div>

                              <div className="bg-white rounded-lg p-3 border border-[#e4ebe5]">

                                <p className="text-[10px] uppercase tracking-wider text-[#90a495]">
                                  Occupation
                                </p>

                                <p className="text-sm font-semibold text-[#203127] mt-1">
                                  {selectedUserForm.occupation ||
                                    "Not provided"}
                                </p>

                              </div>

                            </div>

                            {/* CONCERNS */}

                            <div className="bg-white rounded-lg p-3 border border-[#e4ebe5]">

                              <p className="text-[10px] uppercase tracking-wider text-[#90a495]">
                                Clinical Concerns
                              </p>

                              <p className="text-sm text-[#415547] mt-2 leading-relaxed">
                                {selectedUserForm.concerns ||
                                  "No concerns provided"}
                              </p>

                            </div>

                          </div>

                        ) : (

                          <div className="text-center py-4">

                            <UserRound
                              className="mx-auto text-[#9bad9f] mb-2"
                              size={24}
                            />

                            <p className="text-xs text-[#7a8c7e]">
                              No form data available for
                              this client.
                            </p>

                          </div>

                        )}

                      </div>
                    )}

                    {/* APPROVE / REJECT */}

                    <div className="flex gap-3 pt-1">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          handleUpdateAppointmentStatus(
                            appointment.id,
                            "APPROVED"
                          );
                        }}
                        disabled={
                          appointment.status ===
                          "APPROVED"
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          handleUpdateAppointmentStatus(
                            appointment.id,
                            "REJECTED"
                          );
                        }}
                        disabled={
                          appointment.status ===
                          "REJECTED"
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>

                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>

      {/* ============================================
          SLOT MANAGEMENT
      ============================================ */}

      <div className="bg-white rounded-3xl border border-[#d8e4d9] p-6 shadow-sm mt-6">

        <div className="flex items-center gap-3 mb-6">

          <Calendar className="text-[#203127]" />

          <h2 className="text-xl font-semibold text-[#203127]">
            Slot Management ({slots.length})
          </h2>

        </div>

        <div className="mb-6">

          <label className="block text-sm text-[#6d8573] mb-2">
            Select Date
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
            className="border border-[#d8e4d9] rounded-xl px-4 py-2 outline-none font-medium text-sm text-[#203127]"
          />

        </div>

        {loadingSlots ? (

          <p className="text-sm text-[#6d8573] text-center py-6 animate-pulse">
            Loading time slots...
          </p>

        ) : slots.length === 0 ? (

          <p className="text-sm text-[#6d8573] text-center py-6">
            No time slots found for {selectedDate}.
          </p>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {slots.map((slot, index) => {

              const startDisplay =
                new Date(
                  slot.fromDate
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

              const endDisplay =
                new Date(
                  slot.toDate
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

              return (
                <div
                  key={slot.id || index}
                  className="border border-[#d8e4d9] rounded-2xl p-4 bg-[#fafcf9]"
                >

                  <h3
                    className="font-medium text-[#203127]"
                    suppressHydrationWarning
                  >
                    {startDisplay} - {endDisplay}
                  </h3>

                  <p
                    className={`mt-2 text-xs font-semibold ${
                      slot.status === "AVAILABLE"
                        ? "text-green-600"
                        : slot.status === "BLOCKED"
                        ? "text-red-600"
                        : "text-orange-500"
                    }`}
                  >
                    {slot.status}
                  </p>

                  <select
                    value={slot.status}
                    onChange={(e) =>
                      updateSlotStatus(
                        index,
                        e.target.value as
                          | "AVAILABLE"
                          | "BLOCKED"
                          | "BOOKED"
                      )
                    }
                    className="w-full mt-4 border border-[#d8e4d9] rounded-xl px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="AVAILABLE">
                      AVAILABLE
                    </option>

                    <option value="BLOCKED">
                      BLOCKED
                    </option>

                    <option value="BOOKED">
                      BOOKED
                    </option>
                  </select>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}