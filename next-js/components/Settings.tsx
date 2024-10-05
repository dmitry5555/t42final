'use client'

import { getToken, getTokenPayload } from "@/actions/db"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Settings() {

	// const [image, setImage] = useState('')
    const router = useRouter()

    const [settings, setSettings] = useState({
        avatar_url: '',
        username: '',
        user_id: 0,
        // created_at: 0,
        // is_online: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getProfileData();
            // console.log('data from useEffect : ', data);
            if (!data) {
                setProfileData()
                // const newData = await getProfileData()
                // setSettings(newData)
                // console.log('newData from getProfileData : ', newData)
                // console.log('settings from useEffect : ', settings)
            } else {
                setSettings(data)
            }
        };
        fetchData();
    }, []);

    const getProfileData = async () => {
        const token = await getToken();
        const payload = await getTokenPayload();
        if (!token || !payload) {
            console.log('user not authenticated');
        }

        try {
            const response = await fetch(`/api/profiles/${payload.user_id}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const resp = await response.json();
                console.log('/api/profiles/{payload.user_id} resp:', resp);
                return resp;
            } else {
                const errorText = await response.text();
                console.error('no profile data:', errorText);
                return null
            }
        } catch (error) {
            console.error('Error:', error);
            return null
        }
    }
    
    const setProfileData = async () => {
        const token = await getToken()
        const payload = await getTokenPayload()
        try {
            const data = {
                avatar_url: '',
                username: 'user' + payload.user_id,
                user_id: payload.user_id,
            }
            setSettings(data)
            const response = await fetch(`/api/profiles/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            if (response.ok) {
                const resp = await response.json();
                console.log('data was set :', resp)
            } else {
                const errorText = await response.text();
                console.error('data not set :', response.status, errorText);
                router.push('/signin')
            }
        } catch (error) {
            console.error('error: ', error);
        }
    }

	const updateProfileData = async () => {
        const token = await getToken()
        const payload = await getTokenPayload()
        try {
            const data = {
                avatar_url: settings.avatar_url,
                username: settings.username,
                user_id: payload.user_id,
                // created_at: settings.created_at,
                // is_online: settings.is_online,
            }
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
                setSettings(data)
                const resp = await response.json();
                console.log('ok :', resp)
            } else {
                const errorText = await response.text();
                console.error('error :', response.status, errorText);
            }
        } catch (error) {
            console.error('error: ', error);
        }
    }

	const handleImageUpload = async (e: any) => {
		const token = await getToken()
        const payload = await getTokenPayload()

        const file = e.target.files[0]
        if (!file) {
            console.error('Файл не выбран')
            return
        }
		
		const originalFileName = file.name
        const fileExtension = originalFileName.split('.').pop()
        const randomNumber = Math.floor(Math.random() * 100000)
        const sanitizedFileName = `${randomNumber}.${fileExtension}`

		const newFile = new File([file], sanitizedFileName, { type: file.type })

        try {
			const formData = new FormData()
			formData.append('image', newFile)
            const response = await fetch('/api/images/', {
                method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
                body: formData,
				credentials: 'include',
            });
            
            if (response.ok) {
                console.log('img name: ', sanitizedFileName)
				// setImage('https://localhost/images/' + sanitizedFileName)
                const data = {
                    avatar_url: 'https://localhost/images/' + sanitizedFileName,
                    username: settings.username,
                    user_id: payload.user_id,
                }
                setSettings(data)
            } else {
                console.error('error loading img:', response.statusText)
            }
        } catch (error) {
            console.error('error loading:', error)
        }
    }

    const formChange = (e: any) => {
        const { name, value } = e.target
        setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: value,
        }))
    }

	return (
		<div className='w-96 py-4 mx-auto flex flex-col gap-3'>
			<h2>settings</h2>
			{/* <div className="flex flex-row items-center">
				<label className="w-1/2">User ID: </label>
				<input onChange={formChange} name='user_id' value={settings.user_id} className='w-1/2 px-2 py-1 text-black' type="number" placeholder={'at@gmail.com'} />
                </div> */}
            
			<div className="flex flex-row items-center">
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
			</div>
		</div>
	)
}