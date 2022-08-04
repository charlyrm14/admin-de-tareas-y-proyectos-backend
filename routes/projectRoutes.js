import express from 'express';
import {
    getProjects,
    createProject,
    getProject,
    editProject,
    deleteProject,
    searchCollaborator,
    addCollaborator,
    deleteCollaborator,
} from '../controllers/projectController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.route('/')
        .get( checkAuth, getProjects ) // Obtiene todos los proyectos
        .post( checkAuth, createProject ); // Nuevo proyecto

router.route('/:id')
        .get( checkAuth, getProject ) // Obtiene un proyecto junto con tareas relacionadas
        .put( checkAuth, editProject ) // Edita un proyecto
        .delete( checkAuth, deleteProject ); // Elimina un proyecto


router.post('/collaborators', checkAuth, searchCollaborator ); // Buscar colaborador de un proyecto
router.post('/add-collaborator/:id', checkAuth, addCollaborator ); // Agrega un colaborador a un proyecto
router.post('/delete-collaborator/:id', checkAuth, deleteCollaborator ); // Elimina un colaborador de un proyecto

export default router;
