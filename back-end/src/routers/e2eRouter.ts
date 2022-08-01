import { Router } from "express";

import deleteAll from "../controllers/e2eTestController.js"

const e2eRouter = Router()

e2eRouter.post("/reset", deleteAll)

export default e2eRouter