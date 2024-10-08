'use client'

import { getAllGames } from "@/actions/actions";
import { getToken, getTokenPayload, unsetToken } from "@/actions/db";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function GameMenu() {

    const router = useRouter()
	const checkToken = async () => {
        const token = await getToken()
        const payload = await getTokenPayload()
        if (!token || !payload)
            router.push('/signin')
	}

	useEffect(() => {
        checkToken();
    })


	useEffect(() => {
        const fetchData = async () => {
            const data = await getAllGames()
		}
		fetchData()
	}, []);
    
    const unsetTok = async () => {
        await unsetToken()
        router.push('/signin')
    }

    return (
        <div className='gap-4 flex flex-col w-96 mx-auto py-4'>
			 <div className='gap-2 flex flex-col'>
				<Link href='/game-keyboard' className='hover:opacity-70'>1-1 game</Link>
				<Link href='/game-ai' className='hover:opacity-70'>1-1 game w/ai</Link>
				<Link href='/tournament' className='hover:opacity-70'>tournament</Link>
				<Link href='/game-remote' className='hover:opacity-70'>1-1 remote game</Link>
				<Link href='/users' className='hover:opacity-70'>users</Link>
				<Link href='/settings' className='hover:opacity-70'>settings</Link>
                <div onClick={unsetTok} className='hover:opacity-70 hover:opacity-70'>exit</div>
				{/* <Link href='' className='hover:opacity-70'>exit</Link> */}
                {/* <button onClick={getAllGames}>get all games</button> */}
                {/* <button onClick={pg2}>get pending games</button> */}
                {/* <button onClick={pg1}>add single pending game</button> */}
                {/* <button onClick={pg2}>get ALL profiles data (id=1)</button> */}
                {/* <button onClick={getGamesData}>get all games data</button> */}
        	</div>
		</div>
    )
}
