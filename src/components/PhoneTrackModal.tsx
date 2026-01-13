"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { trackPhone } from "@/services/trackPhoneApi";
import axios from "axios";

interface PhoneTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reason: string;
  title?: string;
  description?: string;
}

export default function PhoneTrackModal({
  isOpen,
  onClose,
  onSuccess,
  reason,
  title = "Enter your phone number",
  description = "Please share your phone number to continue.",
}: PhoneTrackModalProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhone("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    console.log(phone, reason, "<<<<<phone reason");

    await axios.post("https://api.glazia.in/api/user/track-phone", { phone, reason })
      .then(data => {
        console.log(data, "<<<<<response");
        onSuccess();
        onClose();
      })
      .catch(err => {
        console.log(err);
        setError(err.message || "Unable to verify your phone number.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <p className="text-sm text-gray-600">{description}</p>
          <div className="mt-4">
            <label htmlFor="phone-track" className="block text-sm font-medium text-gray-700">
              Phone number
            </label>
            <div className="mt-2 flex items-center rounded-lg border border-gray-300 px-3 py-2 focus-within:border-[#124657] focus-within:ring-1 focus-within:ring-[#124657]">
              <span className="text-sm text-gray-500">+91</span>
              <input
                id="phone-track"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className="ml-2 w-full border-0 p-0 text-gray-900 focus:outline-none"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#EE1C25] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f3a4a] disabled:cursor-not-allowed disabled:bg-gray-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
