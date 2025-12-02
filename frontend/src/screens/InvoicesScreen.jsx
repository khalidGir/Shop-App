import React from 'react';
import { Table, Button, Row, Col, Badge, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaPlus, FaFileInvoice, FaEye, FaTrash } from 'react-icons/fa';
import { useGetInvoicesQuery, useDeleteInvoiceMutation } from '../slices/invoicesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const InvoicesScreen = () => {
    const { data: invoices, isLoading, error, refetch } = useGetInvoicesQuery();
    const [deleteInvoice, { isLoading: loadingDelete }] = useDeleteInvoiceMutation();

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await deleteInvoice(id).unwrap();
                toast.success('Invoice deleted');
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <Container>
            <Row className='align-items-center mb-4'>
                <Col>
                    <h1>Invoices</h1>
                </Col>
                <Col className='text-end'>
                    <LinkContainer to='/invoices/create'>
                        <Button className='my-3'>
                            <FaPlus /> Create Invoice
                        </Button>
                    </LinkContainer>
                </Col>
            </Row>

            {loadingDelete && <Loader />}
            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error?.data?.message || error.error}</Message>
            ) : (
                <Table striped bordered hover responsive className='table-sm'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>CUSTOMER</th>
                            <th>DATE</th>
                            <th>DUE DATE</th>
                            <th>TOTAL</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice._id}>
                                <td>{invoice.invoiceNumber}</td>
                                <td>{invoice.customer?.name || 'Unknown Customer'}</td>
                                <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                <td>ETB {invoice.total.toLocaleString()}</td>
                                <td>
                                    <Badge
                                        bg={
                                            invoice.status === 'Paid'
                                                ? 'success'
                                                : invoice.status === 'Sent'
                                                    ? 'info'
                                                    : invoice.status === 'Overdue'
                                                        ? 'danger'
                                                        : 'secondary'
                                        }
                                    >
                                        {invoice.status}
                                    </Badge>
                                </td>
                                <td>
                                    <LinkContainer to={`/invoices/${invoice._id}`}>
                                        <Button variant='light' className='btn-sm mx-1'>
                                            <FaEye />
                                        </Button>
                                    </LinkContainer>
                                    <Button
                                        variant='danger'
                                        className='btn-sm mx-1'
                                        onClick={() => deleteHandler(invoice._id)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={7} className='text-center'>
                                    No invoices found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default InvoicesScreen;
