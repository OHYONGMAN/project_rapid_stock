'use client';
import { useState, useEffect } from 'react';

type TokenResponse = {
    access_token: string;
};

const useToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const url = 'https://openapivts.koreainvestment.com:29443/oauth2/tokenP';
            const CLIENT_ID = 'PSdHNByWrAtHQHJdgPni4klEcS2UhsjmyBqn';
            const CLIENT_SECRET = 'd4H+5BzaVvA4EQGe4gUAVfjQF9erxySxkfk8aCRW9TUTShnoKMOY6XqOOotCnD83MUx8RZL6s3h7qNfoOesFdoaW1IOt2e7hjcn24AD996UMFmu1mBE0UIMNxAFv4Ow3Om7MqI4s7x11zEi0fJTDfgPfEwYyc6E77+6Kphmny3F6S9kJaCY=';

            const body = {
                grant_type: 'client_credentials',
                appkey: CLIENT_ID,
                appsecret: CLIENT_SECRET,
            };

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                const data: TokenResponse = await response.json();

                if (response.ok) {
                    console.log('발급된 Access Token:', data.access_token);
                    setToken(data.access_token);
                } else {
                    console.error('토큰 발급 실패:', data);
                    setError('Failed to retrieve token');
                }
            } catch (err) {
                console.error('토큰 발급 중 에러 발생:', err);
                setError('Error occurred while fetching the token');
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, []);

    return { token, loading, error };
};

export default useToken;
