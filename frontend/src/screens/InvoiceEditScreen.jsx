import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Table, Card } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useCreateInvoiceMutation, useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from '../slices/invoicesApiSlice';
import { useGetCustomersQuery } from '../slices/customersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const InvoiceEditScreen = () => {
    const { id: invoiceId } = useParams();
    const isEditMode = !!invoiceId;
    const navigate = useNavigate();

    const [customer, setCustomer] = useState('');
    const [items, setItems] = useState([{ name: '', quantity: 1, price: 0, amount: 0 }]);
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [status, setStatus] = useState('Draft');
    const [notes, setNotes] = useState('');

    const { data: customers, isLoading: loadingCustomers } = useGetCustomersQuery();
    const { data: invoice, isLoading: loadingInvoice } = useGetInvoiceByIdQuery(invoiceId, {
        skip: !isEditMode,
    });

    const [createInvoice, { isLoading: loadingCreate }] = useCreateInvoiceMutation();
    const [updateInvoice, { isLoading: loadingUpdate }] = useUpdateInvoiceMutation();

    useEffect(() => {
        if (isEditMode && invoice) {
            setCustomer(invoice.customer._id);
            setItems(invoice.items);
            setIssueDate(new Date(invoice.issueDate).toISOString().split('T')[0]);
            setDueDate(new Date(invoice.dueDate).toISOString().split('T')[0]);
            setStatus(invoice.status);
            setNotes(invoice.notes);
        }
    }, [isEditMode, invoice]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-calculate amount
        if (field === 'quantity' || field === 'price') {
            newItems[index].amount = newItems[index].quantity * newItems[index].price;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1, price: 0, amount: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((acc, item) => acc + item.amount, 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.15; // Assuming 15% tax for now, can be configurable
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!customer) {
            toast.error('Please select a customer');
            return;
        }

        if (items.length === 0 || items.some(item => !item.name)) {
            toast.error('Please add at least one item with a name');
            return;
        }

        const invoiceData = {
            customer,
            items,
            subtotal: calculateSubtotal(),
            tax: calculateTax(),
            total: calculateTotal(),
            status,
            issueDate,
            dueDate,
            notes,
        };

        try {
            if (isEditMode) {
                await updateInvoice({ _id: invoiceId, ...invoiceData }).unwrap();
                toast.success('Invoice updated');
            } else {
                await createInvoice(invoiceData).unwrap();
                toast.success('Invoice created');
            }
            navigate('/invoices');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    if (loadingInvoice && isEditMode) return <Loader />;

    return (
        <Container>
            <Link to='/invoices' className='btn btn-light my-3'>
                <FaArrowLeft /> Go Back
            </Link>

            <h1>{isEditMode ? 'Edit Invoice' : 'Create Invoice'}</h1>

            <Form onSubmit={submitHandler}>
                <Row>
                    <Col md={8}>
                        <Card className='mb-4'>
                            <Card.Header>Invoice Details</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className='mb-3'>
                                            <Form.Label>Customer</Form.Label>
                                            {loadingCustomers ? (
                                                <Loader />
                                            ) : (
                                                <Form.Select
                                                    value={customer}
                                                    onChange={(e) => setCustomer(e.target.value)}
                                                    required
                                                >
                                                    <option value=''>Select Customer</option>
                                                    {customers?.map((c) => (
                                                        <option key={c._id} value={c._id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className='mb-3'>
                                            <Form.Label>Status</Form.Label>
                                            <Form.Select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                            >
                                                <option value='Draft'>Draft</option>
                                                <option value='Sent'>Sent</option>
                                                <option value='Paid'>Paid</option>
                                                <option value='Overdue'>Overdue</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className='mb-3'>
                                            <Form.Label>Issue Date</Form.Label>
                                            <Form.Control
                                                type='date'
                                                value={issueDate}
                                                onChange={(e) => setIssueDate(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className='mb-3'>
                                            <Form.Label>Due Date</Form.Label>
                                            <Form.Control
                                                type='date'
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className='mb-4'>
                            <Card.Header>Items</Card.Header>
                            <Card.Body>
                                <Table responsive borderless>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40%' }}>Item</th>
                                            <th style={{ width: '15%' }}>Qty</th>
                                            <th style={{ width: '20%' }}>Price</th>
                                            <th style={{ width: '20%' }}>Amount</th>
                                            <th style={{ width: '5%' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <Form.Control
                                                        type='text'
                                                        placeholder='Item name'
                                                        value={item.name}
                                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type='number'
                                                        min='1'
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type='number'
                                                        min='0'
                                                        step='0.01'
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type='number'
                                                        value={item.amount}
                                                        readOnly
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <Button
                                                        variant='danger'
                                                        size='sm'
                                                        onClick={() => removeItem(index)}
                                                        disabled={items.length === 1}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <Button variant='light' onClick={addItem} className='w-100'>
                                    <FaPlus /> Add Item
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className='mb-4'>
                            <Card.Header>Summary</Card.Header>
                            <Card.Body>
                                <Row className='mb-2'>
                                    <Col>Subtotal:</Col>
                                    <Col className='text-end'>ETB {calculateSubtotal().toFixed(2)}</Col>
                                </Row>
                                <Row className='mb-2'>
                                    <Col>Tax (15%):</Col>
                                    <Col className='text-end'>ETB {calculateTax().toFixed(2)}</Col>
                                </Row>
                                <hr />
                                <Row className='mb-3 fw-bold'>
                                    <Col>Total:</Col>
                                    <Col className='text-end'>ETB {calculateTotal().toFixed(2)}</Col>
                                </Row>

                                <Form.Group className='mb-3'>
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as='textarea'
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </Form.Group>

                                <Button
                                    type='submit'
                                    variant='primary'
                                    className='w-100'
                                    disabled={loadingCreate || loadingUpdate}
                                >
                                    <FaSave className='me-2' /> Save Invoice
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default InvoiceEditScreen;
