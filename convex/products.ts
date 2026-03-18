import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./admin";
import { api } from "./_generated/api";

// Products
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const getProducts = query({
    handler: async (ctx) => {
        try {
            const products = await ctx.db.query("products").collect();
            return await Promise.all(
                products.map(async (product) => {
                    const images = await Promise.all(
                        (product.images || []).map(async (id) => {
                            try {
                                return await ctx.storage.getUrl(id);
                            } catch {
                                return null;
                            }
                        })
                    );

                    let mainImage = "";
                    if (product.mainImage) {
                        try {
                            mainImage = (await ctx.storage.getUrl(product.mainImage)) || "";
                        } catch {
                            mainImage = "";
                        }
                    }

                    return {
                        ...product,
                        images: images.filter((url): url is string => url !== null),
                        mainImage,
                    };
                })
            );
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    },
});

export const addProduct = mutation({
    args: {
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
        expiresInHours: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        const { expiresInHours, ...productData } = args;
        const productId = await ctx.db.insert("products", {
            ...productData,
            createdAt: Date.now(),
        });

        if (expiresInHours) {
            await ctx.scheduler.runAfter(expiresInHours * 60 * 60 * 1000, api.products.deleteProductInternal, { id: productId });
        }

        return productId;
    },
});

// Categories
export const getCategories = query({
    handler: async (ctx) => {
        return await ctx.db.query("categories").collect();
    },
});

export const addCategory = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        // Check if category already exists
        const exisiting = await ctx.db
            .query("categories")
            .filter((q) => q.eq(q.field("name"), args.name))
            .first();

        if (!exisiting) {
            await ctx.db.insert("categories", { name: args.name });
        }
    },
});

// Tags
export const getTags = query({
    handler: async (ctx) => {
        return await ctx.db.query("tags").collect();
    },
});

export const addTag = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        const exisiting = await ctx.db
            .query("tags")
            .filter((q) => q.eq(q.field("name"), args.name))
            .first();

        if (!exisiting) {
            await ctx.db.insert("tags", { name: args.name });
        }
    },
});

export const getProduct = query({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.id);
        if (!product) return null;

        const images = await Promise.all(
            (product.images || []).map(async (id) => {
                try {
                    return await ctx.storage.getUrl(id);
                } catch {
                    return null;
                }
            })
        );

        let mainImage = "";
        if (product.mainImage) {
            try {
                mainImage = (await ctx.storage.getUrl(product.mainImage)) || "";
            } catch {
                mainImage = "";
            }
        }

        return {
            ...product,
            images: images.filter((url): url is string => url !== null),
            mainImage,
            imageStorageIds: product.images,
            mainImageStorageId: product.mainImage,
        };
    },
});

export const updateProduct = mutation({
    args: {
        id: v.id("products"),
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
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const deleteProduct = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        await ctx.db.delete(args.id);
    },
});

export const deleteProductInternal = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
