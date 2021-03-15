import db from "../database";
import api from "../services/api";
import sleep from "../utils/sleep";
import { Command, flags } from "@oclif/command";

class FetchArtistsCommand extends Command {
  async fetchArtists() {
    this.log("Searching for artists");

    const { flags } = this.parse(FetchArtistsCommand);

    let artistList = [];
    let currentPage = 0;
    let totalPages = null;
    let mustContinue = true;

    do {
      if (currentPage > 0) await sleep(2);

      currentPage++;
      this.log("Querying the page", currentPage);

      const { artists, meta } = await api.getArtistsOnLastFm(currentPage);

      artistList = artistList.concat(artists);
      currentPage = parseInt(meta.page);
      totalPages = parseInt(meta.totalPages);
      mustContinue =
        parseInt(artists[artists.length - 1].playcount) >= flags.scrobbles;
    } while (mustContinue && currentPage < totalPages);

    return artistList.filter((a) => parseInt(a.playcount) >= flags.scrobbles);
  }

  saveArtistsOnDatabase(artists) {
    this.log("Saving artists on database");

    artists.forEach((a) => {
      const data = { name: a.name, playcount: parseInt(a.playcount) };
      db.artists.find(data, (_, artists) => {
        if (artists.length === 0) db.artists.insert(data);
      });
    });
  }

  async run() {
    const artists = await this.fetchArtists();
    if (artists.length) this.saveArtistsOnDatabase(artists);
    this.log("Done!");
  }
}

FetchArtistsCommand.description = "Search all artists you've heard on Last.fm.";

FetchArtistsCommand.flags = {
  scrobbles: flags.string({
    char: "s",
    default: 2,
    description: "Minimal number of scrobbles.",
  }),
};

export default FetchArtistsCommand;
