import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { adminEmails } from "./admin";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "MJ Hair <customer@mjhairpalace.co.uk>";

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (_ctx, args) => {
    const { email, name } = args;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Welcome to MJ's Hair Palace! ✨",
        html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h1 style="color: #6A3E1D;">Welcome, ${name}!</h1>
                        <p>We're thrilled to have you join our community of beauty and confidence.</p>
                        <p>At MJ's Hair Palace, we empower women through quality hair solutions. Explore our collection of luxury wigs and premium bundles.</p>
                        <a href="https://www.mjhairpalace.co.uk/shop" style="display: inline-block; padding: 10px 20px; background-color: #BD713E; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
                        <p>If you have any questions, just reply to this email. We're here to help!</p>
                        <p>Stay Beautiful,<br/>The MJ Hair Team</p>
                    </div>
                `,
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  },
});

export const sendOrderConfirmation = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    orderId: v.string(),
    totalPrice: v.number(),
    items: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    shippingAddress: v.optional(v.union(
        v.string(),
        v.object({
            fullName: v.string(),
            line1: v.string(),
            line2: v.optional(v.string()),
            city: v.string(),
            postalCode: v.string(),
            country: v.string(),
        })
    )),
  },
  handler: async (_ctx, args) => {
    const { email, name, orderId, totalPrice, items, shippingAddress } = args;

    let addressHtml = "Not provided";
    if (typeof shippingAddress === "object" && shippingAddress !== null) {
        addressHtml = `${shippingAddress.fullName || name}<br/>${shippingAddress.line1}<br/>${shippingAddress.line2 ? shippingAddress.line2 + '<br/>' : ''}${shippingAddress.city}, ${shippingAddress.postalCode}<br/>${shippingAddress.country}`;
    } else if (shippingAddress) {
        addressHtml = shippingAddress;
    }
    const itemsHtml = items.map(item => `<li>${item.name} x ${item.quantity} - £${item.price.toLocaleString()}</li>`).join("");

    try {
      // Send to Customer
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Order Confirmation #${orderId.slice(-6)} - MJ's Hair Palace`,
        html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h1 style="color: #6A3E1D;">Thank you for your order, ${name}!</h1>
                        <p>We've received your order and we're getting it ready for you.</p>
                        <h3>Order Summary (ID: ${orderId})</h3>
                        <ul>${itemsHtml}</ul>
                        <p><strong>Total Price: £${totalPrice.toLocaleString()}</strong></p>
                        <h3>Shipping Details</h3>
                        <p>${addressHtml}</p>
                        <p>We'll send you another update once your order has shipped.</p>
                        <p>Best regards,<br/>The MJ Hair Team</p>
                    </div>
                `,
      });
      console.log(`Order confirmation sent to customer: ${email}`);

      // Send to Admin
      await resend.emails.send({
        from: FROM_EMAIL,
        to: adminEmails,
        subject: `New Order Received! #${orderId.slice(-6)}`,
        html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h1 style="color: #6A3E1D;">New Order Alert!</h1>
                        <p>A new order has been placed by ${name} (${email}).</p>
                        <h3>Order Details</h3>
                        <ul>${itemsHtml}</ul>
                        <p><strong>Total: £${totalPrice.toLocaleString()}</strong></p>
                        <h3>Shipping Address</h3>
                        <p>${addressHtml}</p>
                        <a href="https://www.mjhairpalace.co.uk/dashboard/orders" style="display: inline-block; padding: 10px 20px; background-color: #6A3E1D; color: #fff; text-decoration: none; border-radius: 5px;">View Order in Dashboard</a>
                    </div>
                `,
      });
      console.log(`Admin alert sent for order ${orderId}`);
    } catch (error) {
      console.error("Error sending order confirmation emails:", error);
    }
  },
});

export const sendOrderStatusUpdate = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    orderId: v.string(),
    status: v.string(),
  },
  handler: async (_ctx, args) => {
    const { email, name, orderId, status } = args;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Order Update #${orderId.slice(-6)}: ${status}`,
        html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #6A3E1D;">Hello ${name},</h2>
                        <p>The status of your order <strong>#${orderId}</strong> has been updated to: <span style="color: #BD713E; font-weight: bold;">${status}</span>.</p>
                        <p>You can track your order status in your dashboard.</p>
                        <a href="https://www.mjhairpalace.co.uk/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #BD713E; color: #fff; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                        <p>Best regards,<br/>The MJ Hair Team</p>
                    </div>
                `,
      });
      console.log(`Order status update sent to ${email}`);
    } catch (error) {
      console.error("Error sending order status update:", error);
    }
  },
});

export const sendNewsletterConfirmation = internalAction({
  args: {
    email: v.string(),
  },
  handler: async (_ctx, args) => {
    const { email } = args;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Welcome to the MJ Hair VIP List! 💖",
        html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h1 style="color: #6A3E1D;">You're on the list!</h1>
                        <p>Thank you for joining the MJ Hair VIP list. You'll be the first to know about:</p>
                        <ul>
                            <li>Exclusive discounts</li>
                            <li>Early access to new collections</li>
                            <li>Beauty and hair care tips</li>
                        </ul>
                        <p>Stay tuned for some amazing updates.</p>
                        <p>Stay Beautiful,<br/>The MJ Hair Team</p>
                    </div>
                `,
      });
      console.log(`Newsletter confirmation sent to ${email}`);
    } catch (error) {
      console.error("Error sending newsletter confirmation:", error);
    }
  },
});




export const sendDispatchEmail = internalAction({
    args: {
        orderId: v.id("orders"),
        customerEmail: v.string(),
        customerName: v.string(),
        trackingNumber: v.string(),
        trackingUrl: v.string(),
        items: v.array(v.object({
            name: v.string(),
            quantity: v.number(),
            price: v.number(),
        })),
        shippingAddress: v.any(),
        imageUrls: v.optional(v.array(v.string())),
    },
    handler: async (_ctx, args) => {
        const resendApiKey = process.env.RESEND_API_KEY;
        const supportEmail = "mjhairpalace@gmail.com";
        const siteUrl = "https://mjhairpalace.co.uk";
        const logoUrl = `${siteUrl}/logo.svg`;

        if (!resendApiKey) {
            console.error("Missing email configuration");
            return;
        }

        const resend = new Resend(resendApiKey);

        const firstName = args.customerName.split(" ")[0];

        const imageBlocksHtml = (args.imageUrls ?? []).length > 0
            ? `
                <div style="margin: 30px 0;">
                    <h3 style="font-size: 14px; text-transform: uppercase; color: #888888; letter-spacing: 1px; margin-bottom: 12px;">Dispatch Photos</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${(args.imageUrls ?? []).map(url => `
                            <img src="${url}" alt="Dispatch photo"
                                style="width: 140px; height: 140px; object-fit: cover; border-radius: 6px; border: 1px solid #eeeeee;" />
                        `).join("")}
                    </div>
                </div>
            `
            : "";

        const itemRowsHtml = args.items.map(item => `
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-size: 14px;">${item.name}</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; text-align: center; font-size: 14px;">×${item.quantity}</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-size: 14px;">£${item.price.toFixed(2)}</td>
            </tr>
        `).join("");

        const html = `
            <div style="background-color: #f9f9f9; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">

                    <div style="text-align: center; padding: 30px 20px; background-color: #ffffff;">
                        <img src="${logoUrl}" alt="MJ Hair Palace" style="max-width: 200px; height: auto;">
                    </div>

                    <div style="padding: 0 40px 40px 40px;">

                        <h2 style="margin-top: 0; color: #111111; font-weight: 700; text-align: center; font-size: 24px;">
                            Your order is on its way! 🎉
                        </h2>

                        <p style="font-size: 15px;">Hi ${firstName},</p>

                        <p style="font-size: 15px;">
                            Great news — your order has just left us and is heading your way.
                            We've personally packed it with care and can't wait for you to receive it.
                        </p>

                        <p style="font-size: 15px;">
                            Whether this is your first order or your fifth, we're so grateful you chose
                            MJ Hair Palace. Now the exciting part — the wait!
                        </p>

                        <!-- Tracking Card -->
                        <div style="margin: 30px 0; padding: 24px; background-color: #fff8f9; border: 1px solid #f5c6cb; border-radius: 8px; text-align: center;">
                            <p style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Tracking Number</p>
                            <p style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #111111; letter-spacing: 2px;">${args.trackingNumber}</p>
                            <a href="${args.trackingUrl}" target="_blank"
                                style="display: inline-block; padding: 12px 28px; background-color: #BD713E; color: #ffffff;
                                       text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                Track My Order →
                            </a>
                        </div>

                        <!-- Order Summary -->
                        <div style="margin: 30px 0;">
                            <h3 style="font-size: 14px; text-transform: uppercase; color: #888888; letter-spacing: 1px; margin-bottom: 12px;">What's in your parcel</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tbody>${itemRowsHtml}</tbody>
                            </table>
                        </div>

                        ${imageBlocksHtml}

                        <p style="font-size: 14px; color: #555555; margin-top: 30px;">
                            If your tracking hasn't updated within 24 hours, don't worry — it can take a little time
                            to appear in the system. If anything looks off, just reply to this email and we'll sort it out straight away.
                        </p>

                        <p style="font-size: 15px; margin-top: 24px;">
                            With love,<br>
                            <strong>MJ Hair Palace 💕</strong>
                        </p>
                    </div>

                    <div style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center; font-size: 13px; color: #777777;">
                        <p style="margin: 0 0 8px 0;">Questions? We're always here.</p>
                        <p style="margin: 0 0 16px 0;">
                            <a href="mailto:${supportEmail}" style="color: #BD713E; text-decoration: none;">${supportEmail}</a>
                        </p>
                        <p style="font-size: 12px; color: #999999; margin: 0;">
                            &copy; ${new Date().getFullYear()} MJ Hair Palace. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;

        const text = `
Hi ${firstName},

Your order is on its way! 🎉

We've packed it with care and it's now heading to you.

TRACKING DETAILS
----------------
Tracking Number: ${args.trackingNumber}
Track your order here: ${args.trackingUrl}

WHAT'S IN YOUR PARCEL
----------------------
${args.items.map(i => `- ${i.name} ×${i.quantity}`).join("\n")}

If your tracking hasn't updated within 24 hours, don't worry — it can take a little time to appear in the system.

With love,
MJ Hair Palace 💕

Questions? Reply to this email or contact us at ${supportEmail}.
        `.trim();

        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: args.customerEmail,
                subject: `Your order is on its way, ${firstName}! 🎉`,
                replyTo: supportEmail,
                html,
                text,
            });
        } catch (error) {
            console.error("Failed to send dispatch email:", error);
        }
    },
});