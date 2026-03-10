export const adminEmails = [
    "mjhairpalace@gmail.com"
];

export async function checkAdmin(ctx: { auth: { getUserIdentity: () => Promise<any> } }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized");
    }
    const email = identity.email as string;
    if (!adminEmails.includes(email)) {
        throw new Error("Forbidden");
    }
    return identity;
}
