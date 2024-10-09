'use client'

import { getAllGames } from "@/actions/actions";
import { getToken, getTokenPayload, unsetToken } from "@/actions/db";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react";
import { init,  init3DText } from "./text3D";

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
    const containerId = useRef<HTMLCanvasElement | null>(null)
    //////////////////3Dtext//////////////////////////
    const My3DTextComponent: React.FC<{
        onClick?: () => void;
        containerId: React.RefObject<HTMLCanvasElement>;
        text: string;
        url: string;
    }> = ({ onClick, containerId, text, url }) => {
        useEffect(() => {
            if (containerId.current){
                init(containerId.current);
            }
        }, [containerId]);

        // useEffect(() => {
        //     if (containerId.current){
        //         init3DText(text, url);
        //     }
        // }, [text, url]);
        
        return (
            <canvas ref={containerId} className="absolute top-0 left-0 w-full h-full" onClick={onClick || undefined} />
        );
    };
    //////////////////end 3Dtext//////////////////////////

    return (

         <div className='gap-4 flex flex-col w-96 mx-auto py-4'>
            <My3DTextComponent containerId={containerId} text="1-1 game" url="" /> 
			 <div className='gap-2 flex flex-col z-10'>
				<Link href='/game-keyboard' className='hover:opacity-70'>1-1 game</Link>
				<Link href='/game-ai' className='hover:opacity-70'>1-1 game w/ai</Link>
				<Link href='/tournament' className='hover:opacity-70'>tournament</Link>
				<Link href='/game-remote' className='hover:opacity-70'>1-1 remote game</Link>
				<Link href='/users' className='hover:opacity-70'>users</Link>
				<Link href='/settings' className='hover:opacity-70'>settings</Link>
                <div onClick={unsetTok} className='hover:opacity-70 hover:cursor-pointer hover:opacity-70'>exit</div>

                {/* <My3DTextComponent containerId={containerId} text="1-1 game" url="/game-keyboard" /> 
                <My3DTextComponent containerId={containerId} text="1-1 game w/ai" url="/game-ai" /> 
                <My3DTextComponent containerId={containerId} text="tournament" url="/tournament" />
                <My3DTextComponent containerId={containerId} text="1-1 remote game" url="/game-remote" /> 
                <My3DTextComponent containerId={containerId} text="users" url="/users" />
                <My3DTextComponent containerId={containerId} text="settings" url="/settings" /> 
                <My3DTextComponent onClick={unsetTok} containerId={containerId} text="exit" url=""/>  */}

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
