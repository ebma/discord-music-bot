import AppBar from "@material-ui/core/AppBar"
import Box from "@material-ui/core/Box"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Divider from "@material-ui/core/Divider"
import Drawer from "@material-ui/core/Drawer"
import Fade from "@material-ui/core/Fade"
import IconButton from "@material-ui/core/IconButton"
import { makeStyles } from "@material-ui/core/styles"
import Toolbar from "@material-ui/core/Toolbar"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import BrightnessLowIcon from "@material-ui/icons/Brightness5"
import BrightnessHighIcon from "@material-ui/icons/Brightness7"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import MenuIcon from "@material-ui/icons/Menu"
import PowerIcon from "@material-ui/icons/PowerSettingsNew"
import clsx from "clsx"
import React from "react"
import { useDispatch } from "react-redux"
import { Route, Switch, useHistory } from "react-router-dom"
import { ColorSchemeContext } from "../../context/colorScheme"
import HomePage from "../../pages/HomePage"
import SoundboardPage from "../../pages/SoundboardPage"
import { stopPlayer } from "../../redux/playerSlice"
import { disconnectSocketAction, setAutoConnect } from "../../redux/socketSlice"
import { User } from "../../redux/userSlice"
import { useGetPlayerQuery } from "../../services/graphql/graphql"
import { darkShades, lightShades } from "../../theme"
import Footer from "../Footer"
import QueryWrapper from "../QueryWrapper/QueryWrapper"
import { MainListItems } from "./ListItems"

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  menuButtonHidden: {
    display: "none"
  },
  title: {
    flexGrow: 1
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9)
    }
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto"
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  switchWrapper: {
    position: "relative",
    "& div": {
      position: "relative"
    }
  }
}))

interface Props {
  user: User
}

function Dashboard(props: Props) {
  const { user } = props
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }

  const { colorScheme, toggleColorScheme } = React.useContext(ColorSchemeContext)

  const dispatch = useDispatch()

  const logout = React.useCallback(() => {
    dispatch(setAutoConnect(false))
    dispatch(disconnectSocketAction())
  }, [dispatch])

  const playerQuery = useGetPlayerQuery({ pollInterval: 2000, variables: { id: user.guildID } })

  const player = playerQuery.data?.getPlayer || null
  const available = player?.available || false

  const history = useHistory()

  React.useEffect(() => {
    if (!history.location.hash) {
      history.push("/home")
    }
  }, [history])

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Daves Disco Control Panel
          </Typography>
          <Tooltip title="Toggle theme">
            <IconButton color="inherit" onClick={toggleColorScheme}>
              {colorScheme === "dark" ? <BrightnessLowIcon /> : <BrightnessHighIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Stop Player">
            <span>
              <IconButton color="inherit" disabled={!available} onClick={() => dispatch(stopPlayer())}>
                <PowerIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <MainListItems onLogoutClick={logout} />
      </Drawer>
      <main
        className={classes.content}
        style={{ background: colorScheme === "dark" ? darkShades.dim : lightShades.dim }}
      >
        <div className={classes.appBarSpacer} />
        <Container maxWidth="xl" className={classes.container}>
          <Switch>
            <Route path="/home">
              <Fade in timeout={1000} mountOnEnter unmountOnExit>
                <div>
                  <QueryWrapper loading={playerQuery.loading} error={playerQuery.error}>
                    {user && player && <HomePage guildID={user.guildID} player={player} />}
                  </QueryWrapper>
                </div>
              </Fade>
            </Route>
            <Route path="/soundboard">
              <Fade in timeout={1000} mountOnEnter unmountOnExit>
                <div>{user && <SoundboardPage guildID={user.guildID} />}</div>
              </Fade>
            </Route>
          </Switch>
          <Box pt={4}>
            <Footer />
          </Box>
        </Container>
      </main>
    </div>
  )
}

export default Dashboard
