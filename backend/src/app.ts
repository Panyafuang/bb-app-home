import express from 'express';
import cors from 'cors';

import goldsRouter from './routes/golds.route';
import { errorHandler } from './middlewares/error-handler';


const app = express();

app.use(cors());
app.use(express.json());



// Register Routes
app.use('/api/v1/gold_records', goldsRouter);
app.get("/", (_req, res) => res.send("Server is running just fine!"));

app.use(errorHandler);

export default app;