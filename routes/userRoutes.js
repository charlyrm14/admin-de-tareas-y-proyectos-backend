import express from 'express';
import { 
    signup, 
    login, 
    confirmAccount,
    passwordReset,
    checkToken,
    newPassword,
    profile 
} from '../controllers/userController.js';
import checkAuth from '../middleware/checkAuth.js';


const router = express.Router();

// Autenticación, Registro y Confirmación de usuarios
router.post('/signup', signup); // Registra nuevo usuario
router.post('/login', login); // Login usuario
router.get('/confirm-account/:token', confirmAccount); // Confirmar cuenta
router.post('/password-reset', passwordReset); // Restablecer contraseña
router.route('/password-reset/:token')
        .get( checkToken ) // Comprobar token
        .post( newPassword ); // Nueva contraseña


router.get('/profile', checkAuth, profile);



export default router;