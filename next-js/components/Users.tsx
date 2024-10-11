'use client'

import { getToken, getTokenPayload } from "@/actions/db"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Users() {
    const [users, setUsers] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const users = await getUsers();
            setUsers(users)
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


	return (
		<div className='w-[64rem] py-4 mx-auto flex flex-col gap-4'>
			<h2 className="mb-4">all users</h2>
            {users &&
                users.map((user: { user_id: number; username: string; avatar_url: string; is_online: boolean }) => (
                    <div key={user.user_id} className="flex flex-row items-center gap-4">
                        {user.avatar_url && <Image unoptimized width={1000} height={1000} src={'/images/' + user.avatar_url} alt={''} className="w-10 h-10 rounded-full" />}
                        {!user.avatar_url && <span className="w-10 h-10 rounded-full bg-pink-500"></span>}
                        <span>{user.username}</span>
                        {user.is_online && <span><span className="w-2 h-2 bg-green"></span> online now</span>}
                        <div className='ml-auto flex flex-row '>
                            <Link href={`/profile/${user.user_id}`} className='hover:opacity-70 uppercase border-2 py-2 px-4 opacity-100 text-xs'>profile</Link>
                        </div>
                    </div>
                ))
            }

            <Link href='/' className="border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto">Back</Link>

		</div>
	)
}