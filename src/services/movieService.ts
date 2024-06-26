import axios, { AxiosResponse } from "axios";
import fs from "fs";
import request from "request";
import path from "path";

import { Movie, MoviesResponse } from "../types/movie";

const PUBLIC_DIR: string = path.resolve(__dirname, "..", "public", "image");
const TMDB_URL: string = process.env.TMDB_URL!;
const TMDB_POSTER_URL: string = process.env.TMDB_POSTER_URL!;
const TMDB_ACCESS_TOKEN: string = process.env.TMDB_ACCESS_TOKEN!;

/* TMDB API has rate limit of 40 requests per sec,
hence the page size is made optional */
const REQUIRED_PAGES: number = parseInt(process.env.REQUIRED_PAGES ?? "10");

const CONFIG: object = {
  headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` }
}

const downloadImage = async (url: string, filename: string): Promise<void> => {
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
        .on("error", reject);
    });
  })
}

const fetchAllMoviesPageCount = async (): Promise<number> => {
  const response: AxiosResponse<MoviesResponse> = await axios.get(`${TMDB_URL}/popular`, CONFIG);
  console.log(`Totally ${response.data.total_pages} pages of data is available on TMDB API.`);
  return response.data.total_pages;
}

const fetchAllMovies = async (page: number): Promise<Movie[]> => {
  const response: AxiosResponse<MoviesResponse> = await axios.get(`${TMDB_URL}/popular?page=${page}`, CONFIG);
  console.log(`Page ${page}: retrieved ${response.data.results.length} movies.`);
  return response.data.results;
}

const fetchSingleMovie = async (movieId: string): Promise<{ movie: Movie, posterPath: string | undefined }> => {
  const response: AxiosResponse<Movie> = await axios.get(`${TMDB_URL}/${movieId}`, CONFIG);
  const movie: Movie = (({ id, title, release_date, vote_average }) => ({ id, title, release_date, vote_average }))(response.data);
  const posterPath: string | undefined = response.data.poster_path;
  console.log(`Retrieved data for movie with id '${movie.id}'.`);
  return { movie, posterPath };
}

const storeImageAndGetLocalPath = async (path: string, movieId: string): Promise<string> => {
  try {
    const url = `${TMDB_POSTER_URL}${path}`;
    const filename = `${PUBLIC_DIR}/${movieId}.jpg`;
    await downloadImage(url, filename);
    return filename;
  } catch (err) {
    console.error("Error accurred while downloading poster image:", err);
    throw err;
  }
}

const getAllMovies = async (): Promise<Movie[]> => {
  try {
    /* fetch movies from TMDB API, get only page count */
    const totalPages = await fetchAllMoviesPageCount();
    const moviesDataToShow: Movie[] = [];

    /* fetch and return movies from TMDB API page by page */
    let currPage = 1;
    while (currPage <= REQUIRED_PAGES && currPage <= totalPages) {
      const popularMovies: Movie[] = await fetchAllMovies(currPage++);
      popularMovies.forEach(
        /* pick only desired keys from response */
        movie => {
          moviesDataToShow.push((
            ({ id, title, release_date, vote_average }) =>
              ({ id, title, release_date, vote_average }))(movie));
        }
      );
    }

    return moviesDataToShow;
  } catch (err) {
    console.error("Error accurred while retrieving all popular movies:", err);
    throw err;
  }
}

const getMovieById = async (movieId: string): Promise<Movie> => {
  try {
    /* fetch single movie from TMDB API */
    const { movie, posterPath } = await fetchSingleMovie(movieId);

    if (posterPath) {
      /* download poster image, store its local path */
      const imageLocalPath: string = await storeImageAndGetLocalPath(posterPath, movieId);
      if (imageLocalPath) {
        movie.poster_image = imageLocalPath;
      }
    }

    return movie;
  } catch (err) {
    console.error(`Error accurred while retrieving data for movie '${movieId}':`, err);
    throw err;
  }
}

export const movieService = {
  getAll: getAllMovies,
  getOne: getMovieById,
};
