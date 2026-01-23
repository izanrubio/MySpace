import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkAuth } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                console.error('GitHub authentication error:', error);
                navigate('/login?error=github_auth_failed');
                return;
            }

            if (token) {
                // Guardar el token en localStorage
                localStorage.setItem('token', token);

                // Actualizar el contexto de autenticación
                await checkAuth();

                // Redirigir al dashboard
                navigate('/');
            } else {
                navigate('/login');
            }
        };

        handleCallback();
    }, [searchParams, navigate, checkAuth]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Completing authentication...</p>
            </div>
        </div>
    );
}
