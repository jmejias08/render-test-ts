import { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import FormModal from '../components/users/CreateUserModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/NavBar';
import UsersTable from '../components/users/UserTable';
import { verifyToken } from '../lib/verifyToken';

type Props = {
  username: string;
  role: string;
  officeId: number;
};

export default function Users({ username, role, officeId }: Props) {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Navbar />
      <main className="container mt-5">
        <UsersTable onAddUser={handleShowModal} />

        <FormModal show={showModal} onHide={handleCloseModal} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return verifyToken(ctx);
};
