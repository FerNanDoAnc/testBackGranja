import 'reflect-metadata';
import { createConnection, getRepository } from 'typeorm';
import express from 'express';
import cors from 'cors';
import * as helmet from 'helmet';
import routes from './routes';
 
import * as http from 'http';
import {SerialPort} from 'serialport';
import {ReadlineParser} from '@serialport/parser-readline';

import { Arduino } from './entity/Arduino'; 
import { Tarea } from './entity/Tareas';
import { descripTemperatura } from './entity/descripTemperatura';
import { descripArdTarea } from './entity/descripArdTarea';

const schedule = require('node-schedule');
const cron = require('node-cron');

const PORT = process.env.PORT || 3000;

createConnection()
  .then(async () => {
    // create express app
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

    //Conexion Arduino 
    const parser = new ReadlineParser(); 
    const mySerial = new SerialPort({ 
      path: 'COM5', baudRate: 9600 
    }); 

    // Si no se conecta a Arduino
    mySerial.on('error', (error)=> {
      console.log("error",error);
    });

    // Abrir conexion con Arduino
    mySerial.on('open', () =>{
      console.log('Arduino conectado al puerto: ', mySerial.path);
    }); 

    mySerial.pipe(parser);

    // Mostrar la data de Arduino
    let temperturaC;
    mySerial.on('data', (data)=>{
      // console.log(data.toString()); 

      let humTemp = data.toString().split("\r\n"); 

      if(humTemp.length==6){
        io.emit('arduino:temp', {
          value: humTemp.toString()
        });
        let tempc = humTemp.toString().split(',');
        temperturaC=tempc[1]; 
      }
      else if(humTemp.length==3){ 
        io.emit('arduino:comp', {
          value: humTemp.toString()
        });
        // console.log("-->",comp3.toString());
      }
    }); 

    // -------------------------------------------------------------------------------------------------------------------------
   
    // -------------------------------------------------------- SOCKET ---------------------------------------------------------
    io.on('connection', (socket)=> {
      // -------------------------------------------------------- Lanzar Tareas ---------------------------------------------------------
      let PrimeraTarea=[];
      let primerTipoTarea;
      let extractorOpcBD;
      
      let isRunning = false;
      const myDelay = (time)=> new Promise((resolve)=> setTimeout(resolve, time));

      const getTareaProgramada= async () => {
        const tareaRepository = getRepository(Tarea);
        const tarea = await tareaRepository.find();
        const ahora = Date.now();
        const hoyUnix = +new Date(ahora);
  
        const verFecha=tarea.filter((element)=>{
          if(element.estado==1){
            const dateUnix = +new Date(element.fecha);
            return dateUnix > hoyUnix;
          }
        });
  
        const fechaOrdenada = verFecha.sort((a, b)=>{return +new Date(a.fecha)-+new Date(b.fecha)});
        return fechaOrdenada[0];
        // const fechaFinal=new Date(fechaOrdenada[0].fecha);
        // console.log("FECHA FINAL",fechaFinal.toString());
        
      }

      const tarea=async ()=>{ 
        try {

          if(primerTipoTarea==0){
            console.log("Ejecutando tarea-encendido programada");  
            // const tareaObtenida = await getTareaProgramada();
            const fechaTarea = PrimeraTarea[0].comp_arduino; 
            const tareaReporsitory=getRepository(Arduino);
            let tareas;
            // ID componentes arduino
            let idComp1='1';
            let idComp2='2';
            let idComp3='3';
            let idComp4='4';
            // para editar
            let nombreOpcEdit='Encendido'
            let opcEdit=0;
            let encendidoEdit=true
  
            await fechaTarea.forEach(async(fechaTarea, index) => {
              
              // Enviar a arduino despues de * segundos
              setTimeout(async() => {
  
                try {
                  tareas = await tareaReporsitory.findOneOrFail(fechaTarea);
                  // id componentes
                  if(fechaTarea==idComp1){ 
                    opcEdit=1;
                    mySerial.write('1');
                  }else if(fechaTarea==idComp2){ 
                    opcEdit=3;
                    mySerial.write('3');
                  }else if(fechaTarea==idComp3){
                    opcEdit=5;
                    mySerial.write('5');
                  }else if(fechaTarea==idComp4){
                    opcEdit=7;
                    mySerial.write('7');
                  }
    
                  tareas.nombre_opc = nombreOpcEdit;
                  tareas.opc = opcEdit;
                  tareas.encendido = encendidoEdit;
    
                  await tareaReporsitory.save(tareas); 
    
                } catch (e) {
                  console.log(e);
                }
                
                // Enviar Lista al front
                setTimeout(() => {
                  ListArduinoSQL();
                }, 2000); 
              },index * 4000);
      
            });
          }
          else if(primerTipoTarea==1){
            console.log("Ejecutando tarea-apagado programada");
            // const tareaObtenida = await getTareaProgramada();
            const fechaTarea = PrimeraTarea[0].comp_arduino; 
            const tareaReporsitory=getRepository(Arduino);
            let tareas;
            // ID componentes arduino
            let idComp1='1';
            let idComp2='2';
            let idComp3='3';
            let idComp4='4';
            // para editar
            let nombreOpcEdit='Apagado'
            let opcEdit=0;
            let encendidoEdit=false
  
            await fechaTarea.forEach(async(fechaTarea, index) => {
              
              // Enviar a arduino despues de * segundos
              setTimeout(async() => {
  
                try {
                  tareas = await tareaReporsitory.findOneOrFail(fechaTarea);
                  // id componentes
                  if(fechaTarea==idComp1){ 
                    opcEdit=2;
                    mySerial.write('0');
                  }else if(fechaTarea==idComp2){ 
                    opcEdit=4;
                    mySerial.write('2');
                  }else if(fechaTarea==idComp3){
                    opcEdit=6;
                    mySerial.write('4');
                  }else if(fechaTarea==idComp4){
                    opcEdit=8;
                    mySerial.write('6');
                  }
    
                  tareas.nombre_opc = nombreOpcEdit;
                  tareas.opc = opcEdit;
                  tareas.encendido = encendidoEdit;
    
                  await tareaReporsitory.save(tareas); 
    
                } catch (e) {
                  console.log(e);
                }
                
                // Enviar Lista al front
                setTimeout(() => {
                  ListArduinoSQL();
                }, 2000); 
              },index * 4000);
      
            });
          }


        } catch (error) {
          console.log(error);
        }
      }
      const lanzarTarea=(momento, tarea)=>{  
        setTimeout(tarea, momento.getTime()-(new Date()).getTime());
      }
      const getFechaTarea= async () => {
        let fechaObtenida;
        let tipoTarea;
        try {
          const tareaObtenida = await getTareaProgramada();  
          fechaObtenida= tareaObtenida.fecha; 
          PrimeraTarea=[];
          PrimeraTarea.push(tareaObtenida);
          tipoTarea=tareaObtenida.tipo;
          primerTipoTarea=tipoTarea;
          
        } catch (error) {
          console.log(error);
        }
        console.log("Proxima tarea: ",new Date(fechaObtenida).toString());
        return lanzarTarea(new Date(fechaObtenida), tarea); 
      }
      getFechaTarea();

      // --------------------------------------------End Lanzar Tareas ------------------------------------------------ 
      // -------------------------------------------------------- ARDUINOS COMPONENT ---------------------------------------------------------
      const ListArduinoSQL= async () => {
        const arduinoRepository = getRepository(Arduino);
        const arduino = await arduinoRepository.find(); 
        io.emit('list-arduino', arduino); 

        extractorOpcBD=await arduino[3].opc;
      }
      ListArduinoSQL();

      const updateArduino= async (id:any) => {
        await myDelay(1500);  
        const arduino = await getRepository(Arduino).findOne(id); 
        console.log("enviando opc -->",arduino.opc);
        return mySerial.write(arduino.opc.toString());
      }

      const updateArduinoSQL= async () => {
        socket.on('update-arduino',async(data)=>{
          try {
            const { id } = data;
            const {estado, id_user, tipo, ...demas} =data;
            
            if(tipo==0){
              const arduino = await getRepository(Arduino).findOne(id); //Busco el usuario en la tabla por el ID recibido
              getRepository(Arduino).merge(arduino, demas);  // Hace un merge de los datos existentes con los que se reciben a través de body
              const results = await getRepository(Arduino).save(arduino);  // Almacena el cambio en la base de datos
              
              io.emit('update-arduino', results); // Envía el resultado al front 
              
              if(!isRunning){ 
                isRunning=true;
                io.emit('update-arduino', {isRunning} );
                await updateArduino(results.id); 
                isRunning=false;
              }else{
                console.log("Terminando la tarea anterior"); 
                io.emit('update-arduino', {isRunning} ); 
              } 
              io.emit('update-arduino', {isRunning} );
            }
            if(tipo==1){
              console.log("Tipo",tipo);
              const arduino = await getRepository(Arduino).findOne(id);
              getRepository(Arduino).merge(arduino, demas);
              const results = await getRepository(Arduino).save(arduino);
              console.log("results desardtarea",results.id_descripArdTarea, results.id, results.opc, results.nombre_opc, results.encendido);
              io.emit('update-arduino', results); // Envía el resultado al front 
              
              if(!isRunning){ 
                isRunning=true;
                io.emit('update-arduino', {isRunning} );
                await updateArduino(results.id); 
                isRunning=false;
              }else{
                console.log("Terminando la tarea anterior"); 
                io.emit('update-arduino', {isRunning} ); 
              } 
              io.emit('update-arduino', {isRunning} );

            }
            
          } catch (error) {
            console.log(error);
          }
        })
      }
      updateArduinoSQL();
      // ---------------------------------------------- End Arduino------------------------------------------------------------
      // ---------------------------------------------- Detalle Arduino Tareas-------------------------------------------------
      const ListDetArduinoTareaSQL= async () => {
        const detalleArduinoRepository = getRepository(descripArdTarea);
        const detalleArduino = await detalleArduinoRepository.find();
        io.emit('list-det-ard-tarea', detalleArduino);
      }
      ListDetArduinoTareaSQL();

      const updateDetArduinoTarea= async () => {
        socket.on('update-det-ard-tarea',async(data)=>{
          try {
            const { id } = data;
            const {estado, id_user, ...demas} =data;
            
            const detalleArduino = await getRepository(descripArdTarea).findOne(id); 
            getRepository(descripArdTarea).merge(detalleArduino, demas); 
            const results = await getRepository(descripArdTarea).save(detalleArduino); 
            
            if(results){
              ListDetArduinoTareaSQL();
            }

            io.emit('update-det-ard-tarea', results);

          } catch (error) {
            console.log(error);
          }
        });
      }
      updateDetArduinoTarea();

      const listarDetArdTreaPorArduino= async (id) => {

      }
      // ---------------------------------------------- End Detalle Arduino Tareas-------------------------------------------------
      // ---------------------------------------------- Tareas component------------------------------------------------------
      const ListTareasSQL= async () => {
        const tareaRepository = getRepository(Tarea);
        const tarea = await tareaRepository.find(); 
        // ordenar por indice
        const tareaOrdenada = tarea.sort((a, b)=>{return a.id-b.id});
        
        io.emit('list-tareas', tareaOrdenada); 
      }
      ListTareasSQL();

      const updateTarea= async () => {
        socket.on('update-tarea',async(data)=>{ 
          let tarea;  
          try {
            const { id } = data;
            const {estado, id_user, ...demas} =data;

            // Editar componentes
            const { comp_arduino } = data; 
            const arduinos=[]; 
            const arduinoRepository = getRepository(Arduino);
            for (const id_ard of comp_arduino) {
              const arduino=await arduinoRepository.findOneOrFail(id_ard); 
              arduinos.push(arduino);
            }
            
            tarea = await getRepository(Tarea).findOne(id); 

            const element = Object.assign({}, demas);
            const fechaSola=element['fecha'].split('T')[0];
            let horaSola=element['hora'].split(' ')[0];
            const amPm=element['hora'].split(' ')[1];
            let  ceroTe='';
            if(amPm=='AM'){;
              if(horaSola.split(':')[0]=='12'){
                horaSola='00'+':'+horaSola.split(':')[1];
              }
            }else{
              if(horaSola.split(':')[0]!='12'){
                horaSola=(parseInt(horaSola.split(':')[0])+12)+':'+horaSola.split(':')[1];
              }
            }
            if(horaSola.split(':')[0].length==1){
              ceroTe='T0'
            }else{
                ceroTe='T'
            }
            
            const fechaUnida=fechaSola+ceroTe+horaSola+':00.000Z'; 
            demas['fecha']=new Date(fechaUnida);
            demas['id_arduino']=arduinos;
            
            getRepository(Tarea).merge(tarea, demas);    
            const results = await getRepository(Tarea).save(tarea); 
            
            // ordenar por indice
            const tareaRepository = getRepository(Tarea);
            const tareas = await tareaRepository.find({relations: ["id_arduino","id_user"]});
            tareas.sort((a, b) => (a.indice > b.indice) ? 1 : -1); 

            io.emit('update-tarea', tareas);
            
            if(results){
              getFechaTarea();
            }
          } catch (error) {
            console.log(error);
          }
        });
      }
      updateTarea();

      socket.on('update-indice-tarea',async(data)=>{
        try {
          data.forEach(async(element) => {
            const { id } = element;
            const {estado, id_user, ...demas} =element;
            const tarea = await getRepository(Tarea).findOne(id);
            getRepository(Tarea).merge(tarea, demas); 
            const results = await getRepository(Tarea).save(tarea);
            // ordenar por indice
            const tareaRepository = getRepository(Tarea);
            const tareas = await tareaRepository.find({relations: ["id_arduino","id_user"]});
            tareas.sort((a, b) => (a.indice > b.indice) ? 1 : -1); 

            io.emit('update-indice-tarea', tareas);
          });
        } catch (error) {
          console.log(error)
        }
      })

      // --------------------------------------------------------------
      socket.on('listar-luego-de-crearlo-en-el-frontend',async(data)=>{  
        if(data){
          setTimeout(() => { 
            getFechaTarea(); 
          }, 2000);
        }
        io.emit('listar-luego-de-crearlo-en-el-frontend', data);
      }); 

      socket.on('listar-luego-delete-tarea',async(data)=>{
        if(data){
          setTimeout(() => { 
            ListTareasSQL(); 
          }, 1000);
        }
        io.emit('listar-luego-delete-tarea', data);
      });
      // -----------------------------------------End Tareas component------------------------------------------------

      // -----------------------------------------Extractor component------------------------------------------------
      let encenderTempc;
      // Obtener temperatura de la BD
      const getTempc= async () => {
        const tempcRepository = getRepository(descripTemperatura);
        const tempc = await tempcRepository.find();
        encenderTempc=tempc[0].encenderTempc;
        console.log('Despues de °C',encenderTempc);
      }
      getTempc();

      const updateTempc= () => {
        socket.on('update-tempc',async(data)=>{
          try { 
            const { id } = data;
            const {estado, id_arduino, ...demas} =data;  
            
            const tempc = await getRepository(descripTemperatura).findOne(id);  
            getRepository(descripTemperatura).merge(tempc, demas); 
            const results = await getRepository(descripTemperatura).save(tempc);
            
            if(results){
              getTempc();
            }
            io.emit('update-tempc', results);
          } catch (error) {
            console.log(error)
          }
        });
      }
      updateTempc();

      // Activar Ventilador si la temperatura es mayor a 18

      const encenderVentilador= async ()=>{
        await myDelay(1000);
        // Verificar si en la BD el extractor esta encendido
        if(extractorOpcBD==7){ 
          updateArduino(4);
        }
        if(extractorOpcBD==6){ 
          updateArduino(4);
        }

        setInterval(async () => {
          if(temperturaC!=undefined)
          // Verificar temperatura
          if(temperturaC>=encenderTempc){ 
            if(temperturaC>=encenderTempc&&extractorOpcBD==6){
              if(extractorOpcBD==6){
                console.log('Encendiendo ventilador');
                let data={id:4,opc:7,nombre_opc:'Encendido',encendido:true};
                try {
                  const { id } = data;
                  const { ...demas } = data;
                  const arduino = await getRepository(Arduino).findOne(id); //Busco el usuario en la tabla por el ID recibido
                  getRepository(Arduino).merge(arduino, demas);  // Hace un merge de los datos existentes con los que se reciben a través de body
                  const results = await getRepository(Arduino).save(arduino);  // Almacena el cambio en la base de datos
                  
                  io.emit('update-arduino', results); // Envía el resultado al front 
                  console.log('IF results',results.opc);

                  if(!isRunning){ 
                    isRunning=true;
                    io.emit('update-arduino', {isRunning} );
                    await updateArduino(results.id);
                    isRunning=false;
                  }else{
                    console.log("Terminando la tarea anterior"); 
                    io.emit('update-arduino', {isRunning} ); 
                  } 
                  io.emit('update-arduino', {isRunning} );
                  ListArduinoSQL();
                  
                } catch (error) {
                  console.log(error);
                }
              }
            }
          }else if(temperturaC<encenderTempc){
            if(temperturaC<encenderTempc&&extractorOpcBD==7){ 
              if(extractorOpcBD==7){
                console.log('Apagando ventilador');
                let data={id:4,opc:6,nombre_opc:'Apagado',encendido:false};
                try {
                  const { id } = data;
                  const { ...demas } = data;
                  const arduino = await getRepository(Arduino).findOne(id); //Busco el usuario en la tabla por el ID recibido
                  getRepository(Arduino).merge(arduino, demas);  // Hace un merge de los datos existentes con los que se reciben a través de body
                  const results = await getRepository(Arduino).save(arduino);  // Almacena el cambio en la base de datos
                  
                  io.emit('update-arduino', results); // Envía el resultado al front 
                  
                  if(!isRunning){ 
                    isRunning=true;
                    io.emit('update-arduino', {isRunning} );
                    await updateArduino(results.id);
                    isRunning=false;
                  }else{
                    console.log("Terminando la tarea anterior"); 
                    io.emit('update-arduino', {isRunning} ); 
                  }
                  io.emit('update-arduino', {isRunning} );
                  ListArduinoSQL();
                  
                } catch (error) {
                  console.log(error);
                }

              }
            } 
          }
        }, 2000);
      };
      encenderVentilador();

      // -----------------------------------------End Extractor component------------------------------------------------

    });

    // start express server
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(error => console.log(error));
