'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditUserModal from './EditUserModal';

type User = {
  id: number;
  username: string;
  name: string;
  role: string;
  office_id: number;
};

type UsersTableProps = {
  onAddUser: () => void;
};

const UsersTable: React.FC<UsersTableProps> = ({ onAddUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/protected');
      if (!res.ok) return router.push('/login');

      const currentUser = await res.json();

      if (currentUser.role === 'employee') {
        setError('No tienes permisos para ver esta información');
        return;
      }

      const usersRes = await fetch('/api/users/getUsers');
      const data = await usersRes.json();

      if (!usersRes.ok) {
        setError(data.message || 'Error al obtener los usuarios');
      } else {
        setUsers(data);
      }
    } catch {
      setError('Error de red');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const deleteUser = async (user: User) => {
    const confirm = window.confirm(`¿Deseas eliminar al usuario "${user.username}"?`);
    if (!confirm) return;

    try {
      const res = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Error al eliminar');
      } else {
        alert('Usuario eliminado correctamente');
        fetchUsers();
      }
    } catch  {
      alert('Error de red o servidor');
    }
  };

  return (
    <div className="table-responsive container-fluid px-3">
      <h3>
        Usuarios de tu sucursal{' '}
        <span className="badge bg-secondary">{users.length}</span>
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3 text-start">
        <button className="btn btn-success" onClick={onAddUser}>
          <i className="bi bi-person-plus-fill me-1"></i> Agregar Usuario
        </button>
      </div>

      <table className="table table-bordered table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.name}</td>
              <td>
                {u.role === 'employee'
                  ? 'empleado'
                  : u.role === 'admin'
                  ? 'administrador'
                  : u.role}
              </td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => openModal(u)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          show={showModal}
          onClose={() => setShowModal(false)}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
};

export default UsersTable;
