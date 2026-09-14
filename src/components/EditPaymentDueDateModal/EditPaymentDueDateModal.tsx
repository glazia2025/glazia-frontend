'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Check, X } from 'lucide-react';

type Payment = {
  _id: string;
  amount: number;
  cycle: number;
  dueDate?: string;
  isApproved?: boolean;
};

type EditPaymentDueDateModalProps = {
  isOpen: boolean;
  title?: string;
  message?: React.ReactNode;
  payment?: Payment;
  onConfirm: (
    data: {
      payment: Payment;
      dueDate: string;
    },
    cb?: () => void
  ) => void;
  onClose: () => void;
};

const EditPaymentDueDateModal = ({
  isOpen,
  title = 'Edit Payment Due Date',
  message,
  payment,
  onConfirm,
  onClose,
}: EditPaymentDueDateModalProps) => {
  const [dueDate, setDueDate] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (payment?.dueDate) {
      const date = new Date(payment.dueDate);

      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      setDueDate(formattedDate);
    } else {
      setDueDate('');
    }

    setIsConfirmed(false);
    setError('');
  }, [payment, isOpen]);

  if (!isOpen || !payment) {
    return null;
  }

  const handleClose = () => {
    setIsConfirmed(false);
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    if (payment.isApproved) {
      setError('Payment already approved.');
      return;
    }

    if (payment.cycle !== 2) {
      setError("Only final payment's due date can be changed.");
      return;
    }

    if (!dueDate) {
      setError("Please select the final payment's due date.");
      return;
    }

    if (!isConfirmed) {
      setError('Check this box to proceed.');
      return;
    }

    onConfirm(
      {
        payment,
        dueDate,
      },
      () => {
        setIsConfirmed(false);
        setError('');
      }
    );
  };

  const currentDueDate = payment.dueDate
    ? new Date(payment.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Upon dispatch';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-800">
            {title}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Current Due Date */}
          <div className="mb-5 text-sm italic text-gray-500">
            {message || (
              <>
                Current due date:{' '}
                <strong className="font-semibold text-gray-700">
                  {currentDueDate}
                </strong>
              </>
            )}
          </div>

          {/* New Due Date */}
          <div className="mb-6">
            <label
              htmlFor="payment-due-date"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Edit the final payment&apos;s due date
            </label>

            <div className="relative">
              <input
                id="payment-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setError('');
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 pr-11 text-sm text-gray-700 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />

              <CalendarDays
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          {/* Confirmation */}
          <div>
            <p className="mb-3 text-sm font-bold leading-6 text-gray-700">
              Check the box below to confirm you&apos;re sure that you want to
              update this payment due date.
            </p>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => {
                  setIsConfirmed(e.target.checked);
                  setError('');
                }}
                className="h-4 w-4 rounded border-gray-300 text-slate-800 focus:ring-slate-500"
              />

              <span>Confirm</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            CLOSE
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={payment.isApproved}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={16} />
            UPDATE PAYMENT
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPaymentDueDateModal;