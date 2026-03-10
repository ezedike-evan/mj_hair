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
  },
  handler: async (_ctx, args) => {
    const { email, name, orderId, totalPrice, items } = args;
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
