'use client';

import { use, useEffect, useState } from 'react';

import PaymentProofModal from '@/components/PaymentProofModal/PaymentProofModal';
import EditPaymentDueDateModal from '@/components/EditPaymentDueDateModal/EditPaymentDueDateModal';
import OrderPlacement from '@/components/OrderPlacement';
import CompleteOrderModal from '@/components/CompleteOrderModal/CompleteOrderModal';
import {
    CalendarDays,
    MapPin,
    Phone,
    IndianRupee,
    Truck,
    UserRound,
    RefreshCw,
    ClipboardList,
    CreditCard,
    LockKeyhole,
    Hourglass,
    Clock3,
    FileText,
    Check,
} from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/services/api';
import { getAuthToken } from '@/utils/authCookie';

type Order = {
    _id: string;
    orderId: number;
    createdAt: string;
    totalAmount: number;
    deliveryType?: string;
    isComplete?: boolean;

    user: {
        name: string;
        city: string;
        phoneNumber: string;
    };

    products: Array<{
        _id?: string;
        productId: string;
        description?: string;
        quantity: number;
        amount: number;
    }>;

    payments: Array<{
        _id: string;
        amount: number;
        cycle: number;
        proof?: string;
        isApproved?: boolean;
        proofAdded?: boolean;
        createdAt?: string;
        dueDate?: string;
    }>;
    driverInfo?: {
        name: string;
        phone: string;
        description?: string;
    };

    biltyDoc?: string;
    eWayBill?: string;
    taxInvoice?: string;

    fulfillment?: {
        status: string;
        decidedAt?: string;
        decidedBy?: string;
        notes?: string;

        remainingProducts?: Array<{
            productId: string;
            description?: string;
            quantity: number;
            amount: number;
        }>;
    };
    upstreamOrder?: string | {
        _id: string;
        orderId?: number;
        isComplete?: boolean;
        completedAt?: string;
    } | null;
};

const checkOrderFirstApprovalPending = (order: Order) => {
    return (
        order &&
        order.payments &&
        order.payments.length === 1 &&
        !order.payments[0].isApproved
    );
};

const checkOrderSecondPaymentPending = (order: Order) => {
    const dueDate = order.payments?.[1]?.dueDate;

    return (
        order &&
        order.payments &&
        order.payments.length === 2 &&
        !order.payments[1].proofAdded &&
        dueDate &&
        new Date(dueDate).getTime() > new Date().getTime()
    );
};

const checkOrderSecondPaymentOverdue = (order: Order) => {
    const dueDate = order.payments?.[1]?.dueDate;

    return (
        order &&
        order.payments &&
        order.payments.length === 2 &&
        !order.payments[1].proofAdded &&
        dueDate &&
        new Date(dueDate).getTime() <= new Date().getTime()
    );
};

const checkOrderSecondApprovalPending = (order: Order) => {
    return (
        order &&
        order.payments &&
        order.payments.length === 2 &&
        order.payments[1].proofAdded &&
        !order.payments[1].isApproved
    );
};

const checkOrderDispatchPending = (order: Order) => {
    return (
        order &&
        order.payments &&
        order.payments.length === 2 &&
        order.payments[1].proofAdded &&
        order.payments[1].isApproved &&
        !order.isComplete
    );
};

const getOrderStatus = (order: Order) => {
    if (checkOrderFirstApprovalPending(order)) {
        return 'first_approval_pending';
    }

    if (checkOrderSecondPaymentPending(order)) {
        return 'second_payment_pending';
    }

    if (checkOrderSecondPaymentOverdue(order)) {
        return 'second_payment_overdue';
    }

    if (checkOrderSecondApprovalPending(order)) {
        return 'second_approval_pending';
    }

    if (checkOrderDispatchPending(order)) {
        return 'dispatch_pending';
    }

    return 'completed';
};

const getOrderStatusLabel = (order: Order) => {
    const status = getOrderStatus(order);

    const labels: Record<string, string> = {
        first_approval_pending: 'Proof Submitted',
        second_payment_pending: 'Final Payment Pending',
        second_payment_overdue: 'Final Payment Overdue',
        second_approval_pending: 'Final Approval Pending',
        dispatch_pending: 'Waiting for Dispatch',
        completed: 'Completed',
    };

    return labels[status] || '-';
};
const getOrderStatusLongLabel = (order: Order) => {
    const status = getOrderStatus(order);

    const labels: Record<string, string> = {
        first_approval_pending: 'Proof submitted, Waiting for approval.',
        second_payment_pending: 'Final payment pending.',
        second_payment_overdue: 'Final payment overdue.',
        second_approval_pending: 'Final approval pending.',
        dispatch_pending: 'Waiting for dispatch.',
        completed: 'Order completed.',
    };

    return labels[status] || 'Order status unavailable.';
};

