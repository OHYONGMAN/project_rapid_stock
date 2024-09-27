'use client';
import useToken from '../../hook/useToken';

export default function Home() {
    const { token, loading, error } = useToken();

    // function fetchStock() {
    //     const url = '';
    // }

    return (
        <div>
            <h1>stock</h1>
            <p>
                {token}
                {error}
                {loading}
            </p>
        </div>
    );
}
