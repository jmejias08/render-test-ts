import { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import FormModal from '../components/clients/CreateClientModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/NavBar';
import ClientsTable from '../components/clients/ClientTable';
import { verifyToken } from '../lib/verifyToken';

type Props = {
  username: string;
  role: string;
  officeId: number;
};

export default function Clients({ }: Props) {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Navbar />
      <main className="container mt-5">
        <ClientsTable onAddClient={handleShowModal} />

        <FormModal show={showModal} onHide={handleCloseModal} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return verifyToken(ctx);
};
