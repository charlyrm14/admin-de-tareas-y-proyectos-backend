import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const checkAuth = async ( req, res, next ) => {
    let token;

    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const tokenDecoded = jwt.verify( token, process.env.JWT_SECRET);
            req.user = await User.findById( tokenDecoded.id ).select("-password -confirmed -token -createdAt -updatedAt -__v");
            
            return next();
        } catch ( error ) {
            return res.status(404).json( { message: 'Hubo un error' } );
        }
    }

    if ( !token ) { // Si no existe token
        const error = new Error('Token no válido');
        return res.status( 401 ).json( { message: error.message } );
    }

    next();
}

export default checkAuth;