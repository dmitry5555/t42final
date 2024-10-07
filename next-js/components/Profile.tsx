'use client'

import { getToken, getTokenPayload } from "@/actions/db"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Profile() {
    // const router = useRouter()
    // const { id } = router.query
    const params = useParams<{ id: string }>()
    // const id = params.id
    console.log('params with id', params)

    const [profiles, setProfiles] = useState([])
    const [games, setGames] = useState([])
    const [userData, setUserData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllProfilesData()
            const games = await getGames()
            // const userData = data.find((user: any) => Number(user.user_id) === Number(params.id)) as Object
            // const userData = setUserData(data.find(id == params.id))
            // setUserData(userData)
            const userData = data.find((user: any) => {
                const userId = Number(user.user_id)
                const paramId = Number(params.id)
                return userId === paramId
            })
            
            console.log('user data: ', userData)
            setProfiles(data)
            setGames(games)
            console.log('all profiles data: ', data)
        };
        fetchData();
    }, []);

    const getAllProfilesData = async () => {
        const token = await getToken();
        const payload = await getTokenPayload();
        if (!token || !payload) {
            console.log('user not authenticated');
        }

        try {
            const response = await fetch(`/api/profiles/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const resp = await response.json();
                console.log('/api/profiles/ resp:', resp);
                return resp
            } else {
                const errorText = await response.text();
                console.error('no profiles data:', errorText);
                return null
            }
        } catch (error) {
            console.error('Error:', error);
            return null
        }
    }

    const getGames = async () => {
        const token = await getToken()
        const payload = await getTokenPayload()
        if (!token || !payload) {
            console.log('user not authenticated');
        }
        try {
            const response = await fetch(`/api/games/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (response.ok) {
                const resp = await response.json()
                return resp
            } else {
                const errorText = await response.text();
                console.error('no game data:', errorText);
                return null
            }
        } catch (error) {
            console.error('Error:', error);
            return null
        }
    }
    
    const getExtraData = (games: any[], data: any[]) => {
        return games.map(game => {
            const userOne = data.find(user => user.user_id === game.user_one_id);
            const userTwo = data.find(user => user.user_id === game.user_two_id);
            
            return {
                ...game,
                user_one_username: userOne ? userOne.username : null,
                user_two_username: userTwo ? userTwo.username : null,
                user_one_avatar: userOne ? userOne.avatar_url : null,
                user_two_avatar: userTwo ? userTwo.avatar_url : null,
            };
        });
    };
    const extraData = getExtraData(games, profiles)

    // const formChange = (e: any) => {
    //     const { name, value } = e.target
    //     setSettings((prevSettings) => ({
    //         ...prevSettings,
    //         [name]: value,
    //     }))
    // }

	return (
		<div className='w-96 py-4 mx-auto flex flex-col gap-3'>
			{profiles && <h2 className="mb-4">profile</h2>}
            
            <div className="flex flex-col items-center gap-4">
            {extraData &&
                extraData.map((game: any) => (
                    <div key={game.user_one_id} className="flex flex-row gap-4 items-center align-left mr-auto">
                        {game.user_one_avatar && <img src={game.user_one_avatar} alt={''} className="w-10 h-10 rounded-full" />}
                        {!game.user_one_avatar && <span className="w-10 h-10 rounded-full bg-gray"></span>}                        
                        <span className="">{game.user_one_username}</span>
                        
                        {game.user_two_avatar && <img src={game.user_two_avatar} alt={''} className="w-10 h-10 rounded-full" />}
                        {!game.user_two_avatar && <span className="w-10 h-10 rounded-full bg-gray"></span>}                        
                        <span className="">{game.user_two_username}</span>
                    
                        <span className="">{game.user_one_score}</span>
                        <span className="">{game.user_two_score}</span>
                        
                        {game.user_one_score == 5 ? 'WIN' : ''}
                    </div>
                ))
            }
            </div>
            <Link href='/' className="border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto">Back</Link>

		</div>
	)
}