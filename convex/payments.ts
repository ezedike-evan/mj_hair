import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

export const createPaymentIntent = action({
    args: { amount: v.number(), email: v.optional(v.string()) },
    handler: async (_ctx, { amount, email }) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2025-02-24.acacia",
        });

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "gbp",
            receipt_email: email,
            payment_method_types: ['card', 'afterpay_clearpay'],
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    },
});