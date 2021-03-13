import dotenv from "dotenv";
import db from "./database";
import api from "./services/api";

dotenv.config();

const MIN_TRACKS = 5;
const MIN_POINTS = 3;
const REDUCE_FACTOR = 0.0075;
const MIN_LISTENERS = 0.8;
const MIN_PLAYCOUNT = 0.75;
const MIN_PLAYCOUNT_BY_LISTENER = 2;
const PLAYCOUNT_BY_LISTENER = 2.5;

function sleep(sec) {
  console.log("Waiting...");
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

async function fetchArtists() {
  console.log("Searching for artists");
  let artistList = [];
  let currentPage = 0;
  let totalPages = null;
  let mustContinue = true;

  do {
    currentPage++;
    console.log("Querying the page", currentPage);
    const { artists, meta } = await api.getArtistsOnLastFm(currentPage);

    artistList = artistList.concat(artists);
    currentPage = parseInt(meta.page);
    totalPages = parseInt(meta.totalPages);
    mustContinue = parseInt(artists[artists.length - 1].playcount) > 1;

    await sleep(2);
  } while (mustContinue && currentPage < totalPages);

  return artistList;
}

function saveArtistsOnDatabase(artists) {
  artists.forEach((a) => {
    if (parseInt(a.playcount) <= 1) return;

    const data = {
      name: a.name,
      mbid: a.mbid ? a.mbid : null,
      playcount: parseInt(a.playcount),
    };

    db.artists.find(data, (_, artists) => {
      if (artists.length === 0) {
        db.artists.insert(data);
      }
    });
  });
}

function calculateAverageStats(stats, track) {
  const trackPlaycount = parseInt(track.playcount);
  const trackListeners = parseInt(track.listeners);

  if (stats.counted === 0) {
    stats.playcount = trackPlaycount;
    stats.listeners = trackListeners;
  }

  stats.playcount = Math.trunc((stats.playcount + trackPlaycount) / 2);
  stats.listeners = Math.trunc((stats.listeners + trackListeners) / 2);
  stats.counted++;

  return stats;
}

function calculateTrackPoints(track, stats) {
  const minListeners = MIN_LISTENERS + stats.counted * REDUCE_FACTOR;
  const minPlaycount = MIN_PLAYCOUNT + stats.counted * REDUCE_FACTOR;

  // Porcentagem de ouvintes da faixa atual em relação às médias anteriores
  const avgListeners = track.listeners / stats.listeners;
  // Porcentagem de reproduções da faixa atual em relação às médias anteriores
  const avgPlaycount = track.playcount / stats.playcount;
  // Média de reproduções por ouvinte
  const playcountByListener = track.playcount / track.listeners;

  let points = 0;

  if (avgListeners >= minListeners) points++;
  if (avgPlaycount >= minPlaycount) points++;
  if (playcountByListener >= MIN_PLAYCOUNT_BY_LISTENER) points++;
  if (stats.counted <= MIN_TRACKS) points++;
  if (
    avgPlaycount < minPlaycount &&
    playcountByListener >= PLAYCOUNT_BY_LISTENER
  )
    points++;

  return points;
}

async function fetchTopTracks(artist) {
  console.log(`Searching for "${artist.name}" tracks`);
  const { tracks } = await api.getTopTracksOnLastFm(artist);
  let averageStats = { playcount: 0, listeners: 0, counted: 0 };

  return tracks.slice(
    0,
    tracks.findIndex((track) => {
      averageStats = calculateAverageStats(averageStats, track);
      const points = calculateTrackPoints(track, averageStats);
      return points < MIN_POINTS;
    })
  );
}

function saveTracksOnDatabase(tracks) {
  tracks.forEach((t) => {
    const query = {
      name: t.name,
      artist: { name: t.artist.name },
    };

    db.tracks.find(query, (_, tracks) => {
      if (tracks.length === 0) {
        db.tracks.insert({
          name: t.name,
          artist: t.artist,
          playcount: parseInt(t.playcount),
        });
      }
    });
  });
}

function main() {
  db.artists.count({}, async (_, count) => {
    if (count === 0) {
      const artists = await fetchArtists();
      saveArtistsOnDatabase(artists);
    }

    db.artists.find({}, async (_, artists) => {
      let i = 0;

      do {
        let artist = artists[i];

        try {
          const tracks = await fetchTopTracks(artist);
          saveTracksOnDatabase(tracks);
          await sleep(2);
        } catch (error) {
          console.log(error.message);
        }

        i++;
      } while (i < artists.length);
    });
  });
}

main();
