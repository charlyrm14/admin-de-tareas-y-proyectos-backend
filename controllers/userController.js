import User from '../models/User.js';
import generateId from '../helpers/generateId.js';
import generateJWT from '../helpers/generateJWT.js';
import { signUpEmail, passwordResetEmail } from '../helpers/email.js';


const signup = async ( req, res ) => {

    // Evitar usuario duplicado
    const { email }     = req.body;
    const userExists    = await User.findOne( { email } );

    if ( userExists ) {
        const error = new Error('Usuario ya registrado');
        return res.status( 400 ).json( { message: error.message } );
    }
    
    try {

        const user      = new User( req.body );
        user.token      = generateId();
        await user.save();

        // Email de confirmación de cuenta
        signUpEmail({
            name:   user.name,
            email:  user.email,
            token:  user.token
        });

        res.json( { message: 'Bienvenido, revisa tu correo electrónico para confirmar tu cuenta' } );
        
    } catch ( error ) {
        console.log( error );
    }
};

const login = async ( req, res ) => {
    const { email, password } = req.body;

    // Comprueba si usuario existe
    const user = await User.findOne( { email } );
    
    if ( !user ) { // Si usuario no existe
        const error = new Error('El usuario no existe');
        return res.status( 404 ).json( { message: error.message } );
    }

    // Comprueba si el usuario ya confirmo su cuenta
    if ( !user.confirmed ) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status( 404 ).json( { message: error.message } );
    }

    // Comprueba el password del usuario
    if ( await user.checkPassword( password ) ) {

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateJWT( user._id )
        });

    } else {
        const error = new Error('Datos Incorrectos');
        return res.status( 404 ).json( { message: error.message } );
    }
}

const confirmAccount = async ( req, res ) => {
    const { token }     = req.params;
    const confirmUser   = await User.findOne( { token } );
    
    if ( !confirmUser ) {
        const error = new Error('Token no válido');
        return res.status( 404 ).json( { message: error.message } );
    }

    try {
        
        confirmUser.confirmed   = true;
        confirmUser.token       = '';
        await confirmUser.save();

        res.json( { message: 'Usuario confirmado correctamente' } );

    } catch ( error ) {
        console.log( error );
    }
}

const passwordReset = async ( req, res ) => {
    const { email } = req.body;

    // Comprueba si usuario existe
    const user = await User.findOne( { email } );
    
    if ( !user ) { // Si usuario no existe
        const error = new Error('El usuario no existe');
        return res.status( 404 ).json( { message: error.message } );
    }

    try {
        
        user.token = generateId();
        await user.save();

        // Email de instrucciones para restablecer contraseña
        passwordResetEmail({
            name:   user.name,
            email:  user.email,
            token:  user.token,
        });

        res.json( { message: 'Hemos enviado un email con las instrucciones' } );

    } catch ( error ) {
        console.log( error );
    }

}

const checkToken = async ( req, res ) => {
    const { token }     = req.params;

    const validToken    = await User.findOne( { token } );

    if ( validToken ) {
        res.json( { message: 'Token válido y el usuario existe' } );
    } else {
        const error = new Error('Token no válido');
        return res.status( 404 ).json( { message: error.message } );
    }
}

const newPassword = async ( req, res ) => {

    const { token }     = req.params; // Desde URL
    const { password }  = req.body; // Desde Formulario

    const user    = await User.findOne( { token } );

    if ( user ) {
        user.password   = password;
        user.token      = '';
       
        try {
            await user.save();
            res.json( { message: 'Contraseña modificada con éxito' } );
        } catch ( error ) {
            console.log( error );
        }

    } else {
        const error = new Error('Token no válido');
        return res.status( 404 ).json( { message: error.message } );
    }
}

const profile = async ( req, res ) => {
    const { user } = req;
    res.json( user );
}

export {
    signup, 
    login,
    confirmAccount,
    passwordReset,
    checkToken,
    newPassword,
    profile
}
