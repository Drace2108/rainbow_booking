import { Signup, Login } from "../Controllers/AuthController.js";
import express from "express";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);

export default router;