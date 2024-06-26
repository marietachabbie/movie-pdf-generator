import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { moviesRouter } from "./routes/movies";
import { ErrorHandler } from "./middlewares/ErrorHandler";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/movies", moviesRouter);
app.use(ErrorHandler);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
