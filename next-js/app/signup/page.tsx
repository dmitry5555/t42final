'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { getToken, getTokenPayload } from '@/actions/db';

export default function Home() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAgain, setPasswordAgain] = useState('');
    const [error, setError] = useState('');

    const validateForm = () => {
        if (!email) {
            return 'Email is required';
        }
        if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return 'Password should be at least 6 characters, contain at least one uppercase letter, one lowercase letter and one number';
        }
        if (password !== passwordAgain) {
            return 'Passwords do not match';
        }
        return '';
    }

    const handleSignUp = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        const userData = {
            username: email,
            email: email,
            password: password,
        };

        const response = await fetch('/api/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            const res = await response.json()
            router.push('/signin')
            // good signup - go to otp (sign-in)
        } else {
            // setError('Check your email: ' + response.statusText);
            setError('This email is already registered. Try another one.');
        }
    }

    return (
        <div className='gap-4 flex flex-col w-96 mx-auto py-4'>
            <h2>Signup</h2>

            <div className='mx-auto gap-3 flex flex-col'>
                <div className='flex flex-row items-center'>
                    <label className='w-1/2'>Email: </label>
                    <input className='w-1/2 text-black px-2 py-1' type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>	
                <div className='flex flex-row items-center'>
                    <label className='w-1/2'>Password: </label>
                    <input className='w-1/2 text-black px-2 py-1' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className='flex flex-row items-center'>
                    <label className='w-1/2'>Password again: </label>
                    <input className='w-1/2 text-black px-2 py-1' type="password" value={passwordAgain} onChange={(e) => setPasswordAgain(e.target.value)} />
                </div>
                {error && <div className='animate-pulse'>{error}</div>}

                <button onClick={handleSignUp} className='border-2 py-2 px-4 mt-4 opacity-100 text-sm mx-auto uppercase hover:opacity-70'>Signup</button>
            </div>

            <div>Have an account?  
                <Link href='/signin' className='hover:opacity-70 uppercase'> Signin</Link>
            </div>
        </div>
    )
}