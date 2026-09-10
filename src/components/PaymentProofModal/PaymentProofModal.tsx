"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ArrowLeft,
  Upload,
  FileText,
  Check,
} from "lucide-react";

type Payment = {
  _id: string;
  amount: number;
  cycle: number;
  proof?: string;
  isApproved?: boolean;
  proofAdded?: boolean;
  createdAt?: string;
  dueDate?: string;
};

type DriverInfo = {
  name: string;
  phone: string;
  description: string;
};

type ConfirmData = {
  payment: Payment;
  finalPaymentDueDate: string | null;
  depositedAmount: number;
  driverInfo: DriverInfo;
  eWayBill: string | null;
  taxInvoice: string | null;
};

type PaymentProofModalProps = {
  isOpen: boolean;
  title?: string;
  message?: React.ReactNode;
  payment?: Payment;
  onConfirm?: (
    data: ConfirmData,
    cb?: () => void
  ) => void | Promise<void>;
  onClose: () => void;
};

const PaymentProofModal = ({
  isOpen,
  title,
  message,
  payment,
  onConfirm,
  onClose,
}: PaymentProofModalProps) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  const [finalPaymentDueDate, setFinalPaymentDueDate] = useState("");
  const [paymentVal, setPaymentVal] = useState<number | string>(0);
  const [depositedAmount, setDepositedAmount] = useState("");

  const [onCompletionStep, setOnCompletionStep] = useState(false);

  const [driverInfo, setDriverInfo] = useState<DriverInfo>({
    name: "",
    phone: "",
    description: "",
  });

  const [eWayBill, setEWayBill] = useState<File | null>(null);
  const [taxInvoice, setTaxInvoice] = useState<File | null>(null);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole"));
    }
  }, []);

  const clearModal = () => {
    setOnCompletionStep(false);

    setDriverInfo({
      name: "",
      phone: "",
      description: "",
    });

    setEWayBill(null);
    setTaxInvoice(null);
    setIsConfirmed(false);
    setFinalPaymentDueDate("");
    setPaymentVal(0);
    setDepositedAmount("");
    setErrors({});
  };

  const doOnClose = () => {
    clearModal();
    onClose();
  };

  const handleErrors = (key: string, value: string | null) => {
    setErrors((prev) => {
      const next = { ...prev };

      if (!value) {
        delete next[key];
      } else {
        next[key] = value;
      }

      return next;
    });
  };

  const convertFileToBase64 = (
    file: File
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const doOnConfirm = async () => {
    if (!payment) return;

    if (payment.isApproved) {
      return;
    }

    if (payment.cycle === 1 && !finalPaymentDueDate) {
      handleErrors(
        "finalPaymentDueDate",
        "Please select the final payment's due date"
      );
      return;
    }

    if (!depositedAmount || Number(depositedAmount) <= 0) {
      handleErrors(
        "depositedAmount",
        "Please enter the deposited amount"
      );
      return;
    }

    if (
      payment.cycle === 2 &&
      payment.isApproved &&
      !onCompletionStep
    ) {
      setOnCompletionStep(true);
      return;
    }

    if (
      payment.cycle === 2 &&
      payment.isApproved &&
      onCompletionStep
    ) {
      let hasErrors = false;

      if (!driverInfo) {
        handleErrors(
          "driver_info",
          "Driver info is required to complete the order"
        );
        hasErrors = true;
      }

      if (!driverInfo.name) {
        handleErrors(
          "driver_info.name",
          "Driver name is required to complete the order"
        );
        hasErrors = true;
      }

      if (!driverInfo.phone) {
        handleErrors(
          "driver_info.phone",
          "Driver phone is required to complete the order"
        );
        hasErrors = true;
      }

      if (driverInfo.description.length > 512) {
        handleErrors(
          "driver_info.description",
          "Driver description can not be more than 512 letters"
        );
        hasErrors = true;
      }

      if (!eWayBill) {
        handleErrors(
          "e_way_bill",
          "EWay Bill is required to complete the order"
        );
        hasErrors = true;
      }

      if (!taxInvoice) {
        handleErrors(
          "tax_invoice",
          "Tax Invoice is required to complete the order"
        );
        hasErrors = true;
      }

      if (hasErrors) {
        return;
      }
    }

    if (!isConfirmed) {
      handleErrors(
        "confirm_action",
        "Check this box to proceed"
      );
      return;
    }

    let eWayBillBase64: string | null = null;
    let taxInvoiceBase64: string | null = null;

    if (payment.cycle === 2 && payment.isApproved) {
      try {
        if (eWayBill) {
          eWayBillBase64 =
            await convertFileToBase64(eWayBill);
        }

        if (taxInvoice) {
          taxInvoiceBase64 =
            await convertFileToBase64(taxInvoice);
        }
      } catch (error) {
        console.error(
          "Error converting files to base64:",
          error
        );
        return;
      }
    }

    if (!onConfirm) return;

    onConfirm(
      {
        payment,
        finalPaymentDueDate,
        depositedAmount: parseFloat(depositedAmount),
        driverInfo,
        eWayBill: eWayBillBase64,
        taxInvoice: taxInvoiceBase64,
      },
      () => {
        clearModal();
      }
    );
  };

  const renderPdfOrImage = (proof?: string) => {
    if (!proof || !proof.length) {
      return (
        <div className="rounded-xl border-l-4 border-[#a02040] bg-[#a0204020] p-3 font-semibold text-[#902040]">
          Failed to render invalid payment proof
        </div>
      );
    }

    if (proof.startsWith("data:image")) {
      return (
        <img
          src={proof}
          alt="Payment Proof"
          className="w-full rounded-xl"
        />
      );
    }

    if (proof.startsWith("data:application/pdf")) {
      return (
        <iframe
          src={proof}
          title="Payment Proof PDF"
          className="h-[500px] w-full rounded-xl border"
        />
      );
    }

    return (
      <div className="rounded-xl border-l-4 border-[#a02040] bg-[#a0204020] p-3 font-semibold text-[#902040]">
        Failed to render invalid payment proof
      </div>
    );
  };

  if (
    !isOpen ||
    !payment ||
    !payment.proofAdded
  ) {
    return null;
  }

  const isAdminStyleRole = true;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          doOnClose();
        }
      }}
    >
      <div className="relative flex max-h-[95vh] w-full max-w-[450px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            {isAdminStyleRole &&
              payment.cycle === 2 &&
              onCompletionStep && (
                <button
                  type="button"
                  onClick={() => setOnCompletionStep(false)}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              )}

            <h2 className="text-xl font-bold text-[#1e293b]">
              {isAdminStyleRole &&
              payment.cycle === 2 &&
              onCompletionStep
                ? "Order Completion"
                : isAdminStyleRole
                ? payment.isApproved
                  ? "Payment Approved"
                  : "Approve Payment"
                : title || "Payment Proof"}
            </h2>
          </div>

          <button
            type="button"
            onClick={doOnClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-4 py-4">
          {isAdminStyleRole &&
          payment.cycle === 2 &&
          onCompletionStep ? (
            <>
              <p className="mb-4 text-sm italic text-gray-500">
                Add the following information to complete this
                order.
              </p>

              {/* Driver Information */}
              <h3 className="mt-4 mb-0 text-base font-bold text-gray-800">
                Driver Information
              </h3>

              <p className="mb-2 text-xs text-gray-500">
                The customer will be able to view this information.
              </p>

              <input
                type="text"
                placeholder="Driver Name"
                value={driverInfo.name}
                onChange={(e) => {
                  setDriverInfo({
                    ...driverInfo,
                    name: e.target.value,
                  });
                  handleErrors("driver_info.name", null);
                }}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1e293b]"
              />

              {errors["driver_info.name"] && (
                <p className="mt-1 text-xs italic text-red-600">
                  {errors["driver_info.name"]}
                </p>
              )}

              <input
                type="text"
                placeholder="Driver Phone"
                value={driverInfo.phone}
                onChange={(e) => {
                  setDriverInfo({
                    ...driverInfo,
                    phone: e.target.value,
                  });
                  handleErrors("driver_info.phone", null);
                }}
                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1e293b]"
              />

              {errors["driver_info.phone"] && (
                <p className="mt-1 text-xs italic text-red-600">
                  {errors["driver_info.phone"]}
                </p>
              )}

              <textarea
                placeholder="Driver Description"
                value={driverInfo.description}
                onChange={(e) => {
                  setDriverInfo({
                    ...driverInfo,
                    description: e.target.value,
                  });
                  handleErrors(
                    "driver_info.description",
                    null
                  );
                }}
                className="mt-4 min-h-[100px] w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1e293b]"
              />

              {errors["driver_info.description"] && (
                <p className="mt-1 text-xs italic text-red-600">
                  {errors["driver_info.description"]}
                </p>
              )}

              {/* EWay Bill */}
              <h3 className="mt-6 mb-0 text-base font-bold text-gray-800">
                EWay Bill
              </h3>

              <p className="mb-2 text-xs text-gray-500">
                The customer will be able to view this information.
              </p>

              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50">
                <Upload size={16} />
                {eWayBill
                  ? eWayBill.name
                  : "Choose EWay Bill"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    setEWayBill(
                      e.target.files?.[0] || null
                    );
                    handleErrors("e_way_bill", null);
                  }}
                />
              </label>

              {errors.e_way_bill && (
                <p className="mt-1 text-xs italic text-red-600">
                  {errors.e_way_bill}
                </p>
              )}

              {/* Tax Invoice */}
              <h3 className="mt-6 mb-0 text-base font-bold text-gray-800">
                Tax Invoice
              </h3>

              <p className="mb-2 text-xs text-gray-500">
                The customer will be able to view this information.
              </p>

              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50">
                <Upload size={16} />
                {taxInvoice
                  ? taxInvoice.name
                  : "Choose Tax Invoice"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    setTaxInvoice(
                      e.target.files?.[0] || null
                    );
                    handleErrors("tax_invoice", null);
                  }}
                />
              </label>

              {errors.tax_invoice && (
                <p className="mt-1 text-xs italic text-red-600">
                  {errors.tax_invoice}
                </p>
              )}
            </>
          ) : (
            <>
              {/* Uploaded date + amount */}
              <p className="mb-4 text-sm italic text-gray-500">
                {message}
              </p>

              {/* Approval fields */}
              {isAdminStyleRole && !payment.isApproved && (
                <div className="mb-4">
                  {payment.cycle === 1 ? (
                    <div className="mb-5">
                      <label
                        htmlFor="finalPaymentDueDate"
                        className="mb-2 block text-sm font-bold text-gray-800"
                      >
                        Select the final payment&apos;s due date
                      </label>

                      <input
                        type="date"
                        id="finalPaymentDueDate"
                        value={finalPaymentDueDate}
                        onChange={(e) => {
                          setFinalPaymentDueDate(
                            e.target.value
                          );
                          handleErrors(
                            "finalPaymentDueDate",
                            null
                          );
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1e293b]"
                      />

                      <input
                        type="text"
                        id="paymentValue"
                        placeholder="Payment Value"
                        value={paymentVal}
                        onChange={(e) => {
                          setPaymentVal(e.target.value);
                        }}
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1e293b]"
                      />

                      <input
                        type="number"
                        id="depositedAmount"
                        placeholder="Deposited Amount *"
                        value={depositedAmount}
                        onChange={(e) => {
                          setDepositedAmount(
                            e.target.value
                          );
                          handleErrors(
                            "depositedAmount",
                            null
                          );
                        }}
                        min="0"
                        step="0.01"
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1e293b]"
                      />

                      {errors.finalPaymentDueDate && (
                        <p className="mt-2 text-xs italic text-red-600">
                          {errors.finalPaymentDueDate}
                        </p>
                      )}

                      {errors.depositedAmount && (
                        <p className="mt-2 text-xs italic text-red-600">
                          {errors.depositedAmount}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-5">
                      <input
                        type="number"
                        id="depositedAmount"
                        placeholder="Deposited Amount *"
                        value={depositedAmount}
                        onChange={(e) => {
                          setDepositedAmount(
                            e.target.value
                          );
                          handleErrors(
                            "depositedAmount",
                            null
                          );
                        }}
                        min="0"
                        step="0.01"
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1e293b]"
                      />

                      {errors.depositedAmount && (
                        <p className="mt-2 text-xs italic text-red-600">
                          {errors.depositedAmount}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Confirmation */}
                  <label className="mb-2 block text-sm font-bold leading-6 text-gray-800">
                    Check the box below to confirm you&apos;re sure
                    that you want to approve this payment.
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => {
                        setIsConfirmed(
                          e.target.checked
                        );
                        handleErrors(
                          "confirm_action",
                          null
                        );
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />

                    <span>Confirm</span>
                  </label>

                  {errors.confirm_action && (
                    <p className="mt-2 text-xs italic text-red-600">
                      {errors.confirm_action}
                    </p>
                  )}
                </div>
              )}

              {/* Payment proof */}
              <div className="mt-4">
                {renderPdfOrImage(payment.proof)}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-4 py-4">
          <button
            type="button"
            onClick={doOnClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold uppercase text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>

          {isAdminStyleRole && !payment.isApproved && (
            <button
              type="button"
              onClick={doOnConfirm}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-xs font-bold uppercase text-white hover:bg-[#111827]"
            >
              <Check size={15} />
              Approve Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProofModal;