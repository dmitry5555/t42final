'use client'

import { getToken, getTokenPayload } from "@/actions/db"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Users() {
    const [users, setUsers] = useState([])
    const [games, setGames] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const users = await getUsers();
            const games = await getGames();
            // console.log(users)
            
            setUsers(users)
            setGames(games)
            // // console.log('data from useEffect : ', data);
            // if (!data) {
            //     setProfileData()
            //     // const newData = await getProfileData()
            //     // setSettings(newData)
            //     // console.log('newData from getProfileData : ', newData)
            //     // console.log('settings from useEffect : ', settings)
            // } else {
            //     setSettings(data)
            // }
        };
        fetchData();
    });
    
    const getUsers = async () => {
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
                const resp = await response.json()
                return resp
            } else {
                const errorText = await response.text();
                console.error('no users data:', errorText);
                return null
            }
        } catch (error) {
            console.error('Error:', error);
            return null
        }
    }

    const getGames = async () => {
        const token = await getToken();
        const payload = await getTokenPayload();
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

    // const addFriend = async () => {
    //     alert ('friend added')
    // }

    // const formChange = (e: any) => {
    //     const { name, value } = e.target
    //     setSettings((prevSettings) => ({
    //         ...prevSettings,
    //         [name]: value,
    //     }))
    // }

	return (
		<div className='w-96 py-4 mx-auto flex flex-col gap-4'>
			<h2 className="mb-4">all users</h2>
            {users &&
                // map users
                users.map((user: { user_id: number; username: string; avatar_url: string; is_online: boolean }) => (
                    <div key={user.user_id} className="flex flex-row items-center gap-4">
                        {user.avatar_url && <Image unoptimized width={1000} height={1000} src={user.avatar_url} alt={''} className="w-10 h-10 rounded-full" />}
                        {!user.avatar_url && <span className="w-10 h-10 rounded-full bg-gray"></span>}
                        <span>{user.username}</span>
                        {user.is_online && <span><span className="w-2 h-2 bg-green"></span> is online</span>}
                        <div className='ml-auto flex flex-row '>
                            <Link href={`/profile/${user.user_id}`} className='hover:opacity-70 uppercase border-2 py-2 px-4 opacity-100 text-xs'>profile</Link>
                            {/* <button onClick={()=>addFriend()} className="uppercase border-2 py-2 px-4 opacity-100 text-xs hover:opacity-70 ">+friend</button> */}
                        </div>
                    </div>
                ))
            }

			{/* <div className="flex flex-row items-center">
				<label className="w-1/2">Username: </label>
				<input onChange={formChange} name='username' type="text" className='w-1/2 px-2 py-1 text-black' placeholder={settings.username} />
			</div>
                <div className="flex flex-row items-center">
                    <label className="w-1/2">Avatar: </label>
                    <input onChange={handleImageUpload} className='w-1/2 text-black' type="file" />
                </div>
            <div className="flex flex-row">
                <div className="w-1/2"></div>
                <div className="w-1/2">
                    {settings.avatar_url && <Image width={1000} height={1000} src={settings.avatar_url} alt="avatar" unoptimized/>}
                </div>
            </div>
			<div className="flex flex-row mx-auto gap-3">
				<Link href='/' className="border-2 py-2 px-4 mt-4 opacity-100 text-sm ">Back</Link>
				<button onClick={updateProfileData} className="uppercase border-2 py-2 px-4 mt-4 opacity-100 text-sm ">Save</button>
			</div> */}
            <Link href='/' className="border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto">Back</Link>

		</div>
	)
}