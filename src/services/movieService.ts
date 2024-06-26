import axios, { AxiosResponse } from "axios";
import fs from "fs";
import request from "request";
import path from "path";

import { Movie, MoviesResponse } from "../types/movie";

const PARENT_DIR: string = path.resolve(__dirname, "..");
const TMDB_URL: string = process.env.TMDB_URL!;
const TMDB_POSTER_URL: string = process.env.TMDB_POSTER_URL!;
const TMDB_ACCESS_TOKEN: string = process.env.TMDB_ACCESS_TOKEN!;

/* TMDB API has rate limit of 40 requests per sec,
hence the page size is made optional */
const REQUIRED_PAGES: number = parseInt(process.env.TOTAL_PAGES ?? "10");

const config: object = {
  headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` }
}

const movieService = {
  getAll: async (): Promise<Movie[]> => {
    const response: AxiosResponse<MoviesResponse> = await axios.get(`${TMDB_URL}/popular`, config);
    const totalPages = response.data.total_pages;

    const moviesDataToShow: Movie[] = [];
    let currPage = 1;
    while (currPage <= REQUIRED_PAGES && currPage <= totalPages) {
      const response: AxiosResponse<MoviesResponse> = await axios.get(`${TMDB_URL}/popular?page=${currPage++}`, config);
      const popularMovies = response.data.results;
      popularMovies.forEach(
        movie => {
          const { id, title, release_date, vote_average } = movie;
          moviesDataToShow.push({ id, title, release_date, vote_average });
        }
      );
    }

    return moviesDataToShow;
  },

  getOne: async (movieId: string): Promise<Movie> => {
    const response: AxiosResponse<Movie> = await axios.get(`${TMDB_URL}/${movieId}`, config);
    const { id, title, release_date, vote_average, poster_path } = response.data;
    const movie: Movie = { id, title, release_date, vote_average };

    if (poster_path) {
      const imageLocalPath: string | undefined = await movieService.storeImageAndGetLocalPath(poster_path, id);
      if (imageLocalPath) {
        movie.poster_image = imageLocalPath;
      }
    }

    return movie;
  },

  downloadImage: async (url: string, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      request.head(url, (err: Error) => {
        if (err) {
          return reject(err);
        }

        request(url)
          .pipe(fs.createWriteStream(filename))
          .on("close", () => {
            console.log("Succesfully downloaded image", filename);
            resolve();
          })
          .on("error", err => {
            reject(err);
          });
      });
    })
  },

  storeImageAndGetLocalPath: async (path: string, movieId: number): Promise<string | undefined> => {
    try {
      const url = `${TMDB_POSTER_URL}${path}`;
      const filename = `${PARENT_DIR}/public/image/${movieId}.jpg`;
      await movieService.downloadImage(url, filename);
      return filename;
    } catch (err) {
      console.error(EvalError)
    }
  }
}

export { movieService };
