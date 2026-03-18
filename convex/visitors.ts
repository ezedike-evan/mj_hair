import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./admin";

export const trackVisit = mutation({
    args: {
        ipHash: v.string(),
        userAgent: v.string(),
        path: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const clerkId = identity?.subject;

        await ctx.db.insert("visitors", {
            ipHash: args.ipHash,
            userAgent: args.userAgent,
            path: args.path,
            clerkId: clerkId,
            visitedAt: Date.now(),
        });
    },
});

export const getVisitorCount = query({
    handler: async (ctx) => {
        // Protected by admin check as it's for the dashboard
        await checkAdmin(ctx);
        const visitors = await ctx.db.query("visitors").collect();
        return visitors.length;
    },
});
