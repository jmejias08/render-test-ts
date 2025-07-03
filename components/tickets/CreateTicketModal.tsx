'use client';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

interface FormModalProps {
  show: boolean;
  onHide: () => void;
}

interface Client {
  id: number;
  name: string;
  id_card: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

type ProductField = 'productId' | 'quantity' | 'discount' | 'taxes' | 'exonerated';

const CreateTicketModal: React.FC<FormModalProps> = ({ show, onHide }) => {
  const router = useRouter();

  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [type, setType] = useState('cash');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [needsFacture, setNeedsFacture] = useState(false);
  const [comment, setComment] = useState('');

  const [products, setProducts] = useState([
    { productId: '', quantity: '', discount: '', taxes: '', exonerated: false }
  ]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  const [pendingDescription, setPendingDescription] = useState('');
  const [pendingExpDate, setPendingExpDate] = useState('');
  const [message, setMessage] = useState('');

  const fetchClients = async (query: string) => {
    try {
      const res = await fetch(`/api/clients/getClients?name=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/getProducts');
      if (res.ok) {
        const data = await res.json();
        setProductsList(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductChange = (index: number, field: ProductField, value: string | boolean) => {
    const updated = [...products];

    if (field === 'exonerated') {
      const isChecked = Boolean(value);
      // Si no requiere factura, no se puede exonerar
      if (!needsFacture && isChecked) return;

      updated[index].exonerated = isChecked;
      if (!isChecked) updated[index].taxes = '';
    } else {
      updated[index][field] = value as string;
    }

    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { productId: '', quantity: '', discount: '', taxes: '', exonerated: false }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !type || products.length === 0 || products.some(p => !p.productId || !p.quantity)) {
      return setMessage('Todos los campos obligatorios deben ser completados');
    }

    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          clientId,
          type,
          vehiclePlate,
          needsFacture,
          comment,
          products: products.map(p => ({
            productId: parseInt(p.productId),
            quantity: parseFloat(p.quantity),
            discount: parseFloat(p.discount) || 0,
            taxes: needsFacture ? (p.exonerated ? parseFloat(p.taxes) || 0 : 13) : null,
            exonerated: needsFacture ? Boolean(p.exonerated) : false
          })),
          pending_ticket_description: type === 'credit' ? pendingDescription : undefined,
          pending_ticket_exp_date: type === 'credit' ? pendingExpDate : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Error al crear el tiquete');
      } else {
        setMessage('Tiquete creado exitosamente');
        setTimeout(() => {
          router.refresh();
          onHide();
        }, 500);
      }
    } catch (err) {
      console.error(err);
      setMessage('Error de red o del servidor');
    }
  };

  let totalDiscount = 0;
  let totalImpuesto = 0;

  const subtotal = products.reduce((acc, product) => {
    const selectedProduct = productsList.find(p => p.id === parseInt(product.productId));
    const price = Number(selectedProduct?.price) || 0;
    const quantity = parseFloat(product.quantity) || 0;
    const discount = parseFloat(product.discount) || 0;

    const base = price * quantity * (1 - discount / 100);
    totalDiscount += price * quantity * (discount / 100);

    let impuesto = 0;

    if (needsFacture) {
      const exonerated = Boolean(product.exonerated);
      const taxes = exonerated ? parseFloat(product.taxes) || 0 : 13;

      impuesto = base * (taxes / 100);
      totalImpuesto += impuesto;
    }

    return acc + base;
  }, 0);

  const totalConImpuesto = subtotal + totalImpuesto;

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Crear Tiquete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Buscar Cliente</label>
            <input
              className="form-control"
              list="clientOptions"
              placeholder="Nombre o cédula"
              value={clientSearch}
              onChange={(e) => {
                const query = e.target.value;
                setClientSearch(query);
                fetchClients(query);

                const match = clients.find(
                  (c) => `${c.name} (${c.id_card})`.toLowerCase() === query.trim().toLowerCase()
                );

                if (match) {
                  setSelectedClient(match);
                  setClientId(match.id.toString());
                } else {
                  setSelectedClient(null);
                  setClientId('');
                }
              }}
              required
            />
            <datalist id="clientOptions">
              {clients.map((c) => (
                <option key={c.id} value={`${c.name} (${c.id_card})`} />
              ))}
            </datalist>

            {selectedClient && (
              <div className="mt-2 alert alert-success p-2">
                Cliente seleccionado: <strong>{selectedClient.name}</strong> - Cédula: {selectedClient.id_card}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="cash">Contado</option>
              <option value="credit">Crédito</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Placa del Vehículo</label>
            <input type="text" className="form-control" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} />
          </div>

          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" checked={needsFacture} onChange={() => setNeedsFacture(!needsFacture)} />
            <label className="form-check-label">¿Requiere Factura?</label>
          </div>

          <div className="mb-3">
            <label className="form-label">Comentario</label>
            <textarea className="form-control" value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          <hr />
          <h5>Detalles de Factura</h5>
          <table className="table table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre del Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>% Descuento</th>
                <th>% Impuesto / Exonerado</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => {
                const selectedProduct = productsList.find(p => p.id === parseInt(product.productId));
                const name = selectedProduct?.name || '';
                const price = Number(selectedProduct?.price) || 0;
                const quantity = parseFloat(product.quantity) || 0;
                const discount = parseFloat(product.discount) || 0;
                const taxes = parseFloat(product.taxes) || 0;
                const exonerated = Boolean(product.exonerated);

                const base = price * quantity * (1 - discount / 100);
                let impuesto = 0;
                if (needsFacture) {
                  impuesto = base * ((exonerated ? taxes : 13) / 100);
                }
                const subtotal = base + impuesto;

                return (
                  <tr key={i}>
                    <td>
                      <input
                        list={`productOptions-${i}`}
                        className="form-control"
                        value={product.productId}
                        onChange={(e) => handleProductChange(i, 'productId', e.target.value)}
                        required
                      />
                      <datalist id={`productOptions-${i}`}>
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {`${p.name} - ₡${p.price}`}
                          </option>
                        ))}
                      </datalist>
                    </td>
                    <td>{name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="form-control"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(i, 'quantity', e.target.value)}
                        required
                      />
                    </td>
                    <td>₡{price.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        className="form-control"
                        value={product.discount}
                        onChange={(e) => handleProductChange(i, 'discount', e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          className="form-control"
                          value={product.taxes}
                          onChange={(e) => handleProductChange(i, 'taxes', e.target.value)}
                          disabled={!needsFacture || !product.exonerated}
                        />
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={product.exonerated}
                            onChange={(e) => handleProductChange(i, 'exonerated', e.target.checked)}
                            id={`exonerated-check-${i}`}
                            disabled={!needsFacture}
                          />
                          <label className="form-check-label" htmlFor={`exonerated-check-${i}`} style={{ fontSize: '0.8rem' }}>
                            Exonerado
                          </label>
                        </div>
                      </div>
                    </td>
                    <td>₡{subtotal.toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          const updated = [...products];
                          updated.splice(i, 1);
                          setProducts(updated);
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={6} className="text-end fw-bold">Subtotal</td>
                <td colSpan={2} className="fw-bold">₡{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={6} className="text-end fw-bold">Descuento</td>
                <td colSpan={2} className="fw-bold">₡{totalDiscount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={6} className="text-end fw-bold">Impuesto</td>
                <td colSpan={2} className="fw-bold">₡{totalImpuesto.toFixed(2)}</td>
              </tr>
              <tr className="table-success">
                <td colSpan={6} className="text-end fw-bold">Total</td>
                <td colSpan={2} className="fw-bold">₡{totalConImpuesto.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <button type="button" className="btn btn-secondary mb-3" onClick={addProduct}>
            Agregar Producto
          </button>

          {type === 'credit' && (
            <>
              <div className="mb-3">
                <label className="form-label">Descripción del Tiquete Pendiente</label>
                <textarea className="form-control" value={pendingDescription} onChange={(e) => setPendingDescription(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha de Vencimiento</label>
                <input type="date" className="form-control" value={pendingExpDate} onChange={(e) => setPendingExpDate(e.target.value)} required />
              </div>
            </>
          )}

          {message && <div className="alert alert-info">{message}</div>}

          <button type="submit" className="btn btn-primary w-100">Crear Tiquete</button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateTicketModal;
