'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FactureTicketDetailsModal from './FactureTicketDetailsModal';
import TicketDetailsModal from './TicketDetailsModal';
import { formatDate, formatCurrencyNumber } from '../../lib/formats';
import { Ticket } from '../../models/types';

type ProductTableProps = {
  onAddTicket: () => void;
};

const TICKETS_PER_PAGE = 10;

const ProductTable: React.FC<ProductTableProps> = ({ onAddTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFactureTicket, setSelectedFactureTicket] = useState<Ticket | null>(null);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [clientSearch, setClientSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [plateSearch, setPlateSearch] = useState('');
  const [showOnlyPendingFacture, setShowOnlyPendingFacture] = useState(false);

  const fetchTickets = async (
    page = 1,
    sort: 'asc' | 'desc' = sortOrder,
    start?: string,
    end?: string
  ) => {
    try {
      const res = await fetch('/api/auth/protected');
      if (!res.ok) return router.push('/login');

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(TICKETS_PER_PAGE),
        sort,
      });

      if (start) queryParams.append('startDate', start);
      if (end) queryParams.append('endDate', end);
      if (clientSearch) queryParams.append('client', clientSearch);
      if (sellerSearch) queryParams.append('seller', sellerSearch);
      if (plateSearch) queryParams.append('plate', plateSearch);
      if (showOnlyPendingFacture) queryParams.append('pendingFacture', 'true');

      const ticketsRes = await fetch(`/api/tickets/getTickets?${queryParams.toString()}`);
      const data = await ticketsRes.json();

      if (!ticketsRes.ok) {
        setError(data.message || 'Error al obtener los tickets');
      } else {
        setTickets(data.tickets);
        setTotalPages(Math.ceil(data.total / TICKETS_PER_PAGE));
        setCurrentPage(page);
        setSortOrder(sort);
      }
    } catch {
      setError('Error de red');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicketDetailsModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchTickets(page, sortOrder, startDate, endDate);
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    fetchTickets(1, newOrder, startDate, endDate);
  };

  const handleFilter = () => {
    fetchTickets(1, sortOrder, startDate, endDate);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setClientSearch('');
    setSellerSearch('');
    setPlateSearch('');
    setShowOnlyPendingFacture(false);
    fetchTickets(1, sortOrder);
  };

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filtros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label">Fecha Inicio:</label>
              <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Fecha Fin:</label>
              <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Cliente:</label>
              <input type="text" className="form-control" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Vendedor:</label>
              <input type="text" className="form-control" value={sellerSearch} onChange={(e) => setSellerSearch(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Placa:</label>
              <input type="text" className="form-control" value={plateSearch} onChange={(e) => setPlateSearch(e.target.value)} />
            </div>
            <div className="col-md-2 form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="pendingFactureCheck"
                checked={showOnlyPendingFacture}
                onChange={(e) => {
                  setShowOnlyPendingFacture(e.target.checked);
                  fetchTickets(1, sortOrder, startDate, endDate);
                }}
              />
              <label className="form-check-label" htmlFor="pendingFactureCheck">
                Pendientes por facturar
              </label>
            </div>
            <div className="col-md-12 d-flex gap-2 mt-3">
              <button className="btn btn-success" onClick={handleFilter}>
                <i className="bi bi-arrow-clockwise"></i> Actualizar
              </button>
              {(startDate || endDate || clientSearch || sellerSearch || plateSearch || showOnlyPendingFacture) && (
                <button className="btn btn-outline-danger" onClick={handleClearFilter}>
                  <i className="bi bi-x-circle"></i> Quitar Filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón Agregar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Listado de Tiquetes</h4>
      </div>

      <div className="mb-3 text-start">
        <button className="btn btn-success" onClick={onAddTicket}>
          <i className="bi bi-plus-circle me-1"></i> Agregar Tiquete
        </button>
      </div>

      {/* Tabla */}
      <div className="table-responsive" style={{ maxHeight: '480px', overflowY: 'auto' }}>
        <table className="table table-hover align-middle text-nowrap">
          <thead className="table-light sticky-top">
            <tr>
              <th>ID</th>
              <th>Vendedor</th>
              <th>Cliente</th>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Por facturar</th>
              <th>Estado Pago</th>
              <th>Total</th>
              <th style={{ cursor: 'pointer' }} onClick={toggleSortOrder}>
                Fecha {sortOrder === 'asc' ? '↑' : '↓'}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.seller_name}</td>
                <td>{t.client_name}</td>
                <td>{t.vehicle_plate}</td>
                <td>{t.type === 'cash' ? 'Contado' : 'Crédito'}</td>
                <td>{t.needs_facture ? 'Sí' : 'No'}</td>
                <td>{t.payment_status ? 'Cancelado' : 'Pendiente'}</td>
                <td>¢{formatCurrencyNumber(t.total)}</td>
                <td>
                  {formatDate(t.date).replace(',', '\n').split('\n').map((line, index) => (
                    <p key={index}>{line.trim()}</p>
                  ))}
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => openTicketDetailsModal(t)}>
                      Ver Detalles
                    </button>
                    {t.needs_facture && (
                      <button className="btn btn-sm btn-warning" onClick={() => {
                        setSelectedFactureTicket(t);
                        setShowFactureModal(true);
                      }}>
                        Facturar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <nav className="mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Anterior</button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(p)}>{p}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Siguiente</button>
          </li>
        </ul>
      </nav>

      {/* Modales */}
      {selectedTicket && showModal && (
        <TicketDetailsModal
          ticket={selectedTicket}
          show={showModal}
          onClose={() => setShowModal(false)}
          onUpdate={() => fetchTickets(currentPage, sortOrder, startDate || undefined, endDate || undefined)}
        />
      )}

      {selectedFactureTicket && showFactureModal && (
        <FactureTicketDetailsModal
          ticket={selectedFactureTicket}
          show={showFactureModal}
          onClose={() => {
            setShowFactureModal(false);
            setSelectedFactureTicket(null);
          }}
          onUpdate={() => fetchTickets(currentPage, sortOrder, startDate || undefined, endDate || undefined)}
        />
      )}
    </div>
  );
};

export default ProductTable;
