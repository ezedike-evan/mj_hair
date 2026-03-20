import React, { useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Truck, Clock, XCircle } from 'lucide-react';
import type { Order } from '../../types/analytics';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderDetailsModal } from '../OrderDetailsModal';
import { useAnalyticsStore } from '../../context/AnalyticsContext';

interface OrderListProps {
    orders: Order[];
}

const tabs = ['All order', 'Complete', 'Pending', 'Canceled'];


export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All order');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Control value for orders per page
    const { products } = useAnalyticsStore();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-500';
            case 'pending': return 'text-yellow-500';
            case 'processing': return 'text-gray-800';
            case 'cancelled': return 'text-red-500';
            default: return 'text-text-secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <Truck size={16} className="text-green-500" />;
            case 'pending': return <Clock size={16} className="text-yellow-500" />;
            case 'processing': return <Truck size={16} className="text-gray-800" />;
            case 'cancelled': return <XCircle size={16} className="text-red-500" />;
            default: return null;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesTab = activeTab === 'All order' ||
            (activeTab === 'Completed' && order.orderStatus === 'complete') ||
            (activeTab === 'Pending' && order.orderStatus === 'pending') ||
            (activeTab === 'Canceled' && order.orderStatus === 'cancelled');

        // For search, we check Order ID or Product Name or Customer Name
        const firstProductName = order.items[0]?.name || '';
        const matchesSearch =
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            firstProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof order.shippingAddress === 'string'
                ? order.shippingAddress
                : [order.shippingAddress.line1, order.shippingAddress.city, order.shippingAddress.country].filter(Boolean).join(' ')
            ).toLowerCase().includes(searchTerm.toLowerCase());

        return matchesTab && matchesSearch;
    });

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        // Determine range of pages to show (e.g., max 5 visible)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text("Order Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Define Columns
        const tableColumn = ["Order ID", "Product", "Date", "Price", "Customer", "Status"];
        const tableRows: any[] = [];

        filteredOrders.forEach(order => {
            const firstItem = order.items[0];
            const productName = firstItem ? firstItem.name : 'Unknown Product';
            const dateObj = new Date(order.createdAt);
            const formattedDate = dateObj.toLocaleDateString();

            const orderData = [
                order._id,
                productName + (order.items.length > 1 ? ` +${order.items.length - 1} more` : ''),
                formattedDate,
                `£${order.totalPrice.toLocaleString()}`,
                `${order.customer.name} (${order.customer.email})`,
                order.orderStatus
            ];
            tableRows.push(orderData);
        });

        // Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [63, 63, 70] } // dark gray header
        });

        // Save PDF
        doc.save(`orders_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <>
            <OrderDetailsModal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
            <div className="bg-primary-background rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="flex gap-1 bg-text-primary/10 p-1 rounded-lg">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-primary-background text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {/* Right Actions */}
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <input
                                type="text"
                                placeholder="Search order report"
                                className="w-full pl-6 pr-10 py-3 bg-text-primary/10 rounded-xl text-xs text-text-secondary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-gray-100 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                        <button
                            className="p-1.5 hover:bg-text-primary/10 rounded-lg hover:text-text-primary text-text-secondary"
                            onClick={handleDownloadPDF}
                            title="Download PDF Report"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-text-primary/15">
                                <th className="py-4 px-6 pl-6 text-left text-sm font-bold text-text-primary">No.</th>
                                <th className="py-4 px-6 text-left text-sm font-bold text-text-primary">Order Id</th>
                                <th className="py-4 px-6 text-left text-sm font-bold text-text-primary">Product</th>
                                <th className="py-4 px-6 text-left text-sm font-bold text-text-primary">Date</th>
                                <th className="py-4 px-6 text-left text-sm font-bold text-text-primary">Price</th>
                                <th className="py-4 px-6 text-left text-sm font-bold text-text-primary">Email</th>
                                <th className="py-4 px-6 text-left text-sm font-bold text-text-primary">Address</th>
                                <th className="py-4 px-6 text-left text-sm font-bold text-text-primary">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map((order, index) => {
                                const firstItem = order.items[0];
                                const secondItem = order.items.length > 1 ? order.items[1] : null;

                                const firstProduct = products.find((p: any) => p._id === firstItem?.productId);
                                const secondProduct = secondItem ? products.find((p: any) => p._id === secondItem.productId) : null;

                                const firstImage = firstProduct?.mainImage || "";
                                const secondImage = secondProduct?.mainImage || "";

                                const productName = firstItem ? firstItem.name : 'Unknown Product';
                                // Date formatting
                                const dateObj = new Date(order.createdAt);
                                const formattedDate = dateObj.toLocaleDateString();

                                return (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedOrder(order)}
                                        className="hover:bg-text-primary/10 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-6 pl-6 text-sm text-text-secondary">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-text-primary">{order._id.substring(0, 8)}...</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                {secondItem ? (
                                                    <div className="flex -space-x-3 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-primary-background overflow-hidden bg-gray-100 flex-shrink-0 z-10">
                                                            <img
                                                                src={secondImage}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-primary-background overflow-hidden bg-gray-100 flex-shrink-0 z-20">
                                                            <img
                                                                src={firstImage}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                                        <img src={firstImage} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <span className="text-sm text-text-primary font-medium">
                                                    {productName}
                                                    {order.items.length > 1 && <span className="text-text-secondary text-xs ml-1">+{order.items.length - 1} more</span>}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-text-secondary">{formattedDate}</td>
                                        <td className="py-4 px-6 text-sm font-bold text-text-primary">£{order.totalPrice.toLocaleString()}</td>
                                        <td className="py-4 px-6 text-sm text-text-secondary flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${order.orderStatus === 'cancelled' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                            {order.customer.email}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-text-secondary min-w-[300px] gap-2">
                                            {typeof order.shippingAddress === 'string'
                                                ? order.shippingAddress
                                                : [order.shippingAddress.line1, order.shippingAddress.city, order.shippingAddress.country].filter(Boolean).join(', ')}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(order.orderStatus)}
                                                <span className={`text-sm font-medium ${getStatusColor(order.orderStatus)} capitalize`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-text-secondary">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-6 flex items-center justify-between">
                    <div className="text-sm text-text-secondary hidden md:block">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-text-secondary hover:bg-text-primary/10 hover:text-text-primary'
                                }`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-text-primary text-primary-background' // Active state
                                        : 'bg-text-primary/10 text-text-primary hover:bg-text-primary/20'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages || totalPages === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-text-secondary hover:bg-text-primary/10 hover:text-text-primary'
                                }`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
