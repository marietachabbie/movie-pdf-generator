# Movie PDF Generator

`Node.js` app written in `Typescript` to get movies from TMDB API and generate PDF files based on received data.

### Supported endpoints:
* GET `{baseUrl}/movies` (gets all popular movies from TMDB)
* GET `{baseUrl}/movies/:id` (gets the specific movie from TMDB, also displays its poster)

## To install the dependencies:
```sh
npm i
```

## To run in dev mode with live compilation (uses nodemon to refresh on edit):
```sh
npm run dev
```

## To run in prod with live compilation:
```sh
npm run prod
```

## To compile and run compiled code:
```sh
npm run build && npm run start
```
___
A sample of the `.env` file is provided to fill with optional values.
