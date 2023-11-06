import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { appDataSource } from './appDataSource';

const app = express();
const PORT = 9191;
const API_ROUTE = require('./api.router');
const RSS = require('rss');

app.use(cors());

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

appDataSource.initialize()
    .then(() => console.log("Database Connection Successfully"))
    .catch((err) => console.log("Error while connecting to database > ", err))


app.use('/', API_ROUTE);

// 404 error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
    next({
        message: "Page not found",
        status: 404
    })
})

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    const feed = new RSS({
        title: 'Error',
        description: err.message,
        custom_elements: [
            { status: err.status || 400 },
        ]
    });
    const xml = feed.xml({ indent: true });
    res.set('Content-Type', 'text/xml');
    res.send(xml);
})

app.listen(PORT, () => {
    console.log("Server is listening at PORT ", PORT);
})