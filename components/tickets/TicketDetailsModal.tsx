'use client';
import React, { useState, useEffect } from 'react';
import { formatDate, formatCurrencyNumber } from '../../lib/formats';
import { Ticket, TicketDetail } from '../../models/types';

type TicketDetailsModalProps = {
  ticket: Ticket;
  show: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  show,
  onClose,
  onUpdate,
}) => {
  const [error, setError] = useState('');
  const [ticketDetails, setTicketDetails] = useState<TicketDetail[]>([]);

  const fetchTicketDetails = async () => {
    try {
      const ticketsRes = await fetch(`/api/tickets/getTicketDetails?id=${ticket.id}`);
      const data = await ticketsRes.json();
      if (!ticketsRes.ok) {
        setError(data.message || 'Error al obtener los detalles del ticket');
      } else {
        setTicketDetails(data);
      }
    } catch {
      setError('Error de red');
    }
  };

  useEffect(() => {
    if (show && ticket.id) {
      fetchTicketDetails();
    }
  }, [ticket, show]);

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Detalles del Ticket #{ticket.id}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Encabezado de información */}
            <div className="row mb-4">
              <div className="col-md-6">
                <p><strong>ID:</strong> {ticket.id}</p>
                <p><strong>Vendedor:</strong> {ticket.seller_name}</p>
                <p><strong>Cliente:</strong> {ticket.client_name}</p>
                <p><strong>Placa:</strong> {ticket.vehicle_plate}</p>
                <p><strong>Tipo:</strong> {ticket.type === 'cash' ? 'Contado' : ticket.type === 'credit' ? 'Crédito' : ticket.type}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Pendiente de Facturación:</strong> {ticket.needs_facture ? 'Sí' : 'No'}</p>
                <p><strong>Estado de Pago:</strong> {ticket.payment_status ? 'Cancelado' : 'Pendiente'}</p>
                <p><strong>Estado:</strong> {ticket.is_canceled ? 'Pendiente' : 'Activo'}</p>
                <p><strong>Fecha:</strong> {
                  formatDate(ticket.date)
                    .replace(',', '\n')
                    .split('\n')
                    .map((line, index) => (
                      <div key={index}>{line.trim()}</div>
                    ))
                }</p>
              </div>
            </div>

            {/* Tabla de productos */}
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                    <th>Descuento</th>
                    <th>Impuestos</th>
                    <th>Total</th>
                    <th>Exonerado</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketDetails.map((td) => (
                    <tr key={td.product_id}>
                      <td>{td.product_name}</td>
                      <td>{td.quantity}</td>
                      <td>¢{formatCurrencyNumber(td.price)}</td>
                      <td>¢{formatCurrencyNumber(td.subtotal)}</td>
                      <td>¢{formatCurrencyNumber(td.discount)} ({td.discount_percentage}%)</td>
                      <td>¢{formatCurrencyNumber(td.taxes)} ({td.taxes_percentage}%)</td>
                      <td>¢{formatCurrencyNumber(td.total)}</td>
                      <td>{td.exonerated ? 'Sí' : 'No'}</td>
                      <td>{td.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comentario debajo de la tabla */}
            <div className="my-4 p-3 border rounded bg-light">
              <strong>Comentario:</strong> {ticket.comment || 'Sin comentario'}
            </div>

            {/* Totales */}
            <div className="mt-4">
              <div className="d-flex justify-content-end fs-5">
                <div className="text-end">
                  <p className="fs-4"><strong>Subtotal:</strong> ¢{formatCurrencyNumber(ticket.subtotal)}</p>
                  <p className="fs-4"><strong>Descuento:</strong> ¢{formatCurrencyNumber(ticket.discount)}</p>
                  <p className="fs-4"><strong>Impuestos:</strong> ¢{formatCurrencyNumber(ticket.taxes)}</p>
                  <p className="fs-4"><strong>Total:</strong> ¢{formatCurrencyNumber(ticket.total)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button className="btn btn-primary">
              <i className="bi bi-printer"></i> Imprimir
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle"></i> Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
