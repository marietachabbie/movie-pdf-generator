import { Router, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

import { Movie } from "../types/movie";
import { generatePDFForAll, generatePDFForOne, createPDFAndSendResponse } from "../utils/pdfHelper";
import { movieService } from "../services/movieService";

const moviesRouter = Router();
const PUBLIC_DIR = path.resolve(__dirname, "..", "public", "pdf");

moviesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    /* fetch movies from TMDB API */
    const movies: Movie[] = await movieService.getAll();

    /* generate PDF file */
    const moviesPDFFilename: string = path.join(PUBLIC_DIR, "TMDB_Popular_Movies.pdf");
    const writeStream: fs.WriteStream = fs.createWriteStream(moviesPDFFilename);
    generatePDFForAll(writeStream, movies);

    /* save and display PDF file */
    writeStream.on("finish", () => {
      console.log("Saved PDF file:", moviesPDFFilename);
      createPDFAndSendResponse(res, moviesPDFFilename);
    });

    /* handle errors */
    writeStream.on("error", (err) => {
      console.error("Error accurred while writing PDF file:", err);
      next(err);
    });

  } catch (err) {
    next(err);
  }
})

moviesRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    /* fetch movie by ID from TMDB API */
    const movie: Movie = await movieService.getOne(req.params.id);

    /* generate PDF file */
    const moviePDFFilename: string = path.join(PUBLIC_DIR, `${movie.title.replaceAll(" ", "_")}.pdf`);
    const writeStream: fs.WriteStream = fs.createWriteStream(moviePDFFilename);
    generatePDFForOne(writeStream, movie);

    /* save and display PDF file */
    writeStream.on("finish", () => {
      console.log("Saved PDF file:", moviePDFFilename);
      createPDFAndSendResponse(res, moviePDFFilename);
    });

    /* handle errors */
    writeStream.on("error", (err) => {
      console.error("Error accurred while writing PDF file:", err);
      next(err);
    });
  
  } catch (err) {
    next(err);
  }
})

export { moviesRouter };
