'use client';
import React, { useState, useEffect } from 'react';

type EditClientModalProps = {
  client: {
    id: number;
    name: string;
    id_card: string;
    phone: string;
    email: string;
    address: string;
    office_id: number;
  };
  show: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

const EditClientModal: React.FC<EditClientModalProps> = ({ client, show, onClose, onUpdate }) => {
  const [name, setName] = useState(client.name);
  const [idCard, setIdCard] = useState(client.id_card);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email);
  const [address, setAddress] = useState(client.address);


  
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(client.name);
    setIdCard(client.id_card);
    setPhone(client.phone);
    setEmail(client.email);
    setAddress(client.address);
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/clients/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: client.id,
          name,
          id_card: idCard,
          phone,
          email,
          address,
        }),
      });

      const data = await res.json();

      if (!res.ok) return setMessage(data.message || 'Error al actualizar');

      setMessage('Cliente actualizado correctamente');
      onUpdate();
      onClose();
    } catch (err) {
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
              <h5 className="modal-title">Editar Client</h5>
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
                <label className="form-label">Cédula</label>
                <input
                  type="text"
                  className="form-control"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
               </div>
              <div className="mb-3">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
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

export default EditClientModal;
