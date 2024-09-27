import GetToken from '../components/getToken';

export default function Home() {
    const token = GetToken();

    return (
        <div>
            <h1>stock</h1>
            {token}
        </div>
    );
}
