'use client';
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

interface FormModalProps {
  show: boolean;
  onHide: () => void;
}

const CreateProductModal: React.FC<FormModalProps> = ({ show, onHide }) => {
  const router = useRouter();

  const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      return setMessage('Los campos de nombre y precio son obligatorios');
    }

    let jsonBody;

    if (description.length > 0) {
      jsonBody = { name, price, description };
    } else {
      jsonBody = { name, price };
    }   

    try {
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonBody),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Error al crear el producto');
      } else {
        setMessage('Producto creado correctamente');
        setName('');
        setPrice('');
        setDescription('');
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
            <label htmlFor="modalUsername" className="form-label">Nombre de Producto*</label>
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
                <label htmlFor="modalPrice" className="form-label">Precio por m3*</label>
                <input
                type="number"
                className="form-control"
                id="modalPrice"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="modalDescription" className="form-label">Descripción</label>
                <textarea
                className="form-control"
                id="modalDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
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

export default CreateProductModal;
