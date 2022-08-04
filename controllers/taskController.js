import mongoose from "mongoose";
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const createTask = async ( req, res ) => {
    const { project } = req.body;

    // Verifica si existe projecto
    const projectExists = await Project.findById( project );

    if ( !projectExists) {
        const error = new Error('El proyecto no existe');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Si existe proyecto
    if ( projectExists.creator.toString() !== req.user.id.toString() ) {
        const error = new Error('No tienes permisos para añadir tareas');
        return res.status( 403 ).json( { msg: error.message } );
    }

    try {
        const savedTask = await Task.create( req.body );
        // Almacena id tarea en proyecto
        projectExists.tasks.push(savedTask._id);
        await projectExists.save();

        res.json( savedTask );
    } catch ( error ) {
        console.log( error );
    }

}

const getTask = async ( req, res ) => {
    const { id } = req.params;

    const validID   = mongoose.Types.ObjectId.isValid( id );

    // Valida si es un ID valido para Mongoose
    if ( !validID ) {
        const error = new Error('La Tarea No Existe');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Obtiene tarea junto con proyecto relacionado a través de populate
    const task = await Task.findById( id ).populate("project");

    // Si tarea no existe
    if ( !task ) {
        const error = new Error('Tarea no encontrada');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Valida que la tarea pertenezca al usuario
    if ( task.project.creator.toString() !== req.user.id.toString() ) {
        const error = new Error('Acción no válida');
        return res.status( 403 ).json( { msg: error.message } );
    }

    res.json( task );
}

const editTask = async ( req, res ) => {
    const { id } = req.params;

    const validID   = mongoose.Types.ObjectId.isValid( id );

    // Valida si es un ID valido para Mongoose
    if ( !validID ) {
        const error = new Error('La Tarea No Existe');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Obtiene tarea junto con proyecto relacionado a través de populate
    const task = await Task.findById( id ).populate("project");

    // Si tarea no existe
    if ( !task ) {
        const error = new Error('Tarea no encontrada');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Valida que la tarea pertenezca al usuario
    if ( task.project.creator.toString() !== req.user.id.toString() ) {
        const error = new Error('Acción no válida');
        return res.status( 403 ).json( { msg: error.message } );
    }

    task.name           = req.body.name || task.name;
    task.description    = req.body.description || task.description;
    task.priority       = req.body.priority || task.priority;
    task.deliveryDate   = req.body.deliveryDate || task.deliveryDate;

    try {
        const savedTask = await task.save();
        res.json( savedTask );
    } catch ( error ) {
        console.log( error );
    }

}

const deleteTask = async ( req, res ) => {
    const { id } = req.params;

    const validID   = mongoose.Types.ObjectId.isValid( id );

    // Valida si es un ID valido para Mongoose
    if ( !validID ) {
        const error = new Error('La Tarea No Existe');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Obtiene tarea junto con proyecto relacionado a través de populate
    const task = await Task.findById( id ).populate("project");

    // Si tarea no existe
    if ( !task ) {
        const error = new Error('Tarea no encontrada');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Valida que la tarea pertenezca al usuario
    if ( task.project.creator.toString() !== req.user.id.toString() ) {
        const error = new Error('Acción no válida');
        return res.status( 403 ).json( { msg: error.message } );
    }

    try {

        const project = await Project.findById( task.project );
        project.tasks.pull(task._id);

        await Promise.allSettled([
            await project.save(),
            await task.deleteOne()
        ])
        
        
        res.json( { msg: 'Tarea eliminada' } );
    } catch ( error ) {
        console.log( error );
    }
}

const changeStatus = async ( req, res ) => {
    const { id } = req.params;

    const validID   = mongoose.Types.ObjectId.isValid( id );

    // Valida si es un ID valido para Mongoose
    if ( !validID ) {
        const error = new Error('La Tarea No Existe');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Obtiene tarea junto con proyecto relacionado a través de populate
    const task = await Task.findById( id ).populate("project");

    // Si tarea no existe
    if ( !task ) {
        const error = new Error('Tarea no encontrada');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Valida que la tarea pertenezca al usuario
    if ( task.project.creator.toString() !== req.user.id.toString() && !task.project.collaborators.some( ( collaborator ) => collaborator._id.toString() === req.user._id.toString() ) ) {
        const error = new Error('Acción no válida');
        return res.status( 403 ).json( { msg: error.message } );
    }

    task.status     = !task.status;
    task.completed  = req.user._id;
    await task.save();

    const savedTask = await Task.findById( id ).populate("project").populate("completed");

    res.json(savedTask);
}

export {
    createTask,
    getTask,
    editTask,
    deleteTask,
    changeStatus,
}