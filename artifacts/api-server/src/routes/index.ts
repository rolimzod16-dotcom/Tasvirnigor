import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import teamRouter from "./team";
import contentRouter from "./content";
import adminRouter from "./admin";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(teamRouter);
router.use(contentRouter);
router.use(adminRouter);
router.use(uploadRouter);

export default router;
