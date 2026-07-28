import express from 'express';
import {
    getClosedIncidents,
    createPostIncidentReview,
    getPostIncidentReviews,
    getPostIncidentReviewById,
    updatePostIncidentReview
} from "../controllers/pca.Controller.js";

const pcaRouter = express.Router();

pcaRouter.get('/closed-incidents', getClosedIncidents);
pcaRouter.post('/reviews', createPostIncidentReview);
pcaRouter.get('/reviews', getPostIncidentReviews);
pcaRouter.get('/reviews/:id', getPostIncidentReviewById);
pcaRouter.put('/reviews/:id', updatePostIncidentReview);

export default pcaRouter;