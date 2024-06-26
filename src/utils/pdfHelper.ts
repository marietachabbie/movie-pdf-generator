import { Response } from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

import { Movie } from "../types/movie";
import { splitArrayIntoChunks } from "./utils";

const PDF_CONFIG = {
  size: "A4",
  margin: 50,
  fontSize: {
    header: 16,
    row: 12,
    info: 12,
  },
  font: {
    bold: "Courier-Bold",
    regular: "Courier",
  },
  tableHeader: {
    x: 45,
    y: 70,
  },
};

const drawHeadersOfTable = (doc: PDFKit.PDFDocument) => {
  /* headers */
  doc
    .fontSize(PDF_CONFIG.fontSize.header)
    .font(PDF_CONFIG.font.bold)
    .text("Title", {
      continued: true,
      align: "left",
    })
    .text("Date Rating", {
      align: "right",
      wordSpacing: 20,
    })
    .moveDown(0.5);
  
  /* line under headers */
  doc
    .moveTo(PDF_CONFIG.tableHeader.x, PDF_CONFIG.tableHeader.y)
    .lineTo(570, 70)
    .stroke()
    .moveDown(0.5);
}

const drawSingleRow = (doc: PDFKit.PDFDocument, movie: Movie) => {
  doc
    .moveDown(0.3)
    .fontSize(PDF_CONFIG.fontSize.row)
    .font(PDF_CONFIG.font.regular)
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
    .fontSize(PDF_CONFIG.fontSize.info)
    .font(PDF_CONFIG.font.regular)
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
  /* split the array into groups to distribute in PDF by pages */
  const paginatedMovies: Array<Movie[]> = splitArrayIntoChunks(movies);

  /* create PDF document */
  const doc: PDFKit.PDFDocument = new PDFDocument({ size: PDF_CONFIG.size, margin: PDF_CONFIG.margin });
  doc.pipe(writeStream);

  /* draw a table per page */
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
  /* create PDF document */
  const doc = new PDFDocument();
  doc.pipe(writeStream);

  /* draw movie info and poster if present*/
  drawMovieInfo(doc, movie);

  if (movie.poster_image) {
    drawMoviePoster(doc, movie.poster_image);
  }

  doc.end();
};

export const createPDFAndSendResponse = (res: Response, filename: string) => {
  /* create readable stream to show to the user */
  const readStream: fs.ReadStream = fs.createReadStream(filename);
  const filenameForDownload: string = encodeURIComponent(path.basename(filename));

  /* set headers */
  res.setHeader("Content-disposition", `inline; filename="${filenameForDownload}"`);
  res.setHeader("Content-type", "application/pdf");

  /* display PDF */
  readStream.pipe(res);
}
