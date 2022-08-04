import express from 'express';
import {
    createTask,
    getTask,
    editTask,
    deleteTask,
    changeStatus,
} from '../controllers/taskController.js';
import checkAuth from '../middleware/checkAuth.js';


const router = express.Router();

router.post('/', checkAuth, createTask ); // Nueva Tarea

router.route('/:id')
        .get( checkAuth, getTask ) // Obtener Tarea
        .put( checkAuth, editTask ) // Editar Tarea
        .delete( checkAuth, deleteTask ); // Eliminar Tarea

router.post('/change-status/:id', checkAuth, changeStatus ); // Cambiar estatus de tarea




export default router;