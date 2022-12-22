import 'reflect-metadata'; 
import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import routes from '../routes';
import * as http from 'http';

import { createConnection, getRepository } from 'typeorm';
import { Arduino } from '../entity/Arduino';
import {ReadlineParser} from '@serialport/parser-readline';
import { SerialPort } from 'serialport';


const app = express();
// Middlewares
app.use(cors());
app.use(helmet());

// app.use(express.json());
app.use(express.json() as express.RequestHandler);
// Routes
app.use('/', routes);

// Socket io
const server = http.createServer(app);
const io = require('socket.io')(server);

export class SArduino{
    static getArduino(data){
        console.log(data.toString());
        io.emit('arduino:data', {
            value: data.toString()
        }); 
    }
}

export default SArduino;