'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditClientModal from './EditClientModal';

type Client = {
  id: number;
  name: string;
  id_card: string;
  phone: string;
  email: string;
  address: string;
  office_id: number;
};

type ClientsTableProps = {
  onAddClient: () => void;
};

const ClientsTable: React.FC<ClientsTableProps> = ({ onAddClient }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchIdCard, setSearchIdCard] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchClients = async (name = '', id_card = '') => {
    try {
      const res = await fetch('/api/auth/protected');
      if (!res.ok) return router.push('/login');

      const resClients = await fetch(`/api/clients/getClients?name=${encodeURIComponent(name)}&id_card=${encodeURIComponent(id_card)}`);
      const data = await resClients.json();

      if (!resClients.ok) {
        setError(data.message || 'Error al obtener los clientes');
      } else {
        setClients(data);
      }
    } catch {
      setError('Error de red');
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClients(searchName, searchIdCard);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchName, searchIdCard]);

  const openModal = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const deleteClient = async (client: Client) => {
    const confirm = window.confirm(`¿Deseas eliminar al usuario "${client.name}"?`);
    if (!confirm) return;

    try {
      const res = await fetch('/api/clients/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Error al eliminar');
      } else {
        alert('Cliente eliminado correctamente');
        fetchClients();
      }
    } catch (err) {
      alert('Error de red o servidor');
    }
  };

  return (
    <div className="table-responsive container-fluid px-3">
      <h3>
        Clientes de tu sucursal{' '}
        <span className="badge bg-secondary">{clients.length}</span>
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por cédula"
            value={searchIdCard}
            onChange={(e) => setSearchIdCard(e.target.value)}
          />
        </div>
      </div>

      {/* Botón Agregar Cliente */}
      <div className="mb-3 text-start">
        <button className="btn btn-success" onClick={onAddClient}>
          <i className="bi bi-person-plus-fill me-1"></i> Agregar Cliente
        </button>
      </div>

      <table className="table table-bordered table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Teléfono</th>
            <th>Correo electrónico</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.id_card}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>{c.address}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => openModal(c)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteClient(c)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedClient && (
        <EditClientModal
          client={selectedClient}
          show={showModal}
          onClose={() => setShowModal(false)}
          onUpdate={() => fetchClients(searchName, searchIdCard)}
        />
      )}
    </div>
  );
};

export default ClientsTable;
