'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditProductModal from './EditProductModal';

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  office_id: number;
};

type ProductTableProps = {
  onAddProduct: () => void;
};

const ProductTable: React.FC<ProductTableProps> = ({ onAddProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/auth/protected');
      if (!res.ok) return router.push('/login');

      const productsRes = await fetch('/api/products/getProducts');
      const data = await productsRes.json();

      if (!productsRes.ok) {
        setError(data.message || 'Error al obtener los productos');
      } else {
        setProducts(data);
      }
    } catch {
      setError('Error de red');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const deleteProduct = async (product: Product) => {
    const confirm = window.confirm(`¿Deseas eliminar el producto "${product.name}"?`);
    if (!confirm) return;

    try {
      const res = await fetch('/api/products/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Error al eliminar');
      } else {
        alert('Producto eliminado correctamente');
        fetchProducts();
      }
    } catch (err) {
      alert('Error de red o servidor');
    }
  };

  return (
    <div className="table-responsive container-fluid px-3">
      <h3>
        Productos de tu sucursal{' '}
        <span className="badge bg-secondary">{products.length}</span>
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3 text-start">
        <button className="btn btn-success" onClick={onAddProduct}>
          <i className="bi bi-box-seam me-1"></i> Agregar Producto
        </button>
      </div>

      <table className="table table-bordered table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Precio por m³</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>¢{p.price.toLocaleString('es-CR')}</td>
              <td>{p.description}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => openModal(p)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(p)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          show={showModal}
          onClose={() => setShowModal(false)}
          onUpdate={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductTable;
