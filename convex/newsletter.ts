import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const { email } = args;

    // Check if already subscribed
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return { success: true, message: "Already subscribed" };
    }

    // Add to newsletter table
    await ctx.db.insert("newsletter", {
      email,
      subscribedAt: Date.now(),
    });

    // Trigger confirmation email
    await ctx.scheduler.runAfter(0, internal.emails.sendNewsletterConfirmation, {
      email,
    });

    return { success: true, message: "Successfully subscribed" };
  },
});
