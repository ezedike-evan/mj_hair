import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        pictureUrl: v.optional(v.string()),
        tokenIdentifier: v.string(),
    }).index("by_token", ["tokenIdentifier"]),

    dashboardData: defineTable({
        title: v.string(),
        value: v.number(),
        createdAt: v.number(),
    }),

    categories: defineTable({
        name: v.string(),
    }),

    tags: defineTable({
        name: v.string(),
    }),

    products: defineTable({
        productName: v.string(),
        productDescription: v.string(),
        productPrice: v.string(),
        discountedPrice: v.string(),
        taxIncluded: v.boolean(),
        startDate: v.string(),
        endDate: v.string(),
        stockQuantity: v.string(),
        isUnlimited: v.boolean(),
        stockStatus: v.union(v.literal("In Stock"), v.literal("Out of Stock")),

        images: v.array(v.string()),
        mainImage: v.string(),
        selectedCategory: v.string(),
        selectedTags: v.array(v.string()),

        status: v.union(v.literal("published"), v.literal("draft")),
        createdAt: v.number(),
    }),

    sales: defineTable({
        orderId: v.string(),
        status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("cancelled")),
        products: v.array(
            v.object({
                productId: v.id("products"),
                name: v.string(),
                price: v.number(),
                quantity: v.number(),
            })
        ),
        customer: v.object({
            name: v.string(),
            email: v.string(),
            phone: v.string(),
            address: v.string(),
        }),
        transaction: v.object({
            totalAmount: v.number(),
            paymentMethod: v.string(), // "card" | "paypal"
            date: v.number(),
        }),
    }),

    customers: defineTable({
        clerkId: v.optional(v.string()),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        email: v.optional(v.string()),
        username: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.union(
            v.object({
                fullName: v.string(),
                line1: v.string(),
                line2: v.optional(v.string()),
                city: v.string(),
                state: v.optional(v.string()),
                postalCode: v.string(),
                country: v.string(),
            }),
            v.object({
                street: v.string(),
                city: v.string(),
                zipCode: v.string(),
                country: v.string(),
            })
        )),
        orders: v.array(v.id("orders")),
        createdAt: v.number(),
    }).index("by_clerkId", ["clerkId"]),

    orders: defineTable({
        clerkId: v.optional(v.string()),
        customerName: v.optional(v.string()), // Kept for backward compat or easy access
        customerEmail: v.optional(v.string()),
        customerPhone: v.optional(v.string()),
        items: v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
            price: v.number(),
            name: v.string(),
        })),
        totalPrice: v.number(),
        shippingCost: v.optional(v.number()), // New field
        orderStatus: v.string(),
        paymentStatus: v.string(),
        shippingAddress: v.union(
            v.string(),
            v.object({ // Changed to object
                fullName: v.string(),
                line1: v.string(),
                line2: v.optional(v.string()),
                city: v.string(),
                state: v.optional(v.string()),
                postalCode: v.string(),
                country: v.string(),
            })
        ),
        paymentIntentId: v.optional(v.string()),
        checkoutPaymentId: v.optional(v.string()),
        sessionId: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_clerkId", ["clerkId"]).index("by_sessionId", ["sessionId"]).index("by_paymentIntentId", ["paymentIntentId"]),

    checkouts: defineTable({
        clerkId: v.string(),
        items: v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
            price: v.number(),
            name: v.string(),
        })),
        totalPrice: v.number(),
        shippingAddress: v.string(), // Keep as string for now or update if referenced? It's internal.
        sessionId: v.string(),
        status: v.union(v.literal("pending"), v.literal("completed"), v.literal("expired")),
    }).index("by_sessionId", ["sessionId"]),

    paymentMethods: defineTable({
        clerkId: v.string(),
        type: v.string(), // "visa", "mastercard"
        last4: v.string(),
        expiryMonth: v.string(),
        expiryYear: v.string(),
        isDefault: v.boolean(),
        cardHolderName: v.string(),
        createdAt: v.number(),
    }).index("by_clerkId", ["clerkId"]),

    loginHistory: defineTable({
        clerkId: v.string(),
        device: v.string(),
        location: v.string(),
        ipAddress: v.string(),
        timestamp: v.number(),
    }).index("by_clerkId", ["clerkId"]),

    visitors: defineTable({
        ipHash: v.string(),
        userAgent: v.string(),
        path: v.string(),
        clerkId: v.optional(v.string()), // Nullable if not logged in
        visitedAt: v.number(),
    }).index("by_ipHash", ["ipHash"]),

    newsletter: defineTable({
        email: v.string(),
        subscribedAt: v.number(),
    }).index("by_email", ["email"]),
});
