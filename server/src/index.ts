import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  registerUserInputSchema,
  loginUserInputSchema,
  createProductInputSchema,
  updateProductInputSchema,
  processSaleInputSchema,
  salesReportInputSchema,
  userRoleSchema
} from './schema';

// Import handlers
import { registerUser, loginUser, getCurrentUser } from './handlers/auth';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  getLowStockProducts 
} from './handlers/products';
import { 
  processSale, 
  calculateCartTotal, 
  getAvailableProducts, 
  cancelOrder 
} from './handlers/pos';
import { 
  getOrders, 
  getOrderById, 
  getUserOrders, 
  getRecentOrders, 
  updateOrderStatus 
} from './handlers/orders';
import { 
  getDailySalesSummary, 
  getTotalRevenue, 
  getTopSellingProducts, 
  getSalesByHour, 
  getInventoryTurnover, 
  getCashierPerformance 
} from './handlers/reports';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    register: publicProcedure
      .input(registerUserInputSchema)
      .mutation(({ input }) => registerUser(input)),
    
    login: publicProcedure
      .input(loginUserInputSchema)
      .mutation(({ input }) => loginUser(input)),
    
    getCurrentUser: publicProcedure
      .input(z.string())
      .query(({ input }) => getCurrentUser(input)),
  }),

  // Product management routes (Admin only)
  products: router({
    create: publicProcedure
      .input(createProductInputSchema)
      .mutation(({ input }) => createProduct(input)),
    
    getAll: publicProcedure
      .query(() => getProducts()),
    
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getProductById(input)),
    
    update: publicProcedure
      .input(updateProductInputSchema)
      .mutation(({ input }) => updateProduct(input)),
    
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => deleteProduct(input)),
    
    getLowStock: publicProcedure
      .input(z.number().optional())
      .query(({ input }) => getLowStockProducts(input)),
  }),

  // POS (Point of Sale) routes
  pos: router({
    processSale: publicProcedure
      .input(processSaleInputSchema.extend({ userId: z.number() }))
      .mutation(({ input }) => processSale(input, input.userId)),
    
    calculateCartTotal: publicProcedure
      .input(z.array(z.object({
        product_id: z.number(),
        quantity: z.number().int().positive()
      })))
      .query(({ input }) => calculateCartTotal(input)),
    
    getAvailableProducts: publicProcedure
      .query(() => getAvailableProducts()),
    
    cancelOrder: publicProcedure
      .input(z.number())
      .mutation(({ input }) => cancelOrder(input)),
  }),

  // Order management routes
  orders: router({
    getAll: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
        userId: z.number().optional(),
        limit: z.number().optional()
      }).optional())
      .query(({ input }) => getOrders(input)),
    
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getOrderById(input)),
    
    getUserOrders: publicProcedure
      .input(z.object({
        userId: z.number(),
        limit: z.number().optional()
      }))
      .query(({ input }) => getUserOrders(input.userId, input.limit)),
    
    getRecent: publicProcedure
      .input(z.number().optional())
      .query(({ input }) => getRecentOrders(input)),
    
    updateStatus: publicProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(['pending', 'completed', 'cancelled'])
      }))
      .mutation(({ input }) => updateOrderStatus(input.orderId, input.status)),
  }),

  // Sales reporting routes (Admin only)
  reports: router({
    dailySalesSummary: publicProcedure
      .input(salesReportInputSchema)
      .query(({ input }) => getDailySalesSummary(input)),
    
    totalRevenue: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional()
      }).optional())
      .query(({ input }) => getTotalRevenue(input?.startDate, input?.endDate)),
    
    topSellingProducts: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        sortBy: z.enum(['quantity', 'revenue']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional()
      }).optional())
      .query(({ input }) => getTopSellingProducts(
        input?.limit,
        input?.sortBy,
        input?.startDate,
        input?.endDate
      )),
    
    salesByHour: publicProcedure
      .input(z.string().optional())
      .query(({ input }) => getSalesByHour(input)),
    
    inventoryTurnover: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional()
      }).optional())
      .query(({ input }) => getInventoryTurnover(input?.startDate, input?.endDate)),
    
    cashierPerformance: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional()
      }).optional())
      .query(({ input }) => getCashierPerformance(input?.startDate, input?.endDate)),
  }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC POS server listening at port: ${port}`);
}

start();