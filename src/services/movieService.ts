import axios, { AxiosResponse } from "axios";

import { Movie, MoviesResponse } from "../types/movie";

const TMDB_URL : string = process.env.TMDB_URL!;
const TMDB_POSTER_URL : string = process.env.TMDB_POSTER_URL!;
const TMDB_ACCESS_TOKEN : string = process.env.TMDB_ACCESS_TOKEN!;

const config : object = {
    headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` }
}

const movieService = {
    getAll: async (): Promise<Movie[]> => {
        const response : AxiosResponse<MoviesResponse> = await axios.get(`${TMDB_URL}/popular`, config);
        const popularMovies = response.data;
        const moviesDataToShow : Movie[] = popularMovies.results.map(
            movie => {
                const { id, title, release_date, vote_average } = movie;
                return { id, title, release_date, vote_average };
            }
        );

        return moviesDataToShow;
    },

    getOne: async (movieId : string): Promise<Movie> => {
        const response : AxiosResponse<Movie> = await axios.get(`${TMDB_URL}/${movieId}`, config);
        const { id, title, release_date, vote_average, poster_path } = response.data;
        const movie : Movie = { id, title, release_date, vote_average }
        movie.poster_image = `${TMDB_POSTER_URL}/${poster_path}`;

        return movie;
    }
}

export { movieService };
