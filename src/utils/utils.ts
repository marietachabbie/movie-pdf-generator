import { Movie } from "../types/movie";

export const splitArrayIntoChunks = (movies: Movie[]): Array<Movie[]> => {
  const perChunk: number = 42;
  const result: Array<Movie[]> = movies.reduce((acc: Array<Movie[]>, curr: Movie, index: number) => {
    const chunkIndex: number = Math.floor(index / perChunk);

    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];
    }

    acc[chunkIndex].push(curr);

    return acc;
  }, [])

  return result;
};
