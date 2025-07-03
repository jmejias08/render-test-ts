'use client';
import React, { useState, useEffect } from 'react';
import { formatDate, formatCurrencyNumber } from '../../lib/formats';
import { Ticket, FactureTicketDetail } from '../../models/types';



type FactureTicketDetailsModalProps = {
  ticket: Ticket;
  show: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

const FactureTicketDetailsModal: React.FC<FactureTicketDetailsModalProps> = ({
  ticket,
  show,
  onClose,
  onUpdate,
}) => {
  const [error, setError] = useState('');
  const [factureTicketDetails, setFactureTicketDetails] = useState<FactureTicketDetail>();

  const fetchFactureTicketDetails = async () => {
    try {
      const res = await fetch(`/api/tickets/getFactureTicketDetails?id=${ticket.id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al obtener la factura del ticket');
      } else {
        setFactureTicketDetails(data[0]);
      }
    } catch {
      setError('Error de red');
    }
  };

  useEffect(() => {
    if (show && ticket.id) {
      fetchFactureTicketDetails();
    }
  }, [ticket, show]);

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Factura del Ticket #{ticket.id}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <h6 className="mb-3">🧾 Información del Ticket</h6>
            <div className="row mb-4">
              <div className="col-md-4"><strong>Vendedor:</strong> {ticket.seller_name}</div>
              <div className="col-md-4"><strong>Placa:</strong> {ticket.vehicle_plate}</div>
              <div className="col-md-4"><strong>Tipo:</strong> {ticket.type === 'cash' ? 'Contado' : ticket.type === 'credit' ? 'Crédito' : ticket.type}</div>
              <div className="col-md-4"><strong>Estado de Pago:</strong> {ticket.payment_status ? 'Cancelado' : 'Pendiente'}</div>
              <div className="col-md-4"><strong>Pendiente de Facturación:</strong> {ticket.needs_facture ? 'Sí' : 'No'}</div>
              <div className="col-md-4"><strong>Estado:</strong> {ticket.is_canceled ? 'Pendiente' : 'Activo'}</div>
              <div className="col-md-4"><strong>Fecha:</strong> {formatDate(ticket.date)}</div>
              <div className="col-md-4"><strong>Total:</strong> ¢{formatCurrencyNumber(ticket.total)}</div>
            </div>

            <hr />

            {factureTicketDetails ? (
              <>
                <h6 className="mb-3">🧾 Datos de la Factura</h6>
                <div className="row">
                  <div className="col-md-6"><strong>Nombre del Cliente:</strong> {factureTicketDetails.client_name}</div>
                  <div className="col-md-6"><strong>Cédula:</strong> {factureTicketDetails.id_card}</div>
                  <div className="col-md-6"><strong>Teléfono:</strong> {factureTicketDetails.phone}</div>
                  <div className="col-md-6"><strong>Email:</strong> {factureTicketDetails.email}</div>
                  <div className="col-md-12"><strong>Dirección:</strong> {factureTicketDetails.address}</div>
                  <div className="col-md-6 mt-3"><strong>Total sin IVA:</strong> ¢{formatCurrencyNumber(factureTicketDetails.total_without_iva)}</div>
                  <div className="col-md-6 mt-3"><strong>Total Facturado:</strong> ¢{formatCurrencyNumber(factureTicketDetails.total)}</div>
                  <div className="col-md-6 mt-3"><strong>Fecha de Factura:</strong> {formatDate(factureTicketDetails.date)}</div>
                </div>
              </>
            ) : (
              <p className="text-muted">No hay información de factura disponible.</p>
            )}
          </div>

          <div className="modal-footer">
            {ticket.needs_facture && (
              <button
                className="btn btn-success"
                onClick={async () => {
                  const confirmAction = window.confirm('¿Está seguro que desea facturar este ticket?');
                  if (!confirmAction) return;

                  try {
                    const res = await fetch(`/api/tickets/factureTicket?id=${ticket.id}`, {
                      method: 'PUT',
                    });
                    const data = await res.json();

                    if (!res.ok) {
                      alert(data.message || 'Error al facturar el ticket');
                      return;
                    }

                    alert('Ticket facturado correctamente.');
                    onUpdate();
                    onClose();
                  } catch  {
                    alert('Error de red al facturar el ticket');
                  }
                }}
              >
                Facturar
              </button>
            )}           
            
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactureTicketDetailsModal;
