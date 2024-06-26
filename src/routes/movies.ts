import { Router, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

import { Movie } from "../types/movie";
import { generatePDFForAll, generatePDFForOne } from "../utils/pdfHelper";
import { movieService } from "../services/movieService";

const moviesRouter = Router();
const PARENT_DIR = path.resolve(__dirname, "..");

moviesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movies: Movie[] = await movieService.getAll();

    const moviesPDFFilename: string = `${PARENT_DIR}/public/pdf/TMDB_Popular_Movies.pdf`;
    const writeStream: fs.WriteStream = fs.createWriteStream(moviesPDFFilename);

    generatePDFForAll(writeStream, movies);

    writeStream.on("finish", () => {
      const readStream: fs.ReadStream = fs.createReadStream(moviesPDFFilename);
      const filenameForDownload: string = encodeURIComponent(moviesPDFFilename);

      res.setHeader("Content-disposition", `inline; filename="${filenameForDownload}"`);
      res.setHeader("Content-type", "application/pdf");

      readStream.pipe(res);
    });
  } catch (err) {
    next(err);
  }
})

moviesRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movie: Movie = await movieService.getOne(req.params.id);

    const moviePDFFilename: string = `${PARENT_DIR}/public/pdf/${movie.title.replace(" ", "_")}.pdf`;
    const writeStream: fs.WriteStream = fs.createWriteStream(moviePDFFilename);
    generatePDFForOne(writeStream, movie);

    writeStream.on("finish", () => {
      const stream: fs.ReadStream = fs.createReadStream(moviePDFFilename);
      const filenameForDownload: string = encodeURIComponent(moviePDFFilename);

      res.setHeader("Content-disposition", `inline; filename="${filenameForDownload}"`);
      res.setHeader("Content-type", "application/pdf");

      stream.pipe(res);
    });
  } catch (err) {
    next(err);
  }
})

export { moviesRouter };
