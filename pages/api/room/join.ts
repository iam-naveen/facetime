import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { userToRoom } from "@/server/db/schema";
import { NextApiRequest, NextApiResponse } from "next";

export default async function join(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const session = await getServerAuthSession({ req, res });

    if (!session) return res.status(401).end("Unauthorized");
    const { roomId } = req.body as { roomId: string };

    await db.insert(userToRoom).values({
        userId: session.user.id,
        roomId,
    })

    return res.status(200).end();
}
