'use client';
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

interface FormModalProps {
  show: boolean;
  onHide: () => void;
}

const CreateClientModal: React.FC<FormModalProps> = ({ show, onHide }) => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [id_card, setIdCard] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !id_card || !phone || !email || !address) {
      return setMessage('Todos los campos son obligatorios');
    }

    try {
      const res = await fetch('/api/clients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, id_card, phone, email, address }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Error al crear el cliente');
      } else {
        setMessage('Cliente creado correctamente');
        setName('');
        setIdCard('');
        setPhone('');
        setEmail('');
        setAddress('');
        setTimeout(() => {
          router.refresh();
          onHide(); // Cierra el modal después de registrar
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
            <label htmlFor="modalUsername" className="form-label">Nombre de Cliente</label>
            <input
              type="text"
              className="form-control"
              id="modalUsername"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="modalIdCard" className="form-label">Cédula de Identidad</label>
            <input
              type="text"
              className="form-control"
              id="modalIdCard"
              value={id_card}
              onChange={(e) => setIdCard(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="modalPhone" className="form-label">Teléfono</label>
            <input
              type="text"
              className="form-control"
              id="modalPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="modalEmail" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              id="modalEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="modalAddress" className="form-label">Dirección</label>
            <input
              type="text"
              className="form-control"
              id="modalAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
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

export default CreateClientModal;
