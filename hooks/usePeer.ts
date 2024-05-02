import { useSocket } from "@/context/socket"
import { useRouter } from "next/router"
import type Peer from "peerjs"
import { useState, useEffect, useRef } from "react"

const usePeer = () => {
    const socket = useSocket()
    const roomId = useRouter().query.roomId;
    const [peer, setPeer] = useState<Peer | null>(null)
    const [myId, setMyId] = useState('')
    const isPeerSet = useRef(false)

    useEffect(() => {
        if (isPeerSet.current || !roomId || !socket) return;
        isPeerSet.current = true;
        (async function initPeer() {
            const myPeer = new (await import('peerjs')).default()
            setPeer(myPeer)

            myPeer.on('open', (id) => {
                console.log(`your peer id is ${id}`)
                setMyId(id)
                // @ts-expect-error - js file is not typed
                socket.emit('join-room', roomId, id)
            })
        })()
    }, [roomId, socket])

    return {
        peer,
        myId
    }
}

export default usePeer;
