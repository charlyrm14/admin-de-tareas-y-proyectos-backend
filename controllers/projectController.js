import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from "../models/User.js";


const getProjects = async ( req, res ) => {
    const projects = await Project.find({
        '$or': [
            {'collaborators': { $in: req.user } },
            {'creator': { $in: req.user } }
        ]
    })
    .select('-tasks');

    res.json( projects );
}

const createProject = async ( req, res ) => {
    const project   = new Project( req.body );
    project.creator = req.user._id;

    try {
        const saveProject = await project.save();
        res.json( saveProject );
    } catch ( error ) {
        console.log( error );
    }
}

const getProject = async ( req, res ) => {
    const { id }    = req.params;
    const validID   = mongoose.Types.ObjectId.isValid( id );

    // Valida si es un ID valido para Mongoose
    if ( !validID ) {
        const error = new Error('El Proyecto No Existe');
        return res.status( 404 ).json( { msg: error.message } );
    }

    const project   = await Project.findById( id )
                                    .populate({
                                        path: 'tasks',
                                        populate: {
                                            path: 'completed',
                                            select: "name"
                                        }
                                    })
                                    .populate("collaborators", "name email");

    // Si no existe proyecto
    if ( !project ) {
        const error = new Error('Recurso no encontrado');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Validar que el proyecto pertenezca a quien lo creo
    if ( project.creator.toString() !== req.user._id.toString() && !project.collaborators.some( collaborator => collaborator._id.toString() === req.user._id.toString() ) ) {
        const error = new Error('Acción no válida');
        return res.status( 401 ).json( { msg: error.message } );
    }
 
    res.json(project);
}

const editProject = async ( req, res ) => {
    const { id }    = req.params;
    const validID   = mongoose.Types.ObjectId.isValid( id );

    // Valida si es un ID valido para Mongoose
    if ( !validID ) {
        const error = new Error('El Proyecto No Existe');
        return res.status( 404 ).json( { msg: error.message } );
    }

    const project   = await Project.findById( id );

    // Si no existe proyecto
    if ( !project ) {
        const error = new Error('Recurso no encontrado');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Validar que el proyecto pertenezca a quien lo creo
    if ( project.creator.toString() !== req.user._id.toString() ) {
        const error = new Error('Acción no válida');
        return res.status( 401 ).json( { msg: error.message } );
    }


    project.name            = req.body.name || project.name;
    project.description     = req.body.description || project.description;
    project.deliveryDate    = req.body.deliveryDate || project.deliveryDate;
    project.client          = req.body.client || project.client;


    try {
        const updatedProject = await project.save();
        res.json( updatedProject );
    } catch ( error ) {
        console.log( error );
    }

}

const deleteProject = async ( req, res ) => {
    const { id }    = req.params;
    const validID   = mongoose.Types.ObjectId.isValid( id );

    // Valida si es un ID valido para Mongoose
    if ( !validID ) {
        const error = new Error('El Proyecto No Existe');
        return res.status( 404 ).json( { msg: error.message } );
    }

    const project   = await Project.findById( id );

    // Si no existe proyecto
    if ( !project ) {
        const error = new Error('Recurso no encontrado');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Validar que el proyecto pertenezca a quien lo creo
    if ( project.creator.toString() !== req.user._id.toString() ) {
        const error = new Error('Acción no válida');
        return res.status( 401 ).json( { msg: error.message } );
    }

    try {
        await project.deleteOne();
        res.json( { msg: 'Proyecto eliminado' } );
    } catch ( error ) {
        console.log( error );
    }

}

const searchCollaborator = async ( req, res ) => {
    const { email } = req.body;

    const user      = await User.findOne( { email } ).select('-confirmed -createdAt -password -token -updatedAt -__v');

    if ( !user ) {
        const error = new Error('Usuario no encontrado');
        return res.status( 404 ).json( { msg: error.message } );
    }

    res.json(user);
}

const addCollaborator = async ( req, res ) => {

    const project = await Project.findById( req.params.id );

    if ( !project ) {
        const error = new Error('Proyecto no encontrado');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Solamente el creador del rpoyecto puede agregar colaboradores
    if ( project.creator.toString() !== req.user._id.toString() ) {
        const error = new Error('Acción no válida');
        return res.status( 404 ).json( { msg: error.message } );
    }

    const { email } = req.body;

    const user      = await User.findOne( { email } ).select('-confirmed -createdAt -password -token -updatedAt -__v');

    if ( !user ) {
        const error = new Error('Usuario no encontrado');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Colaborador no es el creador del proyecto
    if ( project.creator.toString() === user._id.toString() ) {
        const error = new Error('El creador del proyecto no puede ser colaborador');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Valida que el colaborador no se encuentre actualmente en el proyecto
    if ( project.collaborators.includes(user._id) ) {
        const error = new Error('El usuario ya se encuentra como colaborador del proyecto');
        return res.status( 404 ).json( { msg: error.message } );
    }

    project.collaborators.push(user._id);
    await project.save();
    res.json({ msg: 'Colaborador agregado correctamente' })

}

const deleteCollaborator = async ( req, res ) => {

    const project = await Project.findById( req.params.id );

    if ( !project ) {
        const error = new Error('Proyecto no encontrado');
        return res.status( 404 ).json( { msg: error.message } );
    }

    // Solamente el creador del rpoyecto puede agregar colaboradores
    if ( project.creator.toString() !== req.user._id.toString() ) {
        const error = new Error('Acción no válida');
        return res.status( 404 ).json( { msg: error.message } );
    }

    project.collaborators.pull(req.body.id);
    await project.save();
    res.json({ msg: 'Colaborador eliminado correctamente' });

}



export {
    getProjects,
    createProject,
    getProject,
    editProject,
    deleteProject,
    searchCollaborator,
    addCollaborator,
    deleteCollaborator,
}