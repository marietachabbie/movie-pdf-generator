import { Router, Request, Response } from "express";
import { movieService } from "../services/movieService";

const moviesRouter = Router();

moviesRouter.get("/", async (req: Request, res: Response) => {
    const movies = await movieService.getAll();
    res.send(movies);
})

moviesRouter.get("/:id", async (req: Request, res: Response) => {
    const movie = await movieService.getOne(req.params.id);
    res.send(movie);
})

export { moviesRouter };
