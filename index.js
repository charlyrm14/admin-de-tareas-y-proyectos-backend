import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
app.use( express.json() );


dotenv.config();

connectDB();

// Configuración CORS
const whiteList = [
    process.env.FRONTEND_URL
];

const corsOptions = {
    origin: function ( origin, callback ) {
        // Si origin ( Origen de la petición ) esta dentro de whiteList permite el acceso a la API
        if ( whiteList.includes( origin ) ) {
            callback( null, true );
        } else {
            callback( new Error('Error de Cors') );
        }
    } 
}

app.use( cors( corsOptions ) );

// Routing
app.use('/api/users', userRoutes );
app.use('/api/projects', projectRoutes );
app.use('/api/tasks', taskRoutes );



const PORT = process.env.PORT || 4000;


const server = app.listen( PORT , () => {
    console.log(`Servidor corriendo en puerto ${ PORT }`);
});

// Socket.io
import { Server } from 'socket.io';

const io = new Server( server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
} );

io.on('connection', ( socket ) => {
    console.log('Conectado a socket.io');

    // Eventos
    socket.on('open project', ( project ) => {
        socket.join( project );
    });

    socket.on('new task', task => {
        const project = task.project;
        socket.to( project ).emit('added task', task);
    });

    socket.on('delete task', task => {
        const project = task.project;
        socket.to( project ).emit('deleted task', task);
    })

    socket.on('update task', task => {
        const project = task.project._id;
        socket.to( project ).emit('updated task', task);
    })

    socket.on('change status', task => {
        const project = task.project._id;
        socket.to( project ).emit('new status', task);
    })
})