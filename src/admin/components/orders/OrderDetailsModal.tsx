import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Order } from '../../types/analytics';
import type { Id } from '../../../../convex/_generated/dataModel';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
    const updateStatus = useMutation(api.orders.updateOrderStatus);
    const [confirmAction, setConfirmAction] = useState<'complete' | 'cancel' | null>(null);

    if (!isOpen || !order) return null;

    const handleUpdateStatus = async (status: string) => {
        try {
            await updateStatus({ orderId: order._id as Id<"orders">, status });
            onClose();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-text-primary/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="bg-primary-background w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl pointer-events-auto">
                            <div className="flex items-center justify-between p-6 border-b border-text-primary">
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">Order Details</h2>
                                    <p className="text-sm text-text-secondary">Order ID: #{order._id}</p>
                                </div>
                                <button onClick={onClose} className="p-1.5 hover:bg-text-primary/10 rounded-lg hover:text-text-primary text-text-secondary">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Customer Information</h3>
                                        <div className="space-y-2 text-sm text-text-secondary">
                                            <p><span className="font-medium text-text-primary">Name:</span> {order.customer.name}</p>
                                            <p><span className="font-medium text-text-primary">Email:</span> {order.customer.email}</p>
                                            <p><span className="font-medium text-text-primary">Phone:</span> {order.customer.phone}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Shipping Details</h3>
                                        <div className="space-y-2 text-sm text-text-secondary">
                                            <p><span className="font-medium text-text-primary">Address:</span> {typeof order.shippingAddress === 'object' && order.shippingAddress ? `${order.shippingAddress.fullName || order.customer.name}, ${order.shippingAddress.line1}, ${order.shippingAddress.line2 ? order.shippingAddress.line2 + ', ' : ''}${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}` : order.shippingAddress || 'N/A'}</p>
                                            <p><span className="font-medium text-text-primary">Order Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                                            <p><span className="font-medium text-text-primary">Status:</span> <span className="capitalize">{order.orderStatus}</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Order Items</h3>
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
                                                        <td className="px-4 py-3 text-right text-text-primary font-medium">£{(item.price * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="border-t border-text-primary/20">
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3 text-right font-bold text-text-primary">Total Amount</td>
                                                    <td className="px-4 py-3 text-right font-bold text-green-600">${order.totalPrice.toLocaleString()}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-text-primary rounded-b-2xl flex justify-end gap-3 transition-all">
                                {confirmAction ? (
                                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                                        <span className="text-sm text-text-primary font-medium">
                                            Confirm {confirmAction === 'complete' ? 'completion' : 'cancellation'}?
                                        </span>
                                        <button
                                            onClick={() => setConfirmAction(null)}
                                            className="px-4 py-2 text-sm font-medium hover:bg-text-primary/10 hover:text-text-primary text-text-secondary rounded-lg transition-colors"
                                        >
                                            No, back
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(confirmAction === 'complete' ? 'completed' : 'cancelled')}
                                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmAction === 'complete'
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-red-600 hover:bg-red-700'
                                                }`}
                                        >
                                            Yes, {confirmAction}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {order.orderStatus !== 'cancelled' && (
                                            <button
                                                onClick={() => setConfirmAction('cancel')}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                                            >
                                                <XCircle size={16} />
                                                Cancel Order
                                            </button>
                                        )}
                                        {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                                            <button
                                                onClick={() => setConfirmAction('complete')}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                            >
                                                <CheckCircle size={16} />
                                                Mark as Completed
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
