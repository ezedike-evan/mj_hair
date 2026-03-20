import React, { useState, useRef } from 'react';
import { X, PackageCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '../types/analytics';
import { OrderCompletionForm } from './orderCompletionForm';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    isOpen,
    onClose,
    order,
}) => {
    const [showCompletionForm, setShowCompletionForm] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !order) return null;

    const formatAddress = (address: any) => {
        if (!address) return 'N/A';
        if (typeof address === 'string') return address;
        if (typeof address === 'object') {
            const { line1, city, postalCode, country } = address;
            return [line1, city, postalCode, country].filter(Boolean).join(', ');
        }
        return 'N/A';
    };

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = order.totalPrice - subtotal;

    const handleClose = () => {
        setShowCompletionForm(false);
        onClose();
    };

    const handleOpenCompletionForm = () => {
        setShowCompletionForm(true);
        // Wait for the form animation (300ms) to finish so scrollHeight is fully expanded
        setTimeout(() => {
            const container = scrollContainerRef.current;
            if (!container) return;
            container.scrollTop = container.scrollHeight;
        }, 350);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-text-primary/50 z-50 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div
                            ref={scrollContainerRef}
                            className="bg-primary-background w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-text-primary/10">
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">Order Details</h2>
                                    <p className="text-sm text-text-secondary">Order ID: #{order._id}</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-1.5 hover:bg-text-primary/10 rounded-lg hover:text-text-primary text-text-secondary transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-8">

                                {/* Customer & Shipping */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                                            Customer Information
                                        </h3>
                                        <div className="space-y-2 text-sm text-text-secondary">
                                            <p><span className="font-medium text-text-primary">Name:</span> {order.customer.name}</p>
                                            <p><span className="font-medium text-text-primary">Email:</span> {order.customer.email}</p>
                                            <p><span className="font-medium text-text-primary">Phone:</span> {order.customer.phone}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                                            Shipping Details
                                        </h3>
                                        <div className="space-y-2 text-sm text-text-secondary">
                                            <p><span className="font-medium text-text-primary">Address:</span> {formatAddress(order.shippingAddress)}</p>
                                            <p><span className="font-medium text-text-primary">Order Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                                            <p>
                                                <span className="font-medium text-text-primary">Status:</span>{' '}
                                                <span className="capitalize">{order.orderStatus}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Table */}
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                                        Order Items
                                    </h3>
                                    <div className="bg-text-primary/5 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-text-primary/20 text-text-primary font-medium">
                                                <tr>
                                                    <th className="px-4 py-3">Product</th>
                                                    <th className="px-4 py-3 text-right">Price</th>
                                                    <th className="px-4 py-3 text-right">Qty</th>
                                                    <th className="px-4 py-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-text-primary/10">
                                                {order.items.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-3 text-text-primary font-medium">{item.name}</td>
                                                        <td className="px-4 py-3 text-right text-text-primary">£{item.price.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right text-text-primary">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right text-text-primary font-medium">
                                                            £{(item.price * item.quantity).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="border-t border-text-primary/20">
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3 text-right text-text-secondary">Subtotal</td>
                                                    <td className="px-4 py-3 text-right text-text-primary">£{subtotal.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3 text-right text-text-secondary">
                                                        Shipping
                                                        <span className="ml-2 text-xs text-text-secondary/60">
                                                            {order.shippingAddress &&
                                                                typeof order.shippingAddress === 'object' &&
                                                                (order.shippingAddress as any).country === 'GB'
                                                                ? '(UK)'
                                                                : '(International)'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-text-primary">£{shippingCost.toLocaleString()}</td>
                                                </tr>
                                                <tr className="border-t border-text-primary/20">
                                                    <td colSpan={3} className="px-4 py-3 text-right font-bold text-text-primary">Total Amount</td>
                                                    <td className="px-4 py-3 text-right font-bold text-green-600">
                                                        £{order.totalPrice.toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Mark as Complete Button / Completion Form */}
                                <div>
                                    {order.orderStatus === 'complete' ? (
                                        <div className="flex flex-col items-center justify-center py-4 gap-3 text-center">
                                            <CheckCircle2 size={52} className="text-green-500" />
                                            <h3 className="text-lg font-bold text-text-primary">Order Marked as Complete</h3>
                                            <p className="text-sm text-text-secondary">
                                                A dispatch email has been sent to the customer.
                                            </p>
                                        </div>
                                    ) : (
                                        <AnimatePresence mode="wait">
                                            {!showCompletionForm ? (
                                                <motion.div
                                                    key="button"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.25 }}
                                                >
                                                    <button
                                                        onClick={handleOpenCompletionForm}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                                                   bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 hover:border-green-600/40
                                                                   text-green-600 font-semibold text-sm transition-all duration-200
                                                                   hover:shadow-lg hover:shadow-green-600/10"
                                                    >
                                                        <PackageCheck size={17} />
                                                        Mark Order as Complete
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="form"
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                >
                                                    <OrderCompletionForm
                                                        orderId={order._id}
                                                        onCancel={() => setShowCompletionForm(false)}
                                                        onSuccess={handleClose}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};