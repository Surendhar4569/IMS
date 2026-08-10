import express from 'express';
import { getMembers } from '../controllers/members.Controller.js';

const memebersRouter = express.Router();

memebersRouter.get("/", getMembers);

export default memebersRouter;