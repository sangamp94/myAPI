// enrich-movies-json.js
import fs from "fs";
import fetch from "node-fetch";

const TMDB_API_KEY = "17a72da2e7a36a11f6e658b6c3b07a84"; // your TMDB key
const INPUT_FILE = "movie.json";   // input file
const OUTPUT_FILE = "movies_enriched.json";   // output file

// remove junk tags + year
const CLEAN_REGEX = new RegExp(
  [
    "\\(\\d{4}\\)",     // (2018)
    "\\b\\d{4}\\b",     // 2018
    "480p", "720p", "1080p", "2160p", "4k", "hdrip", "webrip", "bluray", "dvdrip",
    "hindi", "tamil", "telugu", "malayalam", "kannada", "marathi", "bengali",
    "punjabi", "gujarati", "bhojpuri", "urdu", "odia",
    "dual audio", "dubbed", "uncut"
  ].join("|"),
  "gi"
);

function cleanMovieName(name) {
  return name
    .replace(CLEAN_REGEX, "") // remove year + tags
    .replace(/[^a-zA-Z0-9\s:]/g, " ") // remove symbols
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim();
}

async function getTMDBData(movieName) {
  try {
    const cleanName = cleanMovieName(movieName);
    const query = encodeURIComponent(cleanName);
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`;

    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!data.results || data.results.length === 0) return null;
    const movie = data.results[0];

    return {
      tmdb_id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      overview: movie.overview,
      rating: movie.vote_average,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null
    };
  } catch (err) {
    console.error("TMDB fetch error:", err);
    return null;
  }
}

async function enrichMovies() {
  const rawData = fs.readFileSync(INPUT_FILE, "utf-8");
  const movies = JSON.parse(rawData);

  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    console.log(`🔎 Searching TMDB for: ${m.name}`);
    const tmdbData = await getTMDBData(m.name);
    if (tmdbData) {
      movies[i] = { ...m, ...tmdbData };
    } else {
      console.log(`⚠️ No TMDB match found for: ${m.name}`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
  console.log(`✅ Enriched movies saved to ${OUTPUT_FILE}`);
}

enrichMovies();
