import { useRouter } from 'next/navigation'

import styles from '@/styles/home.module.css'
import { useState } from 'react';
import { cn } from '@/utils/cn';

export default function Home() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')
  const [error, setError] = useState(false)

  const createAndJoin = async () => {
    const res = await fetch("/api/room/create")
    const room = await res.json()
    router.push(`/${room.id}`)
  }

  const joinRoom = async () => {
    const res = await fetch(`/api/room/${roomId}`)
    const isPresent = await res.json() as boolean
    if (isPresent)
      router.push(`/${roomId}`)
    else
      setError(true)
  }

  return (
    <div className={styles.homeContainer}>
      <h1>Google Meet Clone</h1>
      <div className={styles.enterRoom}>
        <input placeholder='Enter Room ID' value={roomId} onChange={(e) => {
          if (error) setError(false)
          setRoomId(e?.target?.value)
        }} />
        <button onClick={joinRoom}>Join Room</button>
        <span className={cn("text-red-400",{ "hidden": !error, })}>
          Please enter a valid room ID
        </span>
      </div>
      <span className={styles.separatorText} >--------------- OR ---------------</span>
      <button onClick={createAndJoin}>Create a new room</button>
    </div>
  )
}
