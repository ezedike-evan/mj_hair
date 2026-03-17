export interface Order {
    _id: string;
    _creationTime: number;
    clerkId: string;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    orderStatus: string;
    paymentStatus: string;
    totalPrice: number;
    shippingAddress: string | {
        fullName: string;
        line1: string;
        line2?: string;
        city: string;
        postalCode: string;
        country: string;
    };
    createdAt: number;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        avatar?: string;
    };
}

export interface Customer {
    id: string;
    customerId: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: number;
    joinedAt: number;
    status: "Active" | "Inactive";
    avatar: string;
}

export interface Product {
    _id: string;
    productName: string;
    productDescription?: string;
    selectedCategory: string;
    selectedTags?: string[];
    productPrice: string;
    discountedPrice?: string;
    couponCode?: string;
    stockQuantity: string;
    stockStatus: string;
    status: string;
    mainImage?: string;
    images?: string[];
    imageStorageIds?: string[];
    mainImageStorageId?: string;
    variants?: string;
    _creationTime: number;
    isUnlimited: boolean;
    startDate?: string;
    endDate?: string;
    taxIncluded?: boolean;
}

export interface AnalyticsState {
    orders: Order[];
    products: Product[];
    loading: boolean;
    totalRevenue: number;
    totalSales: number;
    totalOrders: number;
    totalVisitors: number;
    newOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    weeklyRevenue: { day: string; revenue: number }[];
    recentTransactions: Order[];
    categoryBreakdown: Record<string, number>;
    bestSellingProduct: { name: string; quantity: number; image?: string | null } | null;
    topProducts: { name: string; category: string; price: number; sales: number; revenue: number; image?: string | null }[];
    topCategories: { name: string; sales: number; revenue: number }[];
    customers: Customer[];
}
