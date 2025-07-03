import { useRouter } from 'next/router'
import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login') // Redirige a login
  }

  return (
    <button
      onClick={handleLogout}
      className="btn btn-danger"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Cerrando sesión...
        </>
      ) : (
        'Cerrar sesión'
      )}
    </button>
  )
}