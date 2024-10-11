'use client'

import { getToken, getTokenPayload } from "@/actions/db"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Profile() {
    const params = useParams<{ id: string }>()
    console.log('params with id', params)
    const id = Number(params.id)

    const [profiles, setProfiles] = useState([])
    const [games, setGames] = useState([])
    const [user, setUser] = useState<any>({})
    const [win, setWin] = useState<any>()
    const [loose, setLoose] = useState<any>()
    const [canBFriend, setCanBFriend] = useState<boolean>(true)
    const [friends, setFriends] = useState<any>()
    const [alreadyFriend, setAlreadyFriend] =  useState<boolean>(false)

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllProfilesData()
            const games = await getGames()
            console.log('all games: ', games)

            const userData = data.find((user: any) => {
                const userId = Number(user.user_id)
                const paramId = Number(params.id)
                return userId === paramId
            })

            const payload = await getTokenPayload()
            if (payload.user_id == id )
                setCanBFriend(false)
            // console.log('user data: ', userData)
            console.log('user data: ', userData)
            setUser(userData)
            setFriends(userData.friends)
            setProfiles(data)
            // filter games with only current user id (from url params)
            // const filteredGames = games.filter((game: { user_one_id: number; user_two_id: number }) => game.user_one_id === id || game.user_two_id === id)
            const filteredGames = games.filter((game: { user_one_id: number; user_two_id: number; user_one_score: number; user_two_score: number }) => 
                ((game.user_one_id == id && game.user_two_id ) || 
                (game.user_two_id == id && game.user_one_id )) &&
                (game.user_one_score == 5 || game.user_two_score == 5)
            )
            console.log('filtered games: ', filteredGames)
            setGames(filteredGames)
            // console.log('all profiles data: ', data)
            // setUserData(userData)
            const win = filteredGames.filter((game: { user_one_id: number; user_two_id: number; user_one_score: number; user_two_score: number }) => {
                return (game.user_one_id == id && game.user_one_score == 5) ||
                    (game.user_two_id == id && game.user_two_score == 5)
            }).length;
            const loose = filteredGames.filter((game: { user_one_id: number; user_two_id: number; user_one_score: number; user_two_score: number }) => {
                return (game.user_one_id == id && game.user_two_score == 5) ||
                    (game.user_two_id == id && game.user_one_score == 5)
            }).length;
            setWin(win)
            setLoose(loose)
            
            console.log('this is id from params as number:', id)
            // console.log('this is user id from profile:', user.user_id)
            if (friends && friends.includes(id)) {
                setAlreadyFriend(true)
                return
            }
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


    const addFriend = async (id:any) => {
            if (friends && friends.includes(id)) {
                setAlreadyFriend(true)
                setCanBFriend(false)
                return
            }
            const data = {
                'friends': [...user.friends, id]
            }
            const token = await getToken()
            const payload = await getTokenPayload()
            
            console.log('users friends from state: ', user)
            const response = await fetch(`/api/profiles/${payload.user_id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            
            if (response.ok) {
                setUser((prevUser: any) => ({
                    ...prevUser,
                    friends: [...prevUser.friends, id]
                }))
                const resp = await response.json();
            console.log('ok :', resp)
        } else {
            const errorText = await response.text();
            console.error('error :', response.status, errorText);
        }
        console.log('friend was added tu user with id: ', id)
    }

	return (
		<div className='w-[64rem] py-4 mx-auto flex flex-col gap-4'>
            {/* profile head */}
            {user && <h2 className="mb-4">{user.username}-s profile</h2>}
            <div className="flex flex-row">
                <div className="w-1/2">
                    {user.avatar_url && <Image unoptimized width={1000} height={1000} src={'/images/'+user.avatar_url} alt={''} className="w-32" />}
                    {!user.avatar_url && <span className="w-32 h-32 rounded-full bg-pink-500"></span>}    
                </div>
                <div className="w-1/2 flex-col flex gap-4">
                    <span>games: { games && games.length } </span>
                    <span>win: { win && win } </span>
                    <span>loose: { loose && loose } </span>
                    {canBFriend && <button onClick={ ()=>addFriend(user.user_id) } className="uppercase border-2 py-2 px-4 mt-4 opacity-100 text-xs mr-auto">add friend</button>}
                    {alreadyFriend && <span>you are friends!</span>}
                    {user.is_online && <span>online now</span>}
                    
                </div>
            </div>
            {/* games history */}
            <div className="flex flex-col items-center gap-4">
            {user && <h2 className="mt-12 mb-4 mr-auto">games history</h2>}

            {extraData &&
                extraData.map((game: any) => (
                    <div key={game.user_one_id} className="text-xs flex flex-row items-center w-full">
                        <div className="w-1/2 flex flex-row items-center w-full gap-4 ">
                            {game.user_one_avatar && <Image unoptimized width={1000} height={1000} src={'/images/'+game.user_one_avatar} alt={''} className="w-7 h-7 rounded-full" />}
                            {!game.user_one_avatar && <span className="w-10 h-10 rounded-full bg-pink-500"></span>}                        
                            <span className="">{game.user_one_username}</span>
                            <span className="px-2"> vs </span>
                            {game.user_two_avatar && <Image unoptimized width={1000} height={1000} src={'/images/'+game.user_two_avatar} alt={''} className="w-7 h-7 rounded-full" />}
                            {!game.user_two_avatar && <span className="w-10 h-10 rounded-full bg-pink-500"></span>}                        
                            <span className="">{game.user_two_username}</span> 
                        </div>
                        
                        <div className="w-1/2">
                            <span className="px-2">  
                                {game.user_one_score}
                                <span>:</span>
                                {game.user_two_score}
                            </span>
                            <span className=""> {new Date(game.created_at).toLocaleString()} </span>
                            
                            {/* {game.user_one_score == 5 ? 'WIN' : ''} */}
                        </div>
                    </div>
                ))
            }
            </div>
            <Link href='/users' className="border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto">Back</Link>

		</div>
	)
}