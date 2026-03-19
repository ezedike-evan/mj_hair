import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";
import { v } from "convex/values";

interface Order {
    _id: any;
    paymentIntentId?: string;
    checkoutPaymentId?: string;
    paymentStatus: string;
    customerEmail?: string;
    totalPrice: number;
}

export const syncPaymentStatuses = action({
    args: {
        updateDb: v.optional(v.boolean())
    },
    handler: async (ctx, { updateDb = false }) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2025-02-24.acacia",
        });

        const orders = (await ctx.runQuery(internal.orders.getAllOrdersInternal)) as Order[];
        const results: any[] = [];

        for (const order of orders) {
            if (order.paymentIntentId) {
                try {
                    const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
                    
                    const isMismatched = order.paymentStatus !== "paid" && paymentIntent.status === "succeeded";
                    
                    results.push({
                        orderId: order._id,
                        customer: order.customerEmail || "Unknown",
                        amount: order.totalPrice,
                        convexStatus: order.paymentStatus,
                        stripeStatus: paymentIntent.status,
                        mismatch: isMismatched,
                        actionTaken: "NONE"
                    });

                    if (isMismatched && updateDb) {
                        await ctx.runMutation(internal.stripe.fulfillOrder, {
                            paymentIntentId: order.paymentIntentId,
                            status: "succeeded"
                        });
                        results[results.length - 1].actionTaken = "UPDATED_TO_PAID";
                    }
                    
                } catch (e: any) {
                    results.push({
                        orderId: order._id,
                        error: e.message
                    });
                }
            } else if (order.checkoutPaymentId) {
                 results.push({
                     orderId: order._id,
                     convexStatus: order.paymentStatus,
                     note: "Skipping (Checkout.com order)"
                 });
            }
        }
        return results;
    }
});
