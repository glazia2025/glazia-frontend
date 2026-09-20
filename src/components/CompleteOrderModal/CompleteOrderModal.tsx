'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

type DriverInfo = {
  name: string;
  phone: string;
};

type CompleteOrderModalProps = {
  isOpen: boolean;
  title?: string;
  message?: React.ReactNode;
  order?: {
    _id: string;
    isComplete?: boolean;
  };
  onConfirm: (
    data: {
      driverInfo: DriverInfo;
      biltyDoc: string | null;
      eWayBill: string | null;
      taxInvoice: string | null;
    },
    cb?: () => void
  ) => void;
  onClose: () => void;
};

const CompleteOrderModal = ({
  isOpen,
  title = 'Order Completion',
  message,
  order,
  onConfirm,
  onClose,
}: CompleteOrderModalProps) => {
  const [driverInfo, setDriverInfo] = useState<DriverInfo>({
    name: '',
    phone: '',
  });

  const [biltyDoc, setBiltyDoc] = useState<File | null>(null);
  const [eWayBill, setEWayBill] = useState<File | null>(null);
  const [taxInvoice, setTaxInvoice] = useState<File | null>(null);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearModal = () => {
    setDriverInfo({
      name: '',
      phone: '',
    });

    setBiltyDoc(null);
    setEWayBill(null);
    setTaxInvoice(null);
    setIsConfirmed(false);
    setErrors({});
  };

  const handleClose = () => {
    clearModal();
    onClose();
  };

  const handleError = (key: string, value: string | null) => {
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

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleConfirm = async () => {
    if (!order) {
      return;
    }

    if (order.isComplete) {
      handleError('order', 'Order already complete');
      return;
    }

    let hasErrors = false;

    if (!driverInfo) {
      handleError(
        'driver_info',
        'Driver info is required to complete the order'
      );
      hasErrors = true;
    }

    if (!driverInfo.name) {
      handleError(
        'driver_info.name',
        'Driver name is required to complete the order'
      );
      hasErrors = true;
    }

    if (!driverInfo.phone) {
      handleError(
        'driver_info.phone',
        'Driver phone is required to complete the order'
      );
      hasErrors = true;
    }

    if (!biltyDoc) {
      handleError(
        'bilty_doc',
        'Bilty Document is required to complete the order'
      );
      hasErrors = true;
    }

    if (!eWayBill) {
      handleError(
        'e_way_bill',
        'EWay Bill is required to complete the order'
      );
      hasErrors = true;
    }

    if (!taxInvoice) {
      handleError(
        'tax_invoice',
        'Tax Invoice is required to complete the order'
      );
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    if (!isConfirmed) {
      handleError(
        'confirm_action',
        'Check this box to proceed'
      );
      return;
    }

    try {
      let biltyDocBase64: string | null = null;
      let eWayBillBase64: string | null = null;
      let taxInvoiceBase64: string | null = null;

      if (biltyDoc) {
        biltyDocBase64 =
          await convertFileToBase64(biltyDoc);
      }

      if (eWayBill) {
        eWayBillBase64 =
          await convertFileToBase64(eWayBill);
      }

      if (taxInvoice) {
        taxInvoiceBase64 =
          await convertFileToBase64(taxInvoice);
      }
      setIsSubmitting(true);

      onConfirm(
        {
          driverInfo,
          biltyDoc: biltyDocBase64,
          eWayBill: eWayBillBase64,
          taxInvoice: taxInvoiceBase64,
        },
        () => {
          setIsSubmitting(false);
          clearModal();
        }
      );
    } catch (error) {
      console.error(
        'Error converting files to base64:',
        error
      );

      handleError(
        'upload',
        'Error uploading files'
      );
    }
  };

  if (!isOpen || !order || order.isComplete) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            {title}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto px-6 py-4">

          <p className="mb-4 text-sm italic text-gray-500">
            {message || (
              <>
                Add the following information to complete this
                order.
              </>
            )}
          </p>

          {/* Driver Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              Driver Information
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              The customer will be able to view this information.
            </p>

            <input
              type="text"
              value={driverInfo.name}
              placeholder="Driver Name"
              onChange={(e) => {
                setDriverInfo({
                  ...driverInfo,
                  name: e.target.value,
                });

                handleError(
                  'driver_info.name',
                  null
                );
              }}
              className={`mt-3 w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 ${
                errors['driver_info.name']
                  ? 'border-red-400'
                  : 'border-gray-200'
              }`}
            />

            {errors['driver_info.name'] && (
              <p className="mt-1 text-xs italic text-red-500">
                {errors['driver_info.name']}
              </p>
            )}

            <input
              type="text"
              value={driverInfo.phone}
              placeholder="Driver Phone"
              onChange={(e) => {
                setDriverInfo({
                  ...driverInfo,
                  phone: e.target.value,
                });

                handleError(
                  'driver_info.phone',
                  null
                );
              }}
              className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 ${
                errors['driver_info.phone']
                  ? 'border-red-400'
                  : 'border-gray-200'
              }`}
            />

            {errors['driver_info.phone'] && (
              <p className="mt-1 text-xs italic text-red-500">
                {errors['driver_info.phone']}
              </p>
            )}
          </div>

          {/* Bilty Document */}
          <div className="mt-5">
            <h3 className="text-sm font-bold text-gray-800">
              Bilty Document
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              The customer will be able to view this information.
            </p>

            <input
              type="file"
              onChange={(e) => {
                setBiltyDoc(
                  e.target.files?.[0] || null
                );

                handleError('bilty_doc', null);
              }}
              className="mt-3 block w-full cursor-pointer rounded-lg border border-gray-200 bg-white text-sm text-gray-500 file:mr-4 file:border-0 file:bg-gray-50 file:px-3 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
            />

            {errors.bilty_doc && (
              <p className="mt-1 text-xs italic text-red-500">
                {errors.bilty_doc}
              </p>
            )}
          </div>

          {/* EWay Bill */}
          <div className="mt-5">
            <h3 className="text-sm font-bold text-gray-800">
              EWay Bill
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              The customer will be able to view this information.
            </p>

            <input
              type="file"
              onChange={(e) => {
                setEWayBill(
                  e.target.files?.[0] || null
                );

                handleError('e_way_bill', null);
              }}
              className="mt-3 block w-full cursor-pointer rounded-lg border border-gray-200 bg-white text-sm text-gray-500 file:mr-4 file:border-0 file:bg-gray-50 file:px-3 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
            />

            {errors.e_way_bill && (
              <p className="mt-1 text-xs italic text-red-500">
                {errors.e_way_bill}
              </p>
            )}
          </div>

          {/* Tax Invoice */}
          <div className="mt-5">
            <h3 className="text-sm font-bold text-gray-800">
              Tax Invoice
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              The customer will be able to view this information.
            </p>

            <input
              type="file"
              onChange={(e) => {
                setTaxInvoice(
                  e.target.files?.[0] || null
                );

                handleError('tax_invoice', null);
              }}
              className="mt-3 block w-full cursor-pointer rounded-lg border border-gray-200 bg-white text-sm text-gray-500 file:mr-4 file:border-0 file:bg-gray-50 file:px-3 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
            />

            {errors.tax_invoice && (
              <p className="mt-1 text-xs italic text-red-500">
                {errors.tax_invoice}
              </p>
            )}
          </div>

          {/* Confirmation */}
          <div className="mt-5">
            <label className="text-sm font-bold leading-5 text-gray-800">
              Check the box below to confirm you're sure that
              you want to complete this order.
            </label>

            <label className="mt-3 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => {
                  setIsConfirmed(e.target.checked);
                  handleError(
                    'confirm_action',
                    null
                  );
                }}
                className="h-4 w-4 rounded border-gray-300 text-slate-700 focus:ring-slate-500"
              />

              <span className="text-sm text-gray-600">
                Confirm
              </span>
            </label>

            {errors.confirm_action && (
              <p className="mt-2 text-xs italic text-red-500">
                {errors.confirm_action}
              </p>
            )}

            {errors.upload && (
              <p className="mt-2 text-xs italic text-red-500">
                {errors.upload}
              </p>
            )}

            {errors.order && (
              <p className="mt-2 text-xs italic text-red-500">
                {errors.order}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            CLOSE
          </button>

          <button
  type="button"
  onClick={handleConfirm}
  disabled={isSubmitting}
  className="inline-flex min-w-[155px] items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
>
  {isSubmitting ? (
    <>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
      </span>
      Processing
    </>
  ) : (
    <>
      <Check size={16} />
      COMPLETE ORDER
    </>
  )}
</button>

        </div>
      </div>
    </div>
  );
};

export default CompleteOrderModal;