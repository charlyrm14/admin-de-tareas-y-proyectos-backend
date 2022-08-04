import nodemailer from 'nodemailer';

export async function signUpEmail ( dataUser ) {
    const { name, email, token } = dataUser;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // Información Email
    const info = await transport.sendMail({
        from:       ' "TaskManager" <support@taskmanager.com> ',
        to:         email,
        subject:    'TaskManager - Confirma tu cuenta',
        text:       'Confirma tu cuenta en TaskManager',
        html:       `<p> ¡ Hola, ${ name } ! </p>
                    <p> Confirma tu cuenta </p>
                    <p> Tu cuenta ya esta casi lista, solo debes confirmarla a través del siguiente enlace: </p>
                    <a href="${ process.env.FRONTEND_URL }/confirm-account/${ token }"> Confirmar cuenta </a>
                    <p> Si no reconoces esta acción, puedes ignorar este mensaje </p>
        `       
    });
}

export async function passwordResetEmail ( dataUser ) {
    const { name, email, token } = dataUser;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // Información Email
    const info = await transport.sendMail({
        from:       ' "TaskManager" <support@taskmanager.com> ',
        to:         email,
        subject:    'TaskManager - Restablece tu contraseña',
        text:       'Restablece tu contraseña en TaskManager',
        html:       `<p> ¡ Hola, ${ name } ! </p>
                    <p> Haz solicitado restablecer tu contraseña </p>
                    <p> Da click en el siguiente enlace para generar una nueva contraseña: </p>
                    <a href="${ process.env.FRONTEND_URL }/password-reset/${ token }"> Restablecer contraseña </a>
                    <p> Si no reconoces esta acción, puedes ignorar este mensaje </p>
        `       
    });
}