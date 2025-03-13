import router from "./health.routes";
import { RegisterUser } from "../controllers/User.controller";

const router = router();

// router.post("/register", RegisterUser);

router.route("/register").post(RegisterUser);

export default UserRoutes;
