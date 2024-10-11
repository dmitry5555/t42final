'use client'

import { getToken, getTokenPayload, unsetToken } from "@/actions/db";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react";
import { init } from "./text3D";

const My3DTextComponent: React.FC<{
    onClick?: () => void;
    containerId: React.RefObject<HTMLCanvasElement>;
    // text: string;
    // url: string;
}> = ({ onClick, containerId }) => {

    const removeCanvas = () => {
        const canvasElement = containerId.current;
        if (canvasElement) {
            canvasElement.remove(); // ลบ canvas ออกจาก DOM
        }
    };

    useEffect(() => {
        if (containerId.current) {
            init(containerId.current); // เรียกฟังก์ชันการเริ่มต้น
        }
    }, [containerId]);
    
    return (
        <div className='relative gap-4 flex flex-col w-96 mx-auto py-4'>
            <canvas ref={containerId} className='absolute inset-0 w-94 h-full z-0'/>
            <div className='relative z-10 gap-2 flex flex-col text-white'>
				<Link href='/game-keyboard' className='hover:opacity-70' onClick={removeCanvas}>1-1 game</Link>
				<Link href='/game-ai' className='hover:opacity-70' onClick={removeCanvas}>1-1 game w/ai</Link>
				<Link href='/tournament' className='hover:opacity-70' onClick={removeCanvas}>tournament</Link>
				<Link href='/game-remote' className='hover:opacity-70' onClick={removeCanvas}>1-1 remote game</Link>
				<Link href='/users' className='hover:opacity-70' onClick={removeCanvas}>users</Link>
				<Link href='/settings' className='hover:opacity-70' onClick={removeCanvas}>settings</Link>
                <div onClick={() => {if (removeCanvas) removeCanvas(); if (onClick) onClick();}} className='hover:opacity-70 hover:cursor-pointer hover:opacity-70'>exit</div>
        	</div>
        </div>
    )
};

export default function GameMenu() {

    const containerId = useRef<HTMLCanvasElement | null>(null);
    const router = useRouter()
	const checkToken = async () => {
        const token = await getToken()
        const payload = await getTokenPayload()
        if (!token || !payload)
            router.push('/signup')
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
            }
        } catch (error) {
            console.error('error: ', error);
        }
    }

    const unsetTok = async () => {
        await setUserOffline()
        await unsetToken()
        router.push('/signin')
    }

    return (
        <My3DTextComponent containerId={containerId} onClick={unsetTok}/>
    )
}
