import React, { useState } from 'react';
import type { Order } from '../../types/analytics';
import { useAnalyticsStore } from '../../context/AnalyticsContext';
import { OrderDetailsModal } from '../OrderDetailsModal';

interface RecentOrdersProps {
    orders: Order[]
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
    const { products } = useAnalyticsStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    return (
        <>
            <OrderDetailsModal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
            <div className="bg-primary-background rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-text-primary font-sans">Recent Transactions</h2>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-text-primary/15">
                                <th className="text-left py-4 px-6 text-sm font-medium text-text-primary uppercase tracking-wider font-sans">Product</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-text-primary uppercase tracking-wider font-sans">Units</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-text-primary uppercase tracking-wider font-sans">Email</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-text-primary uppercase tracking-wider font-sans">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const firstItem = order.items[0];
                                const secondItem = order.items.length > 1 ? order.items[1] : null;

                                const firstProduct = products.find((p) => p._id === firstItem?.productId);
                                const secondProduct = secondItem ? products.find((p) => p._id === secondItem.productId) : null;

                                const firstImage = firstProduct?.mainImage || "https://via.placeholder.com/40";
                                const secondImage = secondProduct?.mainImage || "https://via.placeholder.com/40";

                                const productName = firstItem ? firstItem.name : 'Unknown Product';
                                const totalUnits = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
                                const moreCount = order.items.length - 1;
                                const displayProduct = moreCount > 0 ? `${productName} +${moreCount} more` : productName;
                                const statusColor = order.orderStatus === 'completed' ? 'bg-[#22C55E]' : order.orderStatus === 'cancelled' ? 'bg-[#EF4444]' : 'bg-yellow-500';
                                const statusTextColor = order.orderStatus === 'completed' ? 'text-[#22C55E]' : order.orderStatus === 'cancelled' ? 'text-[#EF4444]' : 'text-yellow-500';

                                return (
                                    <tr
                                        key={order._id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="hover:bg-text-primary/10 transition-colors cursor-pointer"
                                    >
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-4">
                                                {secondItem ? (
                                                    <div className="flex -space-x-3 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-primary-background overflow-hidden bg-gray-100 flex-shrink-0 z-10">
                                                            <img
                                                                src={secondImage}
                                                                alt={secondItem.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-primary-background overflow-hidden bg-gray-100 flex-shrink-0 z-20">
                                                            <img
                                                                src={firstImage}
                                                                alt={firstItem.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img
                                                            src={firstImage}
                                                            alt={displayProduct}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <span className="text-sm font-bold text-text-primary">{displayProduct}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-text-secondary">{totalUnits}</td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                                                <span className={`text-sm ${statusTextColor}`}>
                                                    {order.customer.email || order.clerkId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-right text-sm font-bold text-text-primary">
                                            £{order.totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-text-secondary">
                                        No recent transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};