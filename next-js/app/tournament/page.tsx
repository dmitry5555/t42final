'use client'
// турнир на выбывание - single elimination, 4 игрока

import GameRoom from "@/components/GameRoom"
import Link from "next/link"
import { useEffect, useState } from "react"


export default function Home() {
	// где находимся
	// храним инфу игроков (однопользовательский режим = 1 игрок, сетовой = 2 игрока)
	const [step, setStep] = useState<string>('intro')
	const [tScores, setTScores] = useState<number[]>([])
	const [tPlayers, setTPlayers] = useState<string[]>([])
	const [startButton, setStartButton] = useState<boolean>(false)
	const [player1, setPlayer1] = useState<number>(0)
	const [player2, setPlayer2] = useState<number>(1)
	const [winner, setWinner] = useState<number>(0)
	
	// прокидываем счет из игры вверх - после завершения каждой
	const scoresUpdate = (score1: number, score2: number) => {
		// после первой игры
		if (tScores.length === 0) {
			setPlayer1(2)
			setPlayer2(3)
			setStep('announce')
		}
		// после второй игры
		if (tScores.length === 2) {
			// победитель первой игры
			tScores[0] > tScores[1] ? setPlayer1(0) : setPlayer1(1)
			// победитель второй (текущей)
			score1 > score2 ? setPlayer2(2) : setPlayer2(3)
			setStep('announce')
		}
		// после третьей игры
		if (tScores.length === 4) {
			score1 > score2 ? setWinner(player1) : setWinner(player2)
			setStep('final_results')
		}
		setTScores((prevScores) => [...prevScores, score1, score2])
	}
	
	const nameChange = (index: number, name: string) => {
		setTPlayers((prevTPlayers) => {
			const newTPlayers = [...prevTPlayers]
			newTPlayers[index] = name
			return newTPlayers
		})
	}

	useEffect(() => {
        setStartButton(tPlayers.length === 4 && tPlayers.filter(player => player && player.trim() !== '').length === 4);
	}, [tPlayers]);

	return (
		<div className="flex flex-col mx-auto">

			{step === 'intro' && 
			<div className='w-96 py-4 mx-auto flex flex-col gap-3'>
				<h2>New tournament</h2>
				{[0, 1, 2, 3].map((index) => (
					<div key={index} className='flex flex-row items-center'>
						<label className="w-1/2">Player {index + 1}:</label>
						<input
							type="text"
							value={tPlayers[index] || ""}
							onChange={(e) => nameChange(index, e.target.value)}
							className="w-1/2 px-2 py-1 text-black"
						/>
					</div>
				))}
				<div className="flex flex-row mx-auto gap-3">
					<Link href='/' className="border-2 py-2 px-4 mt-4 opacity-100 text-sm uppercase">back</Link>
					{startButton && <button className="border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto uppercase" onClick={()=>setStep('announce')}>start</button>}
				</div>

			</div>
			}
			{step === 'announce' && 
			<div className="w-96 py-4 mx-auto flex flex-col gap-3">
				<div>game {tScores.length/2 + 1}</div>
				<div>player {player1+1} ({tPlayers[player1]}) vs player {player2+1} ({tPlayers[player2]})</div>
				<button className="uppercase border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto" onClick={()=>setStep('game')}>start</button>
			</div>
			}
			{step === 'final_results' && 
			<div className="w-96 py-4 mx-auto flex flex-col gap-3">
				<div>final results: </div>
				<div>player {winner+1} ({tPlayers[winner]}) wins the tournament. congratulations!</div>
				<Link className="uppercase border-2 py-2 px-4 mt-4 opacity-100 text-sm mr-auto" href='/'>ok</Link>
			</div>
			}

			{step === 'game' && 
				<GameRoom mode={2} scoresUpdate={scoresUpdate} players={tPlayers} />
			}
		</div>
	)


}