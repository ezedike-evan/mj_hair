import { mutation, query } from "./_generated/server";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        // Check if we've already stored this identity or create a new one.
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (user !== null) {
            // If we've seen this identity before but the name or picture has changed, patch the value.
            if (user.name !== identity.name || user.pictureUrl !== identity.pictureUrl) {
                await ctx.db.patch(user._id, {
                    name: identity.name || "Anonymous",
                    pictureUrl: identity.pictureUrl
                });
            }
            return user._id;
        }

        // If it's a new identity, create a new `User`.
        const userId = await ctx.db.insert("users", {
            name: identity.name || "Anonymous",
            email: identity.email || "",
            pictureUrl: identity.pictureUrl,
            tokenIdentifier: identity.tokenIdentifier,
        });

        // Send welcome email
        await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
            email: identity.email || "",
            name: identity.name || "Anonymous",
        });

        return userId;
    },
});

import { internal } from "./_generated/api";

import { adminEmails } from "./admin";

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) return null;

        return {
            ...user,
            isAdmin: adminEmails.includes(user.email)
        };
    },
});
