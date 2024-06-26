export interface Movie {
  id: number;
  title: string,
  release_date: Date,
  vote_average: number,
  poster_path?: string,
  poster_image?: string,
}

export interface MoviesResponse {
  page: number,
  results: Movie[];
  total_pages: number,
  total_results: number,
}
