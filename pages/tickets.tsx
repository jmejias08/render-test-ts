import { GetServerSideProps } from 'next';

import React, { useState } from 'react';
import { Button } from 'react-bootstrap'; // Importa Button de react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa el CSS de Bootstrap una vez en _app.tsx o aquí
import Navbar from '../components/NavBar';
import { verifyToken } from '../lib/verifyToken';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import TicketsTable from '../components/tickets/TicketTable';



// Tipado explícito de las props que se reciben del servidor
type Props = {
  username: string;
  role: string;
  officeId: number;
};

// Componente que muestra los datos del usuario autenticado y un botón para abrir el modal
export default function Users({ username, role, officeId }: Props) {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Navbar />
      <main className="container mt-5">
        <h1 className="mb-4">Gestión de ventas</h1>

        
        <TicketsTable onAddTicket={handleShowModal} />

        

        {/* El componente modal */}
        <CreateTicketModal show={showModal} onHide={handleCloseModal} />

      </main>
    </>
  );
}

// Verificación del token en SSR antes de renderizar la página
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return verifyToken(ctx)
};