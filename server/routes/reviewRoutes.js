import express from 'express'
import { addReview } from '../controllers/reviewControllers';

const router= express.Router();

router.get('/review/:orderId',addReview);

export default router;