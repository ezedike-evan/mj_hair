import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const createTemporaryProduct = mutation({
    args: {},
    handler: async (ctx) => {
        const productId = await ctx.db.insert("products", {
            productName: "1-Hour Flash Sale Ultimate Wig",
            productDescription: "This product will automatically be removed in 1 hour.",
            productPrice: "200",
            discountedPrice: "99",
            taxIncluded: true,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            stockQuantity: "50",
            isUnlimited: false,
            stockStatus: "In Stock",
            images: [],
            mainImage: "",
            selectedCategory: "wigs",
            selectedTags: ["flash-sale"],
            status: "published",
            createdAt: Date.now(),
        });

        // Schedule deletion in 1 hour (3600000 ms)
        await ctx.scheduler.runAfter(1000 * 60 * 60, api.products.deleteProductInternal, { id: productId });

        return productId;
    }
});
