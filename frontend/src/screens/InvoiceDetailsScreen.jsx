import React, { useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Table, Badge, Container } from 'react-bootstrap';
import { FaPrint, FaEnvelope, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from '../slices/invoicesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PrintableInvoice from '../components/PrintableInvoice';
import { toast } from 'react-toastify';

const InvoiceDetailsScreen = () => {
    const { id: invoiceId } = useParams();
    const navigate = useNavigate();

    const { data: invoice, isLoading, error, refetch } = useGetInvoiceByIdQuery(invoiceId);
    const [updateInvoice, { isLoading: loadingUpdate }] = useUpdateInvoiceMutation();

    const handlePrint = () => {
        window.print();
    };

    const handleEmail = () => {
        const subject = `Invoice #${invoice.invoiceNumber} from ShopApp`;
        const body = `Dear ${invoice.customer.name},\n\nPlease find attached invoice #${invoice.invoiceNumber} for ETB ${invoice.total}.\n\nThank you for your business.\n\nBest regards,\nShopApp Team`;
        window.location.href = `mailto:${invoice.customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const markAsSent = async () => {
        try {
            await updateInvoice({ _id: invoiceId, status: 'Sent' }).unwrap();
            toast.success('Invoice marked as Sent');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const markAsPaid = async () => {
        try {
            await updateInvoice({ _id: invoiceId, status: 'Paid' }).unwrap();
            toast.success('Invoice marked as Paid');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

    return (
        <>
            {/* Screen View */}
            <Container className='d-print-none'>
                <Link to='/invoices' className='btn btn-light my-3'>
                    <FaArrowLeft /> Back to Invoices
                </Link>

                <Row className='mb-4'>
                    <Col md={8}>
                        <h1>Invoice {invoice.invoiceNumber}</h1>
                        <p className='text-muted'>Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </Col>
                    <Col md={4} className='text-end'>
                        <Button variant='outline-secondary' className='me-2' onClick={handlePrint}>
                            <FaPrint /> Print
                        </Button>
                        <Button variant='outline-primary' className='me-2' onClick={handleEmail}>
                            <FaEnvelope /> Send
                        </Button>
                        <Button variant='primary' onClick={() => navigate(`/invoices/${invoice._id}/edit`)}>
                            <FaEdit /> Edit
                        </Button>
                    </Col>
                </Row>

                <Row>
                    <Col md={8}>
                        <Card className='mb-4'>
                            <Card.Header>
                                <Row>
                                    <Col><strong>Bill To</strong></Col>
                                    <Col className='text-end'><strong>Dates</strong></Col>
                                </Row>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <h5>{invoice.customer?.name}</h5>
                                        <p>
                                            {invoice.customer?.email}<br />
                                            {invoice.customer?.phone}<br />
                                            {invoice.customer?.address}
                                        </p>
                                    </Col>
                                    <Col md={6} className='text-end'>
                                        <p>
                                            <strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}<br />
                                            <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}<br />
                                            <strong>Status:</strong> <Badge bg={invoice.status === 'Paid' ? 'success' : 'warning'}>{invoice.status}</Badge>
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className='mb-4'>
                            <Card.Header>Items</Card.Header>
                            <Table striped hover responsive className='mb-0'>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th className='text-center'>Qty</th>
                                        <th className='text-end'>Price</th>
                                        <th className='text-end'>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td className='text-center'>{item.quantity}</td>
                                            <td className='text-end'>{item.price.toLocaleString()}</td>
                                            <td className='text-end'>{item.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className='mb-4'>
                            <Card.Header>Summary</Card.Header>
                            <Card.Body>
                                <Row className='mb-2'>
                                    <Col>Subtotal:</Col>
                                    <Col className='text-end'>ETB {invoice.subtotal.toLocaleString()}</Col>
                                </Row>
                                <Row className='mb-2'>
                                    <Col>Tax (15%):</Col>
                                    <Col className='text-end'>ETB {invoice.tax.toLocaleString()}</Col>
                                </Row>
                                <hr />
                                <Row className='mb-3'>
                                    <Col><h3>Total:</h3></Col>
                                    <Col className='text-end'><h3>ETB {invoice.total.toLocaleString()}</h3></Col>
                                </Row>

                                {invoice.status === 'Draft' && (
                                    <Button variant='info' className='w-100 mb-2' onClick={markAsSent}>
                                        Mark as Sent
                                    </Button>
                                )}
                                {invoice.status !== 'Paid' && (
                                    <Button variant='success' className='w-100' onClick={markAsPaid}>
                                        Mark as Paid
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>

                        {invoice.notes && (
                            <Card>
                                <Card.Header>Notes</Card.Header>
                                <Card.Body>{invoice.notes}</Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* Print View Component */}
            <PrintableInvoice invoice={invoice} />
        </>
    );
};

export default InvoiceDetailsScreen;
