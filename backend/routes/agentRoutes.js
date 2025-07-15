import express from 'express';
import { listAgents, addAgent, updateAgent, deleteAgent } from '../controller/agentController.js';

const router = express.Router();

router.get('/', listAgents);
router.post('/', addAgent);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);

export default router; 