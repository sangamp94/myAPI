// /api/enrich.js
import fs from "fs";
import fetch from "node-fetch";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const CLEAN_REGEX = new RegExp(
  [
    "\\(\\d{4}\\)", "\\b\\d{4}\\b",
    "480p","720p","1080p","2160p","4k","hdrip","webrip","bluray","dvdrip",
    "hindi","tamil","telugu","malayalam","kannada","marathi","bengali",
    "punjabi","gujarati","bhojpuri","urdu","odia",
    "dual audio","dubbed","uncut"
  ].join("|"),
  "gi"
);

function cleanMovieName(name) {
  return name.replace(CLEAN_REGEX, "")
             .replace(/[^a-zA-Z0-9\s:]/g, " ")
             .replace(/\s+/g, " ")
             .trim();
}

async function getTMDBData(movieName) {
  const cleanName = cleanMovieName(movieName);
  const query = encodeURIComponent(cleanName);
  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`;

  const res = await fetch(searchUrl);
  const data = await res.json();
  if (!data.results?.length) return null;

  const movie = data.results[0];
  return {
    tmdb_id: movie.id,
    title: movie.title,
    release_date: movie.release_date,
    overview: movie.overview,
    rating: movie.vote_average,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null
  };
}

export default async function handler(req, res) {
  try {
    const movies = JSON.parse(fs.readFileSync("movie.json", "utf-8"));
    for (let i = 0; i < movies.length; i++) {
      const tmdbData = await getTMDBData(movies[i].name);
      if (tmdbData) movies[i] = { ...movies[i], ...tmdbData };
    }
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
