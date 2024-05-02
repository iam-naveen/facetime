import { randomBytes } from "crypto"
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerAuthSession } from "@/server/auth"
import { db } from "@/server/db"
import { rooms, userToRoom } from "@/server/db/schema"

const createRoom = async (req: NextApiRequest, res: NextApiResponse) => {
     const session = await getServerAuthSession({req, res})

     if (!session)
          return res.status(401).end("Unauthorized")

     const room = await db.insert(rooms).values({
          id: randomBytes(5).toString('hex'),
          name: 'New Room',
          createdById: session.user.id,
          createdAt: new Date(),
     }).returning()

     if (!room[0])
          return res.status(500).end("Cannot create room")

     await db.insert(userToRoom).values({
          userId: session.user.id,
          roomId: room[0].id
     })

     return res.send(room[0])
}

export default createRoom

