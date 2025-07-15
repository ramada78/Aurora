import express from 'express';
import { listSellers, addSeller, updateSeller, deleteSeller } from '../controller/sellerController.js';

const router = express.Router();

router.get('/', listSellers);
router.post('/', addSeller);
router.put('/:id', updateSeller);
router.delete('/:id', deleteSeller);

export default router; 