import { AkairoClient } from "discord-akairo"
import { Socket } from "socket.io"

interface ControlMessage {
  guildID?: string
  messageID: number
  type: "getGuilds" | "getUsers"
}

const handleControlMessages = (socket: Socket, client: AkairoClient) => (data: ControlMessage) => {
  const sendControlResult = (result: any) => {
    socket.emit("event", { type: data.type, messageID: data.messageID, result })
  }

  const sendControlError = (error: any) => {
    socket.emit("event", { type: data.type, messageID: data.messageID, error })
  }

  switch (data.type) {
    case "getGuilds":
      const guilds = client.guilds
      const reducedGuilds = guilds
        .map(g => {
          return { id: g.id, name: g.name }
        })
        .sort((a, b) => a.name.localeCompare(b.name))

      sendControlResult(reducedGuilds)
      break
    case "getUsers":
      if (!data.guildID) {
        sendControlError("No guildID provided!")
      } else {
        const guild = client.guilds.find(g => g.id === data.guildID)
        if (guild) {
          const members = guild.members
          const reducedMembers = members
            .filter(
              member =>
                !member.user.bot && (member.user.presence.status === "online" || member.user.presence.status === "idle")
            )
            .map(member => {
              return { id: member.id, name: member.displayName }
            })
            .sort((a, b) => a.name.localeCompare(b.name))
          sendControlResult(reducedMembers)
        } else {
          sendControlError(`Could not find guild with ID ${data.guildID}`)
        }
      }
      break
  }
}

export { handleControlMessages }
