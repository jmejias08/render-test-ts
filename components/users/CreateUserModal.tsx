'use client';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

interface FormModalProps {
  show: boolean;
  onHide: () => void;
}

const CreateUserModal: React.FC<FormModalProps> = ({ show, onHide }) => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !name || !role) {
      return setMessage('Todos los campos son obligatorios');
    }

    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Error al crear el usuario');
      } else {
        setMessage('Usuario creado correctamente');
        setUsername('');
        setPassword('');
        setName('');
        setRole('employee');
        setTimeout(() => {
          router.refresh();
          onHide(); // ✅ Cierra el modal
        }, 500);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error de red o del servidor');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Formulario de Registro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="modalUsername" className="form-label">Nombre de Usuario</label>
            <input
              type="text"
              className="form-control"
              id="modalUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="modalPassword" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="modalPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="modalName" className="form-label">Nombre Completo</label>
            <input
              type="text"
              className="form-control"
              id="modalName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="modalRole" className="form-label">Rol</label>
            <select
              className="form-select"
              id="modalRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="employee">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {message && <div className="alert alert-info">{message}</div>}

          <button type="submit" className="btn btn-primary w-100">
            Registrar
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateUserModal;
