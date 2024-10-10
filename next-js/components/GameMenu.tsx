'use client'

import { getToken, getTokenPayload, unsetToken } from "@/actions/db";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react";

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
        const fetchData = async () => {}
		fetchData()
	}, []);
    
    const setUserOffline = async () => {
        const token = await getToken()
        const payload = await getTokenPayload()
        try {
            const data = {
                is_online: false
            }
            const response = await fetch(`/api/profiles/${payload.user_id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include',
            })

            if (response.ok) {
                const resp = await response.json();
                console.log('data was set :', resp)
            } else {
                const errorText = await response.text();
                console.error('data not set :', response.status, errorText);
                // router.push('/signin')
            }
        } catch (error) {
            console.error('error: ', error);
        }
    }

    const unsetTok = async () => {
        // remove is_active - patch user-profile
        await setUserOffline()
        await unsetToken()
        router.push('/signin')
    }

    return (

         <div className='gap-4 flex flex-col w-96 mx-auto py-4'>
			 <div className='gap-2 flex flex-col z-10'>
				<Link href='/game-keyboard' className='hover:opacity-70'>1-1 game</Link>
				<Link href='/game-ai' className='hover:opacity-70'>1-1 game w/ai</Link>
				<Link href='/tournament' className='hover:opacity-70'>tournament</Link>
				<Link href='/game-remote' className='hover:opacity-70'>1-1 remote game</Link>
				<Link href='/users' className='hover:opacity-70'>users</Link>
				<Link href='/settings' className='hover:opacity-70'>settings</Link>
                <div onClick={unsetTok} className='hover:opacity-70 hover:cursor-pointer hover:opacity-70'>exit</div>
        	 </div>
		</div>
    )
}
