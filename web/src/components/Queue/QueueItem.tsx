import React, { useRef } from "react"
import { Draggable } from "react-beautiful-dnd"
import Avatar from "@material-ui/core/Avatar"
import Link from "@material-ui/core/Link"
import ListItem from "@material-ui/core/ListItem"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import makeStyles from "@material-ui/styles/makeStyles"
import Tooltip from "@material-ui/core/Tooltip"
import ArrowForwardIcon from "@material-ui/icons/ArrowForwardIos"
import DeleteIcon from "@material-ui/icons/Delete"
import Spotify from "../../shared/util/Spotify"

const useStyles = makeStyles(theme => ({
  queueItem: {
    boxShadow: "1",
    position: "relative",
    padding: "16px 24px"
  }
}))

interface Props {
  current?: boolean
  id: string
  index: number
  old?: boolean
  track: Track
  onClick?: () => void
  onDeleteClick?: () => void
}

function QueueItem(props: Props) {
  const classes = useStyles()
  const { current, id, index, old, track, onClick, onDeleteClick } = props

  const myRef = useRef<HTMLDivElement>(null)
  if (current) {
    setTimeout(() => {
      myRef.current && myRef.current.scrollIntoView()
    }, 500)
  }

  const CurrentTrackArrow = React.useMemo(() => {
    return current ? (
      <ListItemIcon>
        <Tooltip placement="left" title="Current">
          <ArrowForwardIcon />
        </Tooltip>
      </ListItemIcon>
    ) : (
      undefined
    )
  }, [current])

  const DeleteTrackButton = React.useMemo(() => {
    return onDeleteClick ? (
      <ListItemIcon
        onClick={(event: React.MouseEvent) => {
          event.preventDefault()
          event.stopPropagation()
          onDeleteClick()
        }}
      >
        <Tooltip placement="left" title="Remove">
          <DeleteIcon />
        </Tooltip>
      </ListItemIcon>
    ) : (
      undefined
    )
  }, [onDeleteClick])

  const listItemStyle: React.CSSProperties = old ? { opacity: 0.5 } : {}

  const primaryText = Spotify.isSpotifyTrack(track) ? `${track.title} - ${track.artists}` : track.title

  return (
    <Draggable draggableId={id} key={id} index={index}>
      {provided => (
        <ListItem
          button
          className={classes.queueItem}
          ref={provided.innerRef}
          onClick={onClick}
          style={listItemStyle}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {CurrentTrackArrow}
          <ListItemAvatar>
            <Avatar alt="thumbnail" src={track.thumbnail} />
          </ListItemAvatar>
          <ListItemText
            primary={primaryText}
            secondary={
              <Link href={track.url} color="inherit" target="_blank" rel="noreferrer">
                {track.url}
              </Link>
            }
          />
          {DeleteTrackButton}
        </ListItem>
      )}
    </Draggable>
  )
}

export default QueueItem