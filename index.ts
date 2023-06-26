import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'
import routes from 'routes'
import { connectDatabase } from 'models'
import { ExpressExtends } from 'Types/interfaces'
import configMiddlewares from 'middlewares'
import './crons/runner'
import fetch from 'cross-fetch' // used by alby-tools for lightening payment purposes
global.fetch = fetch

dotenv.config()

// db initializtaion
mongoose.set('strictQuery', false)
connectDatabase() // pull the crons runner, [IMPORTANT]: only pull crons after db initilization

const app: ExpressExtends = express()

app.use(
  cors({
    origin: '*'
  })
)

const port = process.env.PORT

// app.use(express.json({ limit: '50mb' }))
// app.use(express.urlencoded({ extended: true, limit: '50mb' }))
// // app.use(helmet()) // for some out of the box security
// app.use(customResponse)

configMiddlewares(app)

app.use('/api/', routes)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

const publicPath = path.resolve(`${__dirname}/../public`)
app.use(express.static(publicPath))

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

io.on('connection', (socket: any) => {
  console.log('Client Connected > ', socket.id)

  socket.on('joinRoom', (room: string) => {
    console.log('joinRoom > ', room)
    socket.join(room)
  })

  socket.on('leaveRoom', (room: string) => {
    console.log('leaveRoom > ', room)
    socket.leave(room)
  })

  socket.on('disconnect', () => {
    console.log('Client Disconnected > ', socket.id)
  })
})

server.listen(port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${port}`
  )
})

const socketIoObject = io
export { socketIoObject }
