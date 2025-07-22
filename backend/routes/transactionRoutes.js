import express from 'express';
import { listTransactions, addTransaction, updateTransaction, deleteTransaction, countCompletedTransactions } from '../controller/transactionController.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

router.get('/', listTransactions);
router.post('/', protect, addTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);
router.get('/count/completed', countCompletedTransactions);

export default router; 