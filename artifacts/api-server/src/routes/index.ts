import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import categoriesRouter from "./categories";
import teamRouter from "./team";
import contentRouter from "./content";
import partnersRouter from "./partners";
import servicesRouter from "./services";
import adminRouter from "./admin";
import uploadRouter from "./upload";
import comicsRouter from "./comics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(categoriesRouter);
router.use(teamRouter);
router.use(contentRouter);
router.use(partnersRouter);
router.use(servicesRouter);
router.use(adminRouter);
router.use(uploadRouter);
router.use(comicsRouter);

export default router;
