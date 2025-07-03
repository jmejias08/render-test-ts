'use client';
import React, { useState, useEffect } from 'react';

type EditProductModalProps = {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    office_id: number;
  };
  show: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

const EditProductModal: React.FC<EditProductModalProps> = ({ product, show, onClose, onUpdate }) => {
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price.toString());
    const [description, setDescription] = useState(product.description || '');

  
    const [message, setMessage] = useState('');

    useEffect(() => {
        setName(product.name);
        setPrice(product.price.toString());
        setDescription(product.description || '');
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
        const res = await fetch('/api/products/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            id: product.id,
            name,
            price: parseFloat(price),
            description: description || '',
            office_id: product.office_id,
            }),
        });

        const data = await res.json();

        if (!res.ok) return setMessage(data.message || 'Error al actualizar');

        setMessage('Producto actualizado correctamente');
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
              <h5 className="modal-title">Editar Producto</h5>
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
                    <label className="form-label">Precio por m3</label>
                    <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
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

export default EditProductModal;
