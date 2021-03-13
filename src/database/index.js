import path from "path";
import Datastore from "nedb";

const dbPath = path.join(__dirname, ".");

export default {
  artists: new Datastore({ filename: `${dbPath}/artists.db`, autoload: true }),
  tracks: new Datastore({ filename: `${dbPath}/tracks.db`, autoload: true }),
};
