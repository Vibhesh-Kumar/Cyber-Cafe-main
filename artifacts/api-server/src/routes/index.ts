import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import categoriesRouter from "./categories";
import servicesRouter from "./services";
import applicationsRouter from "./applications";
import notificationsRouter from "./notifications";
import blogsRouter from "./blogs";
import faqsRouter from "./faqs";
import ticketsRouter from "./tickets";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(servicesRouter);
router.use(applicationsRouter);
router.use(notificationsRouter);
router.use(blogsRouter);
router.use(faqsRouter);
router.use(ticketsRouter);
router.use(adminRouter);
router.use(storageRouter);

export default router;
