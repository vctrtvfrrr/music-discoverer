import db from "../database";
import api from "../services/api";
import sleep from "../utils/sleep";
import { Command, flags } from "@oclif/command";

class FetchTracksCommand extends Command {
  calculateAverageStats(stats, track) {
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

  calculateTrackPoints(track, stats) {
    const { flags } = this.parse(FetchTracksCommand);

    const minListeners =
      flags["min-listeners"] + stats.counted * flags["reduce-factor"];
    const minPlaycount =
      flags["min-playcount"] + stats.counted * flags["reduce-factor"];

    // Percentage of current track listeners in relation to previous averages
    const avgListeners = track.listeners / stats.listeners;
    // Percentage of current track plays in relation to the previous averages
    const avgPlaycount = track.playcount / stats.playcount;
    // Average number of plays per listener
    const playcountByListener = track.playcount / track.listeners;

    let points = 0;

    if (avgListeners >= minListeners) points++;
    if (avgPlaycount >= minPlaycount) points++;
    if (playcountByListener >= flags["min-playcount-by-listener"]) points++;
    if (stats.counted <= flags["min-tracks"]) points++;
    if (
      avgPlaycount < minPlaycount &&
      playcountByListener >= flags["playcount-by-listener"]
    )
      points++;

    return points;
  }

  async fetchTopTracks(artist) {
    const { flags } = this.parse(FetchTracksCommand);

    console.log(`Searching for "${artist.name}" tracks`);

    const { tracks } = await api.getTopTracksOnLastFm(artist);
    let averageStats = { playcount: 0, listeners: 0, counted: 0 };

    return tracks.slice(
      0,
      tracks.findIndex((track) => {
        averageStats = this.calculateAverageStats(averageStats, track);
        const points = this.calculateTrackPoints(track, averageStats);
        return points < flags["min-points"];
      })
    );
  }

  saveTracksOnDatabase(tracks) {
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

  run() {
    db.artists.find({}, async (_, artists) => {
      if (artists.length === 0) {
        this.log("There are no artists saved in the database.");
        process.exit(1);
      }

      // Clear tracks in database
      db.tracks.remove({}, { multi: true });
      db.tracks.persistence.compactDatafile();

      let i = 0;

      do {
        let artist = artists[i];

        try {
          const tracks = await this.fetchTopTracks(artist);
          this.saveTracksOnDatabase(tracks);
          await sleep(1.2);
        } catch (error) {
          this.log(error.message);
        }

        i++;
      } while (i < artists.length);
    });
  }
}

FetchTracksCommand.description =
  "Search all top tracks from artists you've heard on Last.fm.";

FetchTracksCommand.flags = {
  "min-tracks": flags.string({
    default: 5,
    description: "Recommended number of tracks per artist.",
  }),
  "min-points": flags.string({
    default: 3,
    description:
      "Minimum number of points that a track must obtain to be selected. Max: 5.",
  }),
  "reduce-factor": flags.string({
    default: 0.0075,
    description:
      "Factor that increases the difficulty of a track to score as the other tracks are selected.",
  }),
  "min-listeners": flags.string({
    default: 0.8,
    description:
      "Minimum percentage number of listeners that track must have in relation to the previous track.",
  }),
  "min-playcount": flags.string({
    default: 0.75,
    description:
      "Minimum percentage number of plays that track should have in relation to the previous track.",
  }),
  "min-playcount-by-listener": flags.string({
    default: 2,
    description: "Minimum average of track plays per listener.",
  }),
  "playcount-by-listener": flags.string({
    default: 2.5,
    description: "Recommended average track plays per listener.",
  }),
};

export default FetchTracksCommand;
