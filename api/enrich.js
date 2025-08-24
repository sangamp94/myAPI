import fs from "fs";
import fetch from "node-fetch";

const API_KEY = "17a72da2e7a36a11f6e658b6c3b07a84";

// Load your input list
const inputMovies = JSON.parse(fs.readFileSync("movie.json", "utf-8"));

// Load TMDB dump
const dump = fs.readFileSync("movie_ids_08_23_2025.json", "utf-8")
  .split("\n")
  .filter(Boolean)
  .map(line => JSON.parse(line));

// Build a quick lookup map
const tmdbMap = new Map(
  dump.map(m => [m.original_title.toLowerCase(), m.id])
);

// Helper: fetch details from TMDB API
async function getMovieDetails(id) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) return null;
  return res.json();
}

(async () => {
  const enriched = [];
  for (let movie of inputMovies) {
    const id = tmdbMap.get(movie.name.toLowerCase());
    if (id) {
      const details = await getMovieDetails(id);
      if (details) {
        enriched.push({
          ...movie,
          tmdb_id: id,
          title: details.title,
          overview: details.overview,
          release_date: details.release_date,
          genres: details.genres.map(g => g.name),
          poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
          runtime: details.runtime,
          vote_average: details.vote_average,
        });
      }
    } else {
      enriched.push(movie); // keep original if not matched
    }
  }

  fs.writeFileSync("output.json", JSON.stringify(enriched, null, 2));
  console.log("✅ Done! Created output.json");
})();
