import { db } from "@/server/db"
import { rooms } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { NextApiRequest, NextApiResponse } from "next"

const checkRoomId = async (req: NextApiRequest, res: NextApiResponse) => {
    const { roomId } = req.query as { roomId: string }
    const room = await db.query.rooms.findFirst({
         where: eq(rooms.id, roomId)
    })
    if (room)
        res.status(200).json(true)
    else
        res.status(200).json(false)
}
export default checkRoomId
