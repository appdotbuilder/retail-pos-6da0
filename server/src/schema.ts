import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['admin', 'cashier']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  password_hash: z.string(),
  role: userRoleSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// User input schemas
export const registerUserInputSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: userRoleSchema
});

export type RegisterUserInput = z.infer<typeof registerUserInputSchema>;

export const loginUserInputSchema = z.object({
  username: z.string(),
  password: z.string()
});

export type LoginUserInput = z.infer<typeof loginUserInputSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(), // Stored as numeric in DB, but we use number in TS
  stock: z.number().int(),
  image_url: z.string().nullable(), // Optional image URL
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Product input schemas
export const createProductInputSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  image_url: z.string().url().nullable().optional()
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  image_url: z.string().url().nullable().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Order status enum
export const orderStatusSchema = z.enum(['pending', 'completed', 'cancelled']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// Order schema
export const orderSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  total_amount: z.number(),
  status: orderStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

// Order item schema
export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int().positive(),
  unit_price: z.number(),
  total_price: z.number(),
  created_at: z.coerce.date()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Cart item schema (for POS interface)
export const cartItemSchema = z.object({
  product_id: z.number(),
  quantity: z.number().int().positive(),
  unit_price: z.number(),
  total_price: z.number()
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Process sale input schema
export const processSaleInputSchema = z.object({
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().int().positive()
  })).min(1),
  total_amount: z.number().positive()
});

export type ProcessSaleInput = z.infer<typeof processSaleInputSchema>;

// Sales report schemas
export const dailySalesSummarySchema = z.object({
  date: z.string(), // Date in YYYY-MM-DD format
  total_orders: z.number().int(),
  total_revenue: z.number(),
  total_items_sold: z.number().int()
});

export type DailySalesSummary = z.infer<typeof dailySalesSummarySchema>;

export const salesReportInputSchema = z.object({
  start_date: z.string().optional(), // YYYY-MM-DD format
  end_date: z.string().optional(),   // YYYY-MM-DD format
  limit: z.number().int().positive().optional()
});

export type SalesReportInput = z.infer<typeof salesReportInputSchema>;

// Order with items schema (for detailed order view)
export const orderWithItemsSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  total_amount: z.number(),
  status: orderStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  items: z.array(z.object({
    id: z.number(),
    product_id: z.number(),
    product_name: z.string(),
    quantity: z.number().int(),
    unit_price: z.number(),
    total_price: z.number()
  }))
});

export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;

// Authentication response schema
export const authResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    role: userRoleSchema
  }),
  token: z.string().optional() // If using JWT tokens
});

export type AuthResponse = z.infer<typeof authResponseSchema>;