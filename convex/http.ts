import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { handleStripeWebhook } from "./stripe";

const http = httpRouter();

http.route({
    path: "/shop/:id",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.length - 1];
        // Simple check: most IDs are alphanumeric strings
        if (!id) {
            return new Response("Missing ID", { status: 400 });
        }

        try {
            const product = await ctx.runQuery(api.products.getProduct, { id: id as Id<"products"> });

            if (!product) {
                return new Response("Product not found", { status: 404 });
            }

            const title = product.productName;
            const description = product.productDescription || "Check out this product on MJ Hair";
            const image = product.mainImage || "https://mj-hair.com/default-og.jpg"; // Fallback image
            const price = product.productPrice;

            // To fix this in production: run `npx convex env set SITE_URL https:// your-site.com`
            const SITE_URL = process.env.SITE_URL || "http://localhost:5173";
            const url = `${SITE_URL}/shop/${id}`;

            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | MJ Hair</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="MJ Hair">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Product Data -->
    <meta property="product:price:amount" content="${price}">
    <meta property="product:price:currency" content="GBP">

    <link rel="canonical" href="${url}">
</head>
<body>
    <h1>${title}</h1>
    <img src="${image}" alt="${title}" style="max-width: 100%; height: auto;">
    <p>${description}</p>
    <p>Price: £${price}</p>
    <script>window.location.href = "${url}";</script>
</body>
</html>`;

            return new Response(html, {
                headers: {
                    "Content-Type": "text/html",
                    "Cache-Control": "public, max-age=3600", // Cache for 1 hour
                },
                status: 200,
            });
        } catch (error) {
            console.error("Error generating meta tags:", error);
            return new Response("Internal Server Error", { status: 500 });
        }
    }),
});
http.route({
    path: "/stripe-webhook",
    method: "POST",
    handler: handleStripeWebhook,
});

http.route({
    path: "/stripe-webhook/",
    method: "POST",
    handler: handleStripeWebhook,
});

http.route({
    path: "/stripe-webhook",
    method: "GET",
    handler: httpAction(async () => {
        return new Response("Stripe Webhook is active. Stripe sends POST requests here.", { status: 200 });
    }),
});

http.route({
    path: "/stripe-webhook/",
    method: "GET",
    handler: httpAction(async () => {
        return new Response("Stripe Webhook is active. Stripe sends POST requests here.", { status: 200 });
    }),
});
export default http;
