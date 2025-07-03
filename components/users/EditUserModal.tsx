'use client';
import React, { useState, useEffect } from 'react';

type EditUserModalProps = {
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
    office_id: number;
  };
  show: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

const EditUserModal: React.FC<EditUserModalProps> = ({ user, show, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(user.name);
    setRole(user.role);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) return setMessage(data.message || 'Error al actualizar');

      setMessage('Usuario actualizado correctamente');
      onUpdate();
      onClose();
    } catch  {
      setMessage('Error de red o servidor');
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Editar Usuario</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {message && <div className="alert alert-info">{message}</div>}
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">Guardar</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
