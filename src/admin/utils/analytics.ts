import type { Order, Product, Customer } from "../types/analytics";

export const calculateOrderCounts = (orders: Order[]) => {
    const totalOrders = orders.length;
    const newOrders = orders.filter(o => o.orderStatus === "pending").length;
    const completedOrders = orders.filter(o => o.orderStatus === "completed").length;
    const cancelledOrders = orders.filter(o => o.orderStatus === "cancelled").length;

    return {
        totalOrders,
        newOrders,
        completedOrders,
        cancelledOrders,
    };
};

export const calculateTotalRevenue = (orders: Order[]) => {
    return orders.reduce((acc, order) => acc + order.totalPrice, 0);
};

export const calculateWeeklyRevenue = (orders: Order[]) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    return last7Days.map(date => {
        const dayName = days[date.getDay()];
        const dailyRevenue = orders.reduce((acc, order) => {
            const orderDate = new Date(order.createdAt);
            if (orderDate.toDateString() === date.toDateString()) {
                return acc + order.totalPrice;
            }
            return acc;
        }, 0);
        return { day: dayName, revenue: dailyRevenue };
    });
};

export const calculateCategoryBreakdown = (completedOrders: Order[], products: Product[]) => {
    const productCategoryMap = new Map<string, string>();
    products.forEach(p => productCategoryMap.set(p._id, p.selectedCategory));

    const categoryBreakdown: Record<string, number> = {};

    completedOrders.forEach(order => {
        order.items.forEach(item => {
            const category = productCategoryMap.get(item.productId) || "Uncategorized";
            const itemRevenue = item.price * item.quantity;
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + itemRevenue;
        });
    });

    return categoryBreakdown;
};

export const calculateProductStats = (completedOrders: Order[], products: Product[]) => {
    const productStats: Record<string, {
        name: string;
        category: string;
        price: number;
        sales: number;
        revenue: number;
        image?: string | null;
    }> = {};

    const getProductDetails = (id: string) => products.find(p => p._id === id);

    completedOrders.forEach(order => {
        order.items.forEach(item => {
            if (!productStats[item.productId]) {
                const details = getProductDetails(item.productId);
                productStats[item.productId] = {
                    name: item.name,
                    category: details?.selectedCategory || "Uncategorized",
                    price: item.price,
                    sales: 0,
                    revenue: 0,
                    image: details?.mainImage
                };
            }
            productStats[item.productId].sales += item.quantity;
            productStats[item.productId].revenue += item.price * item.quantity;
        });
    });

    const sortedProducts = Object.values(productStats).sort((b, a) => a.revenue - b.revenue);
    const bestSellingProduct = sortedProducts.length > 0 ? {
        name: sortedProducts[0].name,
        quantity: sortedProducts[0].sales,
        image: sortedProducts[0].image
    } : null;
    const topProducts = sortedProducts.slice(0, 5);

    return { bestSellingProduct, topProducts };
};

export const calculateTopCategories = (completedOrders: Order[], products: Product[]) => {
    const categoryStats: Record<string, { name: string; sales: number; revenue: number }> = {};
    const getProductDetails = (id: string) => products.find(p => p._id === id);

    completedOrders.forEach(order => {
        order.items.forEach(item => {
            const details = getProductDetails(item.productId);
            const category = details?.selectedCategory || "Uncategorized";

            if (!categoryStats[category]) {
                categoryStats[category] = { name: category, sales: 0, revenue: 0 };
            }
            categoryStats[category].sales += item.quantity;
            categoryStats[category].revenue += item.price * item.quantity;
        });
    });

    return Object.values(categoryStats).sort((a, b) => b.sales - a.sales).slice(0, 4);
};

export const processCustomers = (orders: Order[]) => {
    const customerMap: Record<string, Customer> = {};

    orders.forEach((order) => {
        const formatAddress = (addr: any) => {
            if (typeof addr === "string") return addr;
            if (!addr || typeof addr !== "object") return "Unknown";
            return [addr.city, addr.state, addr.country].filter(Boolean).join(", ");
        };

        const email = order.customer.email || "unknown@example.com";
        const customerKey = email === "unknown@example.com" ? order.clerkId : email;

        if (!customerMap[customerKey]) {
            customerMap[customerKey] = {
                id: customerKey,
                customerId: `#CUST${Object.keys(customerMap).length + 1}`.padEnd(8, '0'),
                name: order.customer.name,
                email: email,
                phone: order.customer.phone,
                location: formatAddress(order.customer.address),
                totalOrders: 0,
                totalSpent: 0,
                lastOrderDate: 0,
                joinedAt: order.createdAt,
                status: "Inactive",
                avatar: order.customer.avatar || `https://ui-avatars.com/api/?name=${order.customer.name}&background=random`
            };
        }
        customerMap[customerKey].totalOrders += 1;
        if (order.orderStatus === "completed") {
            customerMap[customerKey].totalSpent += order.totalPrice;
            customerMap[customerKey].status = "Active";
        }
        if (order.createdAt > customerMap[customerKey].lastOrderDate) {
            customerMap[customerKey].lastOrderDate = order.createdAt;
        }
        if (order.createdAt < customerMap[customerKey].joinedAt) {
            customerMap[customerKey].joinedAt = order.createdAt;
        }
        // Update latest info if needed
        customerMap[customerKey].name = order.customer.name;
        customerMap[customerKey].phone = order.customer.phone;
        customerMap[customerKey].location = formatAddress(order.customer.address);
        if (order.customer.avatar) {
            customerMap[customerKey].avatar = order.customer.avatar;
        }
    });

    return Object.values(customerMap).sort((a, b) => b.lastOrderDate - a.lastOrderDate);
};
