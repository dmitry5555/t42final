'use client'

import GameRoom from "@/components/GameRoom"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
	const [scores, setScores] = useState<number[]>([])
	const [players, setPlayers] = useState<string[]>([])

	const scoresUpdate = (score1: number, score2: number) => {
		setScores((prevScores) => [...prevScores, score1, score2])
	}

	return (
		<>
			{scores.length === 0 && <GameRoom mode={0} scoresUpdate={scoresUpdate} players={players} />}
			{scores.length > 0 &&
				<div className="w-96 py-4 mx-auto flex flex-col gap-3">
					<div>final results: </div>
					<div>player {scores[0] > scores[1] ? '1' : '2'} wins the game. congratulations!</div>
					<Link className="uppercase border-2 py-2 px-4 mt-4 opacity-100 text-sm mr-auto" href='/'>ok</Link>
				</div>
			}
		</>
	)
}