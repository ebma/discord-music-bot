import { Readable } from "stream"
import * as ytdl from "ytdl-core"
import { createTracksFromSearchTerm } from "../../shared/util/youtube"
import _ from "lodash"
import { trackError } from "../../shared/util/trackError"

export async function createTrackStream(track: Track, callback: (stream: Readable) => void) {
  try {
    if (track.source === "spotify" && (track as SpotifyTrack).initialized === false) {
      await initalizeSpotifyTrack(track as SpotifyTrack)
    }

    const trackInfo = await ytdl.getInfo(track.url)
    callback(
      ytdl
        .downloadFromInfo(trackInfo, { quality: "highestaudio", filter: "audioonly" })
        .on("error", err => trackError(err))
    )
  } catch (error) {
    trackError(error, this)
  }
}

async function initalizeSpotifyTrack(spotifyTrack: SpotifyTrack) {
  const ytTracks = await createTracksFromSearchTerm(
    `${spotifyTrack.title} - ${spotifyTrack.source === "spotify" ? spotifyTrack.artists : undefined}`,
    1
  )
  const ytTrack = ytTracks[0]
  spotifyTrack.url = ytTrack.url
  spotifyTrack.initialized = true
}
