import qs from "qs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const api = axios.create({
  baseURL: process.env.LASTFM_API_URL,
  timeout: 60000, // 1 minute
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  params: {
    api_key: process.env.LASTFM_API_KEY,
    format: "json",
    user: process.env.LASTFM_USER,
  },
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "brackets" }),
});

async function getArtistsOnLastFm(currentPage = 1) {
  try {
    const { data } = await api.get("/", {
      params: {
        method: "user.gettopartists",
        page: currentPage,
      },
    });

    return {
      artists: data.topartists.artist,
      meta: data.topartists["@attr"],
    };
  } catch (error) {
    throw error;
  }
}

async function getTopTracksOnLastFm({ name: artist, mbid }) {
  try {
    const params = { method: "artist.gettoptracks" };

    if (artist === null) {
      params.mbid = mbid;
    } else {
      params.artist = artist;
    }

    const { data } = await api.get("/", { params });

    if (data.error) throw new Error(data.message);

    return {
      tracks: data.toptracks.track,
      meta: data.toptracks["@attr"],
    };
  } catch (error) {
    throw error;
  }
}

export default {
  getArtistsOnLastFm,
  getTopTracksOnLastFm,
};
