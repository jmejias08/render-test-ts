import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';
import { useState } from 'react';
import { useRouter } from 'next/router';

// 🔒 Lógica del lado del servidor para redirigir si ya hay sesión
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const token = req.cookies.token;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    } catch (err) {
      // Token inválido o expirado, dejar pasar al login
      console.error('Token inválido:', err);
    }
  }

  return {
    props: {},
  };
};

// 🧾 Componente principal de login
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setError('Credenciales inválidas');
      if (process.env.NODE_ENV === 'development') console.error(data.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body text-body">
      <div className="card shadow p-4" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="text-center mb-4">Iniciar sesión</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          {error && <div className="text-danger text-center mt-3">{error}</div>}
        </form>
      </div>
    </div>
  );
}
