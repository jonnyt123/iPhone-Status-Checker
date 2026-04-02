import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import stripeWebhookRouter from "./stripe-webhook";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(stripeWebhookRouter);
router.use(adminRouter);

export default router;
