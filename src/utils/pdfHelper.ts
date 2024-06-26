import PDFDocument from "pdfkit";
import fs from "fs";

import { Movie } from "../types/movie";
import { splitArrayIntoChunks } from "./utils";

const drawHeadersOfTable = (doc: PDFKit.PDFDocument) => {
  // headers
  doc
    .fontSize(16)
    .font("Courier-Bold")
    .text("Title", {
      continued: true,
      align: "left",
    })
    .text("Date Rating", {
      align: "right",
      wordSpacing: 20,
    })
    .moveDown(0.5);
  
  // line under headers
  doc
    .moveTo(45, 70)
    .lineTo(570, 70)
    .stroke()
    .moveDown(0.5);
}

const drawSingleRow = (doc: PDFKit.PDFDocument, movie: Movie) => {
  doc
    .moveDown(0.3)
    .fontSize(12)
    .font("Courier")
    .text(movie.title, {
      link: `/movies/${movie.id}`,
      continued: true,
      align: "left",
    })
    .text(`${movie.release_date} ${movie.vote_average.toFixed(3)}`, {
      link: null,
      align: "right",
      wordSpacing: 20,
    })
}

const drawMovieInfo = (doc: PDFKit.PDFDocument, movie: Movie) => {
  doc
    .fontSize(12)
    .font("Courier")
    .text(`Title: ${movie.title}`)
    .moveDown(0.5)
    .text(`Date: ${movie.release_date}`)
    .moveDown(0.5)
    .text(`Rating: ${movie.vote_average.toFixed(3)}`)
    .moveDown(1);
}

const drawMoviePoster = (doc: PDFKit.PDFDocument, posterImage: string) => {
  doc.image(posterImage, {
    width: 300,
  });
}

export const generatePDFForAll = (writeStream: fs.WriteStream, movies: Movie[]) => {
  const paginatedMovies: Array<Movie[]> = splitArrayIntoChunks(movies);

  const doc: PDFKit.PDFDocument = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(writeStream);

  paginatedMovies.forEach((groupOfMovies, index) => {
    if (index > 0) {
      doc.addPage()
    }

    drawHeadersOfTable(doc);

    groupOfMovies.forEach(movie => {
      drawSingleRow(doc, movie);
    });
  });

  doc.end();
};

export const generatePDFForOne = (writeStream: fs.WriteStream, movie: Movie) => {
  const doc = new PDFDocument();
  doc.pipe(writeStream);

  drawMovieInfo(doc, movie);

  if (movie.poster_image) {
    drawMoviePoster(doc, movie.poster_image);
  }

  doc.end();
};