export default function DealershipOrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'orderInfo' | 'payments' | 'documents'>(
        'orderInfo'
    );
    const [showGlaziaItemsModal, setShowGlaziaItemsModal] = useState(false);
    const [showOrderPlacement, setShowOrderPlacement] = useState(false);
    const [inventory, setInventory] = useState<
        Array<{
            productId: string;
            description: string;
            quantity: number;
        }>
    >([]);
    const [showPaymentProofModal, setShowPaymentProofModal] = useState<{
        payment: Order['payments'][number];
        title: string;
        message: React.ReactNode;
        onClose: () => void;
        onConfirm: (data: any, cb?: () => void) => void;
    } | undefined>(undefined);

    const [showEditPaymentDueDateModal, setShowEditPaymentDueDateModal] = useState<{
        payment: Order['payments'][number];
        title: string;
        message: React.ReactNode;
        onClose: () => void;
        onConfirm: (data: any, cb?: () => void) => void;
    } | undefined>(undefined);

    const [showCompleteOrderModal, setShowCompleteOrderModal] = useState<{
        order: Order;
        title: string;
        message: React.ReactNode;
        onClose: () => void;
        onConfirm: (data: any, cb?: () => void) => void;
    } | undefined>(undefined);

    const checkPaymentProofPending = (payment: Order['payments'][number]) => {
        return (
            payment &&
            !payment.proofAdded &&
            payment.dueDate &&
            new Date(payment.dueDate).getTime() > new Date().getTime()
        );
    };

    const checkPaymentProofOverdue = (payment: Order['payments'][number]) => {
        return (
            payment &&
            !payment.proofAdded &&
            payment.dueDate &&
            new Date(payment.dueDate).getTime() <= new Date().getTime()
        );
    };

    const checkPaymentApprovalPending = (
        payment: Order['payments'][number]
    ) => {
        return payment && payment.proofAdded && !payment.isApproved;
    };

    const checkPaymentHasDueDate = (
        payment: Order['payments'][number]
    ) => {
        return payment && !payment.proofAdded && !!payment.dueDate;
    };

    const getPaymentStatus = (payment: Order['payments'][number]) => {
        if (!payment) return 'Loading';

        if (checkPaymentProofPending(payment)) {
            return 'Proof Pending';
        }

        if (checkPaymentProofOverdue(payment)) {
            return 'Proof Overdue';
        }

        if (checkPaymentApprovalPending(payment)) {
            return 'Approval Pending';
        }

        return 'Approved';
    };

    const getPaymentInfo = (
        payment: Order['payments'][number]
    ) => {
        if (!payment || !payment._id || !order?.payments) {
            return 'First Installment';
        }

        const foundIndex = order.payments.findIndex(
            (p) => p._id === payment._id
        );

        return foundIndex === 0
            ? 'First Installment (Advance)'
            : 'Final Installment (Balance)';
    };

    const renderPaymentStatus = (
        payment: Order['payments'][number]
    ) => {
        const status = getPaymentStatus(payment);

        const statusStyles: Record<string, string> = {
            "Proof Pending": "bg-gray-100 text-gray-700",
            "Proof Overdue": "bg-red-100 text-red-700",
            "Approval Pending": "bg-yellow-100 text-yellow-700",
            Approved: "bg-green-100 text-green-700",
        };


        return (
            <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-700"
                    }`}
            >
                {status}
            </span>
        );
    };
    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                setError('');

                const token = getAuthToken();

                const response = await fetch(
                    `${API_BASE_URL}/api/dealership/orders/${id}`,
                    {
                        credentials: 'include',
                        headers: {
                            ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {}),
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Unable to load order');
                }

                setOrder(data.order);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unable to load order'
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);

    useEffect(() => {
        const loadInventory = async () => {
            try {
                const token = getAuthToken();

                const response = await fetch(
                    `${API_BASE_URL}/api/dealership/inventory`,
                    {
                        credentials: 'include',
                        headers: {
                            ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {}),
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Unable to load dealership inventory'
                    );
                }

                setInventory(data.inventory || []);
            } catch (err) {
                console.error('Error loading dealership inventory:', err);
            }
        };

        loadInventory();
    }, []);


    const getFulfillmentDetails = () => {
        if (!order) {
            return {
                stockItems: [],
                glaziaItems: [],
            };
        }

        const stockItems: Array<{
            productId: string;
            description: string;
            orderedQuantity: number;
            availableQuantity: number;
            dealerQuantity: number;
            remainingQuantity: number;
            amount: number;
        }> = [];

        const glaziaItems: Array<{
            productId: string;
            description: string;
            orderedQuantity: number;
            availableQuantity: number;
            dealerQuantity: number;
            remainingQuantity: number;
            amount: number;
        }> = [];

        const savedShortages = new Map(
            (order.fulfillment?.remainingProducts || []).map((product) => [
                product.productId,
                product,
            ])
        );
        const hasSavedFulfillment = order.fulfillment?.status === 'GLAZIA_VIA_DEALER';

        order.products.forEach((product) => {
            const stockItem = inventory.find((item) => item.productId === product.productId);
            const savedShortage = savedShortages.get(product.productId);

            const orderedQuantity = Number(product.quantity || 0);
            const remainingQuantity = hasSavedFulfillment
                ? Math.min(orderedQuantity, Number(savedShortage?.quantity || 0))
                : Math.max(0, orderedQuantity - Number(stockItem?.quantity || 0));
            const dealerQuantity = orderedQuantity - remainingQuantity;
            const availableQuantity = dealerQuantity;
            const unitAmount = orderedQuantity > 0 ? Number(product.amount || 0) / orderedQuantity : 0;

            const fulfillmentItem = {
                productId: product.productId,
                description: product.description || product.productId,
                orderedQuantity,
                availableQuantity,
                dealerQuantity,
                remainingQuantity,
                amount: savedShortage
                    ? Number(savedShortage.amount || unitAmount * remainingQuantity)
                    : unitAmount * remainingQuantity,
            };

            if (dealerQuantity > 0) {
                stockItems.push(fulfillmentItem);
            }

            if (remainingQuantity > 0) {
                glaziaItems.push(fulfillmentItem);
            }
        });

        return {
            stockItems,
            glaziaItems,
        };
    };

    const approvePayment = async (
        paymentId: string,
        data: any,
        cb?: () => void
    ) => {
        if (!order || !order._id) {
            console.error('Order not found');
            return;
        }

        if (!paymentId) {
            console.error('Payment ID not found');
            return;
        }

        if (data.payment.cycle === 1 && !data.finalPaymentDueDate) {
            console.error('Final payment due date not found');
            return;
        }

        try {
            const token = getAuthToken();

            const response = await fetch(
                `${API_BASE_URL}/api/admin/approve-payment`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                    },
                    body: JSON.stringify({
                        orderId: order._id,
                        paymentId: paymentId,
                        finalPaymentDueDate: data.finalPaymentDueDate,
                        depositedAmount: data.depositedAmount,
                        driverInfo: data.driverInfo,
                        eWayBill: data.eWayBill,
                        taxInvoice: data.taxInvoice,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Failed to approve payment'
                );
            }

            console.log('Payment approved successfully');

            cb?.();
            setShowPaymentProofModal(undefined);

            // Reload order so the updated payment status is shown
            window.location.reload();
        } catch (error) {
            console.error('Error approving payment:', error);
        }
    };

    const updatePaymentDueDate = async (
        paymentId: string,
        data: any,
        cb?: () => void
    ) => {
        if (!order || !order._id || !paymentId) {
            console.error('Order or payment not found');
            return;
        }

        if (!data.dueDate) {
            console.error('New due date is required');
            return;
        }

        try {
            const token = getAuthToken();

            const response = await fetch(
                `${API_BASE_URL}/api/admin/update-payment-due-date`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                    },
                    body: JSON.stringify({
                        orderId: order._id,
                        paymentId: paymentId,
                        dueDate: data.dueDate,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Failed to update due date'
                );
            }

            console.log('Due date updated successfully');

            cb?.();
            setShowEditPaymentDueDateModal(undefined);

            // Reload order so updated due date is shown
            window.location.reload();
        } catch (error) {
            console.error('Error updating due date:', error);
        }
    };
    const openPaymentProofModal = (
        payment: Order['payments'][number]
    ) => {
        setShowPaymentProofModal({
            payment,
            title: 'Review Payment Proof',
            message: (
                <span>
                    Uploaded on{' '}
                    <strong>
                        {new Date(
                            payment.createdAt || order?.createdAt || ''
                        ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </strong>{' '}
                    for the amount of{' '}
                    <strong>
                        ₹
                        {Number(payment.amount || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </strong>
                    .
                </span>
            ),
            onClose: () => setShowPaymentProofModal(undefined),
            onConfirm: (data, cb) =>
                approvePayment(payment._id, data, cb),
        });
    };

    const openEditPaymentDueDateModal = (
        payment: Order['payments'][number]
    ) => {
        setShowEditPaymentDueDateModal({
            payment,
            title: 'Edit Due Date',
            message: (
                <span>
                    Current due date:{' '}
                    <strong>
                        {payment.dueDate
                            ? new Date(payment.dueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                            : 'Upon dispatch'}
                    </strong>
                </span>
            ),
            onClose: () => setShowEditPaymentDueDateModal(undefined),
            onConfirm: (data, cb) =>
                updatePaymentDueDate(payment._id, data, cb),
        });
    };
    const openCompleteOrderModal = () => {
        if (!order) {
            console.error('Order not found');
            return;
        }

        setShowCompleteOrderModal({
            order,
            title: 'Complete Order & Release Dispatch',
            message: (
                <span>
                    Upload dispatch documentation and driver contact details.
                </span>
            ),
            onClose: () => setShowCompleteOrderModal(undefined),
            onConfirm: (data, cb) => completeOrder(data, cb),
        });
    };
    const completeOrder = async (
        data: any,
        cb?: () => void
    ) => {
        if (!order || !order._id) {
            console.error('Order not found');
            return;
        }

        if (
            !data.driverInfo ||
            !data.biltyDoc ||
            !data.eWayBill ||
            !data.taxInvoice
        ) {
            console.error(
                'Driver details and all dispatch documents are required'
            );
            return;
        }

        try {
            const token = getAuthToken();

            const response = await fetch(
                `${API_BASE_URL}/api/admin/complete-order`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                    },
                    body: JSON.stringify({
                        orderId: order._id,
                        driverInfo: data.driverInfo,
                        biltyDoc: data.biltyDoc,
                        eWayBill: data.eWayBill,
                        taxInvoice: data.taxInvoice,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Failed to complete order'
                );
            }

            console.log('Order completed and dispatched successfully');

            cb?.();
            setShowCompleteOrderModal(undefined);

            window.location.reload();
        } catch (error) {
            console.error('Error completing order:', error);
        }
    };

    const openViewDocumentModal = (doc: {
        value: 'biltyDoc' | 'eWayBill' | 'taxInvoice';
    }) => {
        if (!order || !order[doc.value]) {
            console.error('Document not available yet');
            return;
        }

        const docData = order[doc.value];

        if (
            typeof docData === 'string' &&
            docData.startsWith('http')
        ) {
            window.open(docData, '_blank');
        } else if (
            typeof docData === 'string' &&
            docData.startsWith('data:')
        ) {
            const win = window.open();

            if (win) {
                win.document.write(
                    `<iframe src="${docData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                );
            }
        } else {
            window.open(docData, '_blank');
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4">
                    <p className="text-gray-600">Loading order...</p>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4">
                    <Link
                        href="/account/dealership"
                        className="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
                    >
                        ← Back to Orders
                    </Link>

                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                        {error || 'Order not found'}
                    </div>
                </div>
            </main>
        );
    }
    const glaziaRequestSent = Boolean(order?.upstreamOrder);
    const glaziaDeliveryReceived = typeof order?.upstreamOrder === 'object'
        && order.upstreamOrder?.isComplete === true;
    const { stockItems, glaziaItems } = getFulfillmentDetails();

    const hasStockItems = stockItems.length > 0;
    const hasGlaziaItems = glaziaItems.length > 0;

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4">
                <Link
                    href="/account/dealership"
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                    ← Back to Orders
                </Link>


                <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Order Fulfillment
                    </h2>

                    {hasStockItems && (
                        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
                            <p className="text-sm font-semibold text-green-800">
                                You have these items in your stock
                            </p>

                            <div className="mt-3 space-y-2">
                                {stockItems.map((item) => (
                                    <div
                                        key={`stock-${item.productId}`}
                                        className="flex items-center justify-between rounded-md bg-white px-3 py-2"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {item.description}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                Product ID: {item.productId}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-green-700">
                                                {item.dealerQuantity} available
                                            </p>

                                            {item.dealerQuantity < item.orderedQuantity && (
                                                <p className="text-xs text-gray-500">
                                                    {item.orderedQuantity - item.dealerQuantity} more required
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasGlaziaItems && (
                        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <p className="text-sm font-semibold text-yellow-800">
                                These items are not fully available in your stock
                            </p>

                            <div className="mt-3 space-y-2">
                                {glaziaItems.map((item) => (
                                    <div
                                        key={`glazia-${item.productId}`}
                                        className="flex items-center justify-between rounded-md bg-white px-3 py-2"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {item.description}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                Product ID: {item.productId}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-yellow-700">
                                                {item.remainingQuantity} required from Glazia
                                            </p>

                                            {item.dealerQuantity > 0 && (
                                                <p className="text-xs text-green-600">
                                                    {item.dealerQuantity} available in your stock
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!glaziaRequestSent && (
                                <button
                                    type="button"
                                    className="mt-4 rounded-lg bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                                    onClick={() => setShowGlaziaItemsModal(true)}
                                >
                                    Request from Glazia
                                </button>
                            )}

                            {glaziaRequestSent && (
                                <button
                                    type="button"
                                    disabled
                                    className="mt-4 cursor-not-allowed rounded-lg bg-gray-400 px-4 py-2.5 text-sm font-semibold text-white"
                                >
                                    Request sent to Glazia
                                </button>
                            )}

                            {glaziaDeliveryReceived && (
                                <p className="mt-3 text-sm font-medium text-green-700">
                                    Glazia has delivered the shortage to your inventory. This order is ready for dealership dispatch.
                                </p>
                            )}
                        </div>
                    )}

                    {!hasGlaziaItems && hasStockItems && (
                        <div className="mt-4">
                            <button
                                type="button"
                                className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                            >
                                Dispatch from my stock
                            </button>
                        </div>
                    )}

                    {!hasStockItems && !hasGlaziaItems && (
                        <p className="mt-4 text-sm text-gray-500">
                            No fulfillment information available.
                        </p>
                    )}
                </div>


                <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">

                                <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                                    #{order.orderId}
                                </span>

                                <h1 className="text-2xl font-bold text-gray-900">
                                    Order for {order.user?.name || '-'}
                                </h1>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatus(order) === 'first_approval_pending'
                                            ? 'bg-yellow-50 text-yellow-700'
                                            : getOrderStatus(order) === 'second_payment_pending'
                                                ? 'bg-green-50 text-green-700'
                                                : getOrderStatus(order) === 'second_payment_overdue'
                                                    ? 'bg-yellow-50 text-yellow-700'
                                                    : getOrderStatus(order) === 'second_approval_pending'
                                                        ? 'bg-yellow-50 text-yellow-700'
                                                        : getOrderStatus(order) === 'dispatch_pending'
                                                            ? 'bg-green-50 text-green-700'
                                                            : getOrderStatus(order) === 'completed'
                                                                ? 'bg-blue-50 text-blue-700'
                                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {getOrderStatusLabel(order)}
                                </span>

                            </div>
                            {checkOrderDispatchPending(order) && (
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#EE1C25] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#EE1C25]"
                                    onClick={openCompleteOrderModal}
                                >
                                    <Check size={16} />
                                    <span>Complete Order</span>
                                </button>
                            )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-5 text-sm text-gray-500">

                            <span>
                                <CalendarDays size={15} />
                                Placed on{' '}
                                {new Date(order.createdAt).toLocaleDateString(
                                    'en-US',
                                    {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    }
                                )}
                            </span>

                            <span>
                                <MapPin size={15} />
                                {order.user?.city || '-'}
                            </span>

                            <span>
                                <Phone size={15} />
                                {order.user?.phoneNumber || '-'}
                            </span>

                        </div>
                    </div>

                    <div className="grid gap-4 bg-gray-50 p-5 md:grid-cols-2 xl:grid-cols-4">

                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
                                    <IndianRupee size={21} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total Order Value
                                    </p>

                                    <p className="mt-1 text-base font-bold text-gray-900">
                                        ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Including 18% GST
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                                    <Truck size={21} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Delivery Mode
                                    </p>

                                    <p className="mt-1 text-base font-bold text-gray-900">
                                        {order.deliveryType === 'SELF'
                                            ? 'Self Pickup'
                                            : order.deliveryType || '-'}
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                                    <UserRound size={21} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Client Details
                                    </p>

                                    <p className="mt-1 text-base font-bold text-gray-900">
                                        {order.user?.name || '-'}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {order.user?.phoneNumber || '-'}
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                                    <RefreshCw size={21} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Order Progress
                                    </p>

                                    <p className="mt-1 text-base font-bold text-gray-900">
                                        {getOrderStatusLabel(order)}
                                    </p>

                                </div>

                            </div>
                        </div>

                    </div>

                </div>

                <section className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200">
                        <div className="flex items-center gap-8 px-6">

                            <button
                                type="button"
                                onClick={() => setActiveTab('orderInfo')}
                                className={`flex items-center gap-2 px-1 py-4 text-sm font-semibold ${activeTab === 'orderInfo'
                                        ? 'border-b-2 border-[#EE1C25] text-[#EE1C25]'
                                        : 'text-gray-500'
                                    }`}
                            >
                                <ClipboardList size={16} />
                                Order Items
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-[#EE1C25]">
                                    {order.products?.length || 0}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('payments')}
                                className={`flex items-center gap-2 px-1 py-4 text-sm font-semibold ${activeTab === 'payments'
                                        ? 'border-b-2 border-[#EE1C25] text-[#EE1C25]'
                                        : 'text-gray-500'
                                    }`}
                            >
                                <CreditCard size={16} />
                                Payment Schedule
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                    {order.payments?.length || 0}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (order.isComplete) {
                                        setActiveTab('documents');
                                    }
                                }}
                                className={`flex items-center gap-2 px-1 py-4 text-sm font-semibold ${activeTab === 'documents'
                                        ? 'border-b-2 border-[#EE1C25] text-[#EE1C25]'
                                        : order.isComplete
                                            ? 'text-gray-500'
                                            : 'text-gray-400'
                                    }`}
                            >
                                {order.isComplete ? (
                                    <FileText size={16} />
                                ) : (
                                    <LockKeyhole size={16} />
                                )}

                                <span>Documents & Dispatch</span>

                                {order.isComplete && (
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                        3
                                    </span>
                                )}
                            </button>

                        </div>
                    </div>
                    {activeTab === 'orderInfo' && (
                        <>

                            <div className="flex items-center justify-between px-6 py-5">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Configured Items in this Order
                                </h2>

                                <span className="text-sm text-gray-500">
                                    {new Set(
                                        order.products?.map((product) => product.productId)
                                    ).size || 0}{' '}
                                    unique specifications
                                </span>
                            </div>

                            <div className="overflow-x-auto px-6">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="border-y border-gray-200 bg-gray-50">
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                #
                                            </th>

                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Product Specification & Description
                                            </th>

                                            <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Quantity
                                            </th>

                                            <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Unit Amount
                                            </th>

                                            <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Total Amount
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {order.products?.length ? (
                                            order.products.map((product, index) => {
                                                const unitAmount = Number(product.amount || 0);
                                                const totalAmount =
                                                    unitAmount * Number(product.quantity || 0);

                                                return (
                                                    <tr
                                                        key={product._id || `${product.productId}-${index}`}
                                                        className="border-b border-gray-100"
                                                    >
                                                        <td className="px-4 py-5 text-sm text-gray-600">
                                                            {index + 1}
                                                        </td>

                                                        <td className="px-4 py-5">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {product.description || '-'}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                ID: {product.productId}
                                                            </p>
                                                        </td>

                                                        <td className="px-4 py-5 text-center">
                                                            <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                                                {product.quantity}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-5 text-right text-sm text-gray-500">
                                                            ₹{unitAmount.toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </td>

                                                        <td className="px-4 py-5 text-right text-sm font-semibold text-gray-900">
                                                            ₹{totalAmount.toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-8 text-center text-sm text-gray-500"
                                                >
                                                    No items found in this order.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end px-6 py-5">
                                <div className="w-full max-w-sm space-y-3 text-sm">

                                    <div className="flex items-center justify-between text-gray-500">
                                        <span>Subtotal (Products):</span>
                                        <span className="font-semibold text-gray-700">
                                            ₹
                                            {order.products
                                                ?.reduce(
                                                    (total, product) =>
                                                        total +
                                                        Number(product.amount || 0) *
                                                        Number(product.quantity || 0),
                                                    0
                                                )
                                                .toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-gray-500">
                                        <span>GST (18%):</span>
                                        <span className="font-semibold text-gray-700">
                                            ₹
                                            {(
                                                (order.products?.reduce(
                                                    (total, product) =>
                                                        total +
                                                        Number(product.amount || 0) *
                                                        Number(product.quantity || 0),
                                                    0
                                                ) || 0) * 0.18
                                            ).toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900">
                                                Grand Total:
                                            </span>

                                            <span className="text-base font-bold text-blue-600">
                                                ₹{order.totalAmount?.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'payments' && (
                        <div className="px-6 py-5">

                            {/* Status Banner */}
                            <div
                                className={`rounded-xl border px-5 py-4 ${checkOrderSecondPaymentOverdue(order)
                                        ? 'border-red-200 bg-red-50'
                                        : checkOrderFirstApprovalPending(order) ||
                                            checkOrderSecondApprovalPending(order)
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-green-200 bg-green-50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">

                                    <div
                                        className={`mt-0.5 ${checkOrderSecondPaymentOverdue(order)
                                                ? 'text-red-600'
                                                : checkOrderFirstApprovalPending(order) ||
                                                    checkOrderSecondApprovalPending(order)
                                                    ? 'text-blue-600'
                                                    : 'text-green-600'
                                            }`}
                                    >
                                        {checkOrderSecondPaymentOverdue(order) ? (
                                            <span>!</span>
                                        ) : checkOrderFirstApprovalPending(order) ||
                                            checkOrderSecondApprovalPending(order) ? (
                                            <Hourglass size={20} />
                                        ) : (
                                            <Check size={20} />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {getOrderStatusLongLabel(order)}
                                        </h3>

                                        <p className="mt-1 text-xs text-blue-700">
                                            {checkOrderFirstApprovalPending(order)
                                                ? 'User has submitted payment proof for advance installment. Admin review is pending.'
                                                : checkOrderSecondApprovalPending(order)
                                                    ? 'Final installment proof uploaded. Pending admin confirmation to release dispatch.'
                                                    : checkOrderSecondPaymentOverdue(order)
                                                        ? 'Final installment is currently overdue. Please contact customer.'
                                                        : 'Installment payments are up to date.'}
                                        </p>
                                    </div>

                                </div>
                            </div>
                            <div className="flex items-center justify-between py-5">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Installment Payment Schedule
                                </h2>

                                <span className="text-sm text-gray-500">
                                    {order.payments?.length || 0} stage milestones
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead>
                                        <tr className="border-y border-gray-200 bg-gray-50">
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Payment ID
                                            </th>

                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Installment Stage
                                            </th>

                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Created Date
                                            </th>

                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Due Date
                                            </th>

                                            <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Amount
                                            </th>

                                            <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Proof
                                            </th>

                                            <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {order.payments?.map((payment, index) => (
                                            <tr
                                                key={payment._id || index}
                                                className="border-b border-gray-100"
                                            >
                                                <td className="px-4 py-5">
                                                    <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                                                        #{payment._id?.slice(0, 4)}...
                                                        {payment._id?.slice(-4)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {getPaymentInfo(payment)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Cycle #{payment.cycle || index + 1}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-5">
                                                    {renderPaymentStatus(payment)}
                                                </td>

                                                <td className="px-4 py-5">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <CalendarDays size={15} />

                                                        {new Date(
                                                            payment.createdAt || order.createdAt
                                                        ).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-5">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Clock3 size={15} />

                                                        {payment.dueDate
                                                            ? new Date(
                                                                payment.dueDate
                                                            ).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })
                                                            : 'Upon dispatch'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-right">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ₹
                                                        {Number(payment.amount || 0).toLocaleString(
                                                            'en-IN',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    {payment.proofAdded ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                                                            onClick={() => openPaymentProofModal(payment)}
                                                        >
                                                            <FileText size={14} />
                                                            View Proof
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">
                                                            No Proof
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-5 text-right">
                                                    {checkPaymentApprovalPending(payment) ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                                                            onClick={() => openPaymentProofModal(payment)}
                                                        >
                                                            <Check size={14} />
                                                            Approve
                                                        </button>
                                                    ) : checkPaymentHasDueDate(payment) ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700"
                                                            onClick={() => openEditPaymentDueDateModal(payment)}
                                                        >
                                                            <CalendarDays size={14} />
                                                            Edit Due Date
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">
                                                            No actions
                                                        </span>
                                                    )}
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="px-6 py-5">
                            {order.driverInfo && (
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Assigned Dispatch Driver
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-gray-900">
                                            {order.driverInfo.name || 'Driver Unassigned'}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {order.driverInfo.description || 'Vehicle info N/A'}
                                        </p>
                                    </div>

                                    {order.driverInfo.phone && (
                                        <a
                                            href={`tel:${order.driverInfo.phone}`}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm no-underline hover:bg-gray-50"
                                        >
                                            <Phone size={16} className="text-green-600" />
                                            <span>
                                                Call Driver: {order.driverInfo.phone}
                                            </span>
                                        </a>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center justify-between py-5">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Official Shipment Documentation
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Certified PDF / Scans
                                    </p>
                                </div>

                                <span className="text-sm text-gray-500">
                                    3 documents
                                </span>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                                {[
                                    {
                                        label: 'Bilty Document',
                                        value: 'biltyDoc' as const,
                                    },
                                    {
                                        label: 'EWay Bill',
                                        value: 'eWayBill' as const,
                                    },
                                    {
                                        label: 'Tax Invoice',
                                        value: 'taxInvoice' as const,
                                    },
                                ].map((doc) => {
                                    const docContent = order[doc.value];

                                    const hasDoc = !!docContent;

                                    const isImg =
                                        typeof docContent === 'string' &&
                                        docContent.startsWith('data:image');

                                    const sizeKb = hasDoc
                                        ? (docContent.length / 1024).toFixed(1)
                                        : '0';

                                    return (
                                        <div
                                            key={doc.value}
                                            className="flex min-h-[180px] flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                        >
                                            <div>
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                                        <FileText size={21} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-gray-900">
                                                            {doc.label}
                                                        </h3>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {hasDoc
                                                                ? `${isImg
                                                                    ? 'Image Format'
                                                                    : 'PDF Document'
                                                                } • ${sizeKb} KB`
                                                                : 'Document Pending'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={!hasDoc}
                                                onClick={() =>
                                                    openViewDocumentModal(doc)
                                                }
                                                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${hasDoc
                                                        ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                                        : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                                                    }`}
                                            >
                                                <FileText size={14} />

                                                <span>
                                                    {hasDoc
                                                        ? 'Open Document'
                                                        : 'Not Available'}
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </section>
                {showGlaziaItemsModal && order && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-[10000]"
                            onClick={() => setShowGlaziaItemsModal(false)}
                        />

                        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                                <div className="flex items-center justify-between border-b p-5">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Items Requested from Glazia
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Order #{order.orderId}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowGlaziaItemsModal(false)}
                                        className="rounded-full p-2 hover:bg-gray-100"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto p-5">
                                    <div className="space-y-3">
                                        {glaziaItems.map((product, index) => (
                                            <div
                                                key={`${product.productId}-${index}`}
                                                className="rounded-lg border border-gray-200 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {product.description || product.productId}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Product ID: {product.productId}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            Qty: {product.remainingQuantity}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-600">
                                                            ₹{Number(product.amount || 0).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                                        <span className="font-semibold text-gray-900">
                                            Total Amount
                                        </span>

                                        <span className="text-lg font-semibold text-gray-900">
                                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                                        </span>

                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 border-t p-5">
                                    <button
                                        type="button"
                                        onClick={() => setShowGlaziaItemsModal(false)}
                                        className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowGlaziaItemsModal(false);
                                            setShowOrderPlacement(true);
                                        }}
                                        className="rounded-lg bg-[#124657] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                                    >
                                        Next
                                    </button>
                                </div>

                            </div>
                        </div>
                    </>
                )}
                {showOrderPlacement && order && (
                    <OrderPlacement
                        items={glaziaItems.map((product) => ({
                            id: product.productId,
                            name: product.description || product.productId,
                            quantity: product.remainingQuantity,
                            price: product.remainingQuantity > 0
                                ? Number(product.amount || 0) / product.remainingQuantity
                                : 0,
                        }))}
                        totalAmountOverride={glaziaItems.reduce(
                            (total, product) => total + Number(product.amount || 0),
                            0
                        )}
                        sourceOrderId={order._id}
                        onOrderSuccess={() => {
                            setShowOrderPlacement(false);
                            window.location.reload();
                        }}
                        onCancel={() => {
                            setShowOrderPlacement(false);
                        }}
                    />
                )}


                <PaymentProofModal
                    isOpen={!!showPaymentProofModal}
                    title={showPaymentProofModal?.title}
                    message={showPaymentProofModal?.message}
                    payment={showPaymentProofModal?.payment}
                    onClose={() => showPaymentProofModal?.onClose()}
                    onConfirm={(data, cb) =>
                        showPaymentProofModal?.onConfirm(data, cb)
                    }
                />
                <EditPaymentDueDateModal
                    isOpen={!!showEditPaymentDueDateModal}
                    title={showEditPaymentDueDateModal?.title}
                    message={showEditPaymentDueDateModal?.message}
                    payment={showEditPaymentDueDateModal?.payment}
                    onClose={() => showEditPaymentDueDateModal?.onClose()}
                    onConfirm={(data, cb) =>
                        showEditPaymentDueDateModal?.onConfirm(data, cb)
                    }
                />
                <CompleteOrderModal
                    isOpen={!!showCompleteOrderModal}
                    title={showCompleteOrderModal?.title}
                    message={showCompleteOrderModal?.message}
                    order={showCompleteOrderModal?.order}
                    onClose={() => showCompleteOrderModal?.onClose()}
                    onConfirm={(data, cb) =>
                        showCompleteOrderModal?.onConfirm(data, cb)
                    }
                />


            </div>
        </main>
    );
}
