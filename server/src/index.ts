import express from "express"
import path from 'path'
import morgan from 'morgan'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import sslRedirect from 'heroku-ssl-redirect'
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers'

import { connectToMongoDb } from "./database/databaseSetup"
import router from "./routes/api"
import { deleteData, importData } from './services/importService'

dotenv.config()

const argv = yargs(hideBin(process.argv)).options({
    import: { type: 'boolean', default: false, description: 'Run an import when starting the server' },
    deletion: { type: 'boolean', default: false, description: 'Run data deletion when starting the server' },
    year: { type: 'number', description: 'Specify from which year data should be imported - 2019 or 2020' },
    data: { type: 'array', description: 'Specify data to be included - ownerships, companies and/or shareholders' }
}).parseSync()

console.log(argv)

const app = express()

app.use(sslRedirect())

app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: "50mb"
    })
)
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.raw())

app.use(morgan("tiny"))

app.use("/api", router)

app.use(express.static(path.join(__dirname, '../../client/build')))

connectToMongoDb().then(_ => {
    app.listen({ port: process.env.PORT || 4000 }, () => console.log(`The server is now running on port ${process.env.PORT || 4000}`))

    if (argv.import) importData(argv.year, argv.data)
    if (argv.deletion) deleteData(argv.year, argv.data)

})

app.use('/*', express.static(path.join(__dirname, '../../client/build', 'index.html')))