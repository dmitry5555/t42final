'use client'

import Link from 'next/link';
import { useState } from 'react';
import { setToken } from '@/actions/db';
import { useRouter } from 'next/navigation';

export default function Home() {

	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [otp, setOtp] = useState('');
	const [error, setError] = useState('');
	const [step, setStep] = useState(0);
  
	const handleGetOtp = async () => {
		const userData = {
            username: email,
            password: password,
        };

		try {
			const response = await fetch('/api/token/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			});

			if (response.ok) {
				const tokenData = await response.json();
				const otpData = { username: email };

				const response2 = await fetch('/api/get-otp/', {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${tokenData.access}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(otpData),
					credentials: 'include',
				});

				if (!response2.ok) {
					setError("error getting otp");
				} else {
					setError('')
					setStep(1);
				}

			} else {
				const resp = await response.text();
				setError("wrong credentials");
			}
		} catch (error) {
			console.error('wrong credentials:', error);
		}
	}


	const handleCheckOtp = async () => {
		const userData = {
            username: email,
            password: password,
			otp: otp
		}

		try {
			const response = await fetch('/api/token/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			});

			if (response.ok) {
				const tokenData = await response.json();
				const otpData = { username: email, otp: otp };

				const response2 = await fetch('/api/verify-otp/', {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${tokenData.access}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(otpData),
					credentials: 'include',
				});

				if (!response2.ok) {
					const errorText = await response2.text();
					setError("wrong otp. try again");
					console.log(errorText);
				} else {
					setError('')
					setToken(tokenData)
					// console.log('JWT is set');
					router.push('/settings')
				}

			} else {
				const errorText = await response.text();
				setError("wrong credentials (checking otp)");
			}
		} catch (error) {
			console.error('wrong credentials (checking otp):', error);
		}
	}

    return (
        <div className='gap-4 flex flex-col w-96 mx-auto py-4'>
			<h2>signin</h2>

			{step === 0 && <div className='mx-auto gap-3 flex flex-col'>
				<div className='flex flex-row items-center'>
					<label className='w-1/2'>Email: </label>
					<input className='w-1/2 text-black px-2 py-1' type="text"  value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>	
				<div className='flex flex-row items-center'>
					<label className='w-1/2'>Password: </label>
					<input className='w-1/2 text-black px-2 py-1' type="password"  value={password} onChange={(e) => setPassword(e.target.value)} />
				</div>
				<button onClick={handleGetOtp} className='border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto'>GET OTP</button>
			</div>}

			{step === 1 && <div className='mx-auto gap-3 flex flex-col'>
				<div className='flex flex-row items-center'>
					<label className='w-1/2'>Enter your OTP: </label>
					<input className='w-1/2 text-black px-2 py-1' type="text"  value={otp} onChange={(e) => setOtp(e.target.value)} />
				</div>	
				
				<button onClick={handleCheckOtp} className='border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto hover:opacity-70'>SIGNIN</button>
			</div>}

			{error && <div className='animate-pulse'>{error}</div>}

			<div>new user? 
				<Link href='/signup' className='hover:opacity-70 hover:opacity-70'> signup</Link>
			</div>

        </div>
    )
}