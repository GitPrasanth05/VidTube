import { Router } from "express";
import { health } from "../controllers/HealthCheck.controller.js";

const router = Router();

router.route("/").get(health);
// router.route("/test").get(health);

export default router;
