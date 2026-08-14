import express from 'express';
import { getDepartments } from '../controllers/departments.Controller.js';

const departmentsRouter = express.Router();

departmentsRouter.get("/", getDepartments);

export default departmentsRouter;