/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as customers from "../customers.js";
import type * as dashboard from "../dashboard.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as newsletter from "../newsletter.js";
import type * as orders from "../orders.js";
import type * as paymentMethods from "../paymentMethods.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as sales from "../sales.js";
import type * as settings from "../settings.js";
import type * as stripe from "../stripe.js";
import type * as sync from "../sync.js";
import type * as temp from "../temp.js";
import type * as users from "../users.js";
import type * as visitors from "../visitors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  customers: typeof customers;
  dashboard: typeof dashboard;
  emails: typeof emails;
  http: typeof http;
  newsletter: typeof newsletter;
  orders: typeof orders;
  paymentMethods: typeof paymentMethods;
  payments: typeof payments;
  products: typeof products;
  sales: typeof sales;
  settings: typeof settings;
  stripe: typeof stripe;
  sync: typeof sync;
  temp: typeof temp;
  users: typeof users;
  visitors: typeof visitors;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
