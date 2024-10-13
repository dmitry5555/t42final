
import { getToken, getTokenPayload } from "@/actions/db";

export const createUserGame = async (status: string) => {
    const token = await getToken()
    const payload = await getTokenPayload()
    try {
        const data = {
            user_one_id: payload.user_id,
            user_two_id: 0,
            user_one_score: 0,
            user_two_score: 0,
            status: status,
        }
        const response = await fetch(`/api/games/`, {
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
            console.log('createUserGame resp ok: ', resp)
            return resp.id
        } else {
            console.log('createUserGameresp error : ', response)
        }
    } catch (error) {
        console.error('error: ', error);
    }
}

export const addUserToGame = async (game: any) => {
    const token = await getToken()
    const payload = await getTokenPayload()
    if (game.user_one_id === payload.user_id)
        return false
    try {
        const data = {
            user_two_id: payload.user_id,
            status: 'playing'
        }
        const response = await fetch(`/api/games/${game.id}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        if (response.ok) {
            const resp = await response.json();
            console.log('patch resp ok: ', resp)
            return true
        } else {
            console.log('patch resp error : ', response)
        }
    } catch (error) {
        console.error('error: ', error);
    }
}
export const findPendingGame = async () => {
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
            // find last game with status pending
            console.log('/api/games/ resp:', resp)
            const lastGame = resp.find((game: any) => game.status === 'pending')
            // console.log('lastGame: ', lastGame)
            return lastGame
        } else {
            const errorText = await response.text();
            console.error('no games data:', errorText);
            return null
        }
    } catch (error) {
        console.error('Error:', error);
        return null
    }
}

export const getAllGames = async () => {
    const token = await getToken();
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
            console.log('/api/games/ resp: ', resp)
            // return resp
        } else {
            const errorText = await response.text();
            console.error('no games found: ', errorText);
            return null
        }
    } catch (error) {
        console.error('Error: ', error);
        return null
    }
}

export const closeUserGame = async (roomId: number, status: string, score1: number, score2: number) => {
    const token = await getToken()
    // const payload = await getTokenPayload()
    try {
        const data = {
            status: status,
            user_one_score: score1,

            
            user_two_score: score2,
        }
        const response = await fetch(`/api/games/${roomId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        if (response.ok) {
            const resp = await response.json();
            console.log('closing game data [ok]: ', data)
            console.log('closing game response: ', resp)
            // return true
        } else {
            console.log('patch resp error : ', response)
        }
    } catch (error) {
        console.error('error: ', error);
    }
} 

