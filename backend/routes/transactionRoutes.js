import express from 'express';
import { listTransactions, addTransaction, updateTransaction, deleteTransaction, countCompletedTransactions } from '../controller/transactionController.js';

const router = express.Router();

router.get('/', listTransactions);
router.post('/', addTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/count/completed', countCompletedTransactions);

export default router; 