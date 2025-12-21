import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Table,
    Button,
    Form,
    InputGroup,
    Modal,
    Badge,
    Tabs,
    Tab,
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useGetCustomerOrdersQuery,
} from '../slices/customersApiSlice';
import { useRecordPaymentMutation, useGetCustomerPaymentsQuery } from '../slices/paymentsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const CustomersScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Ethiopia',
        notes: '',
        creditLimit: 0,
        currentBalance: 0,
    });
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const { data: customers, isLoading, error, refetch } = useGetCustomersQuery();
    const { data: customerOrders } = useGetCustomerOrdersQuery(selectedCustomer?._id, {
        skip: !selectedCustomer,
    });
    const { data: customerPayments, refetch: refetchPayments } = useGetCustomerPaymentsQuery(selectedCustomer?._id, {
        skip: !selectedCustomer,
    });
    const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
    const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
    const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();
    const [recordPayment, { isLoading: isRecordingPayment }] = useRecordPaymentMutation();

    // Filter customers by search term
    const filteredCustomers = customers?.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm)
    );

    const handleShowModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address || '',
                city: customer.city || '',
                postalCode: customer.postalCode || '',
                country: customer.country || 'Ethiopia',
                notes: customer.notes || '',
                creditLimit: customer.creditLimit || 0,
                currentBalance: customer.currentBalance || 0,
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postalCode: '',
                country: 'Ethiopia',
                notes: '',
                creditLimit: 0,
                currentBalance: 0,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await updateCustomer({ id: editingCustomer._id, ...formData }).unwrap();
                toast.success('Customer updated successfully');
            } else {
                await createCustomer(formData).unwrap();
                toast.success('Customer created successfully');
            }
            handleCloseModal();
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error || 'An error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await deleteCustomer(id).unwrap();
                toast.success('Customer deleted successfully');
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || err.error || 'An error occurred');
            }
        }
    };

    const handleViewDetails = (customer) => {
        setSelectedCustomer(customer);
        setShowDetailsModal(true);
    };

    const handleRecordPayment = async () => {
        try {
            await recordPayment({
                customer: selectedCustomer._id,
                amount: Number(paymentAmount),
                paymentMethod,
                paymentDate: new Date(),
                notes: 'Manual payment from Customer Details',
            }).unwrap();
            toast.success('Payment recorded successfully');
            setShowPaymentModal(false);
            setPaymentAmount(0);
            refetch(); // Refresh customer list for balance update
            refetchPayments(); // Refresh payment history
        } catch (err) {
            toast.error(err?.data?.message || err.error || 'Failed to record payment');
        }
    };

    return (
        <Container>
            <Row className='align-items-center mb-4'>
                <Col>
                    <h1>Customers</h1>
                </Col>
                <Col className='text-end'>
                    <Button variant='primary' onClick={() => handleShowModal()}>
                        <FaPlus /> Add Customer
                    </Button>
                </Col>
            </Row>

            <Row className='mb-3'>
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            type='text'
                            placeholder='Search by name, email, or phone...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>

            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error?.data?.message || error.error}</Message>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Balance (ETB)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className='text-center'>
                                    No customers found
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers?.map((customer) => (
                                <tr key={customer._id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.city || '-'}</td>
                                    <td>
                                        <Badge bg={customer.currentBalance > 0 ? 'danger' : 'success'}>
                                            {customer.currentBalance?.toLocaleString() || 0}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant='info'
                                            size='sm'
                                            className='me-2'
                                            onClick={() => handleViewDetails(customer)}
                                        >
                                            <FaEye /> View
                                        </Button>
                                        <Button
                                            variant='light'
                                            size='sm'
                                            className='me-2'
                                            onClick={() => handleShowModal(customer)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant='danger'
                                            size='sm'
                                            onClick={() => handleDelete(customer._id)}
                                            disabled={isDeleting}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {/* Add/Edit Customer Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Name *</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter customer name'
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type='email'
                                        placeholder='Enter email'
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Phone *</Form.Label>
                                    <Form.Control
                                        type='tel'
                                        placeholder='Enter phone number'
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter city'
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className='mb-3'>
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter address'
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Postal Code</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter postal code'
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control
                                        type='text'
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className='mb-3'>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                placeholder='Additional notes (optional)'
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Credit Limit</Form.Label>
                                    <Form.Control
                                        type='number'
                                        value={formData.creditLimit}
                                        onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Current Balance (Initial)</Form.Label>
                                    <Form.Control
                                        type='number'
                                        value={formData.currentBalance}
                                        onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                                        disabled={!!editingCustomer} // Only editable on creation or via payments/sales
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant='primary' type='submit' disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Customer Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Customer Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCustomer && (
                        <Tabs defaultActiveKey='info' className='mb-3'>
                            <Tab eventKey='info' title='Information'>
                                <Row>
                                    <Col md={6}>
                                        <p>
                                            <strong>Name:</strong> {selectedCustomer.name}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {selectedCustomer.email}
                                        </p>
                                        <p>
                                            <strong>Phone:</strong> {selectedCustomer.phone}
                                        </p>
                                    </Col>
                                    <Col md={6}>
                                        <p>
                                            <strong>City:</strong> {selectedCustomer.city || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Address:</strong> {selectedCustomer.address || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Country:</strong> {selectedCustomer.country || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Credit Limit:</strong> ETB {selectedCustomer.creditLimit?.toLocaleString()}
                                        </p>
                                        <p>
                                            <strong>Current Balance:</strong> <Badge bg={selectedCustomer.currentBalance > 0 ? 'danger' : 'success'}>ETB {selectedCustomer.currentBalance?.toLocaleString()}</Badge>
                                        </p>
                                        <Button variant='success' size='sm' onClick={() => setShowPaymentModal(true)}>
                                            Record Payment
                                        </Button>
                                    </Col>
                                </Row>
                                {selectedCustomer.notes && (
                                    <Row>
                                        <Col>
                                            <p>
                                                <strong>Notes:</strong> {selectedCustomer.notes}
                                            </p>
                                        </Col>
                                    </Row>
                                )}
                            </Tab>
                            <Tab eventKey='orders' title='Purchase History'>
                                {customerOrders ? (
                                    customerOrders.length === 0 ? (
                                        <p className='text-muted'>No orders yet</p>
                                    ) : (
                                        <Table striped bordered hover size='sm'>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Order ID</th>
                                                    <th>Total (ETB)</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customerOrders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td>{order._id.substring(0, 8)}...</td>
                                                        <td>{order.totalPrice?.toLocaleString()}</td>
                                                        <td>
                                                            {order.isPaid ? (
                                                                <Badge bg='success'>Paid</Badge>
                                                            ) : (
                                                                <Badge bg='warning' text='dark'>
                                                                    Unpaid
                                                                </Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )
                                ) : (
                                    <Loader />
                                )}
                            </Tab>
                            <Tab eventKey='payments' title='Payment History'>
                                {customerPayments ? (
                                    customerPayments.length === 0 ? (
                                        <p className='text-muted'>No payments recorded</p>
                                    ) : (
                                        <Table striped bordered hover size='sm'>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Amount (ETB)</th>
                                                    <th>Method</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customerPayments.map((payment) => (
                                                    <tr key={payment._id}>
                                                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                                        <td>{payment.amount.toLocaleString()}</td>
                                                        <td>{payment.paymentMethod}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )
                                ) : (
                                    <Loader />
                                )}
                            </Tab>
                        </Tabs>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Record Payment for {selectedCustomer?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className='mb-3'>
                        <Form.Label>Amount (ETB)</Form.Label>
                        <Form.Control
                            type='number'
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Payment Method</Form.Label>
                        <Form.Select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value='Cash'>Cash</option>
                            <option value='Bank Transfer'>Bank Transfer</option>
                            <option value='Mobile Money'>Mobile Money</option>
                            <option value='Check'>Check</option>
                            <option value='Other'>Other</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowPaymentModal(false)}>
                        Cancel
                    </Button>
                    <Button variant='primary' onClick={handleRecordPayment} disabled={isRecordingPayment || paymentAmount <= 0}>
                        {isRecordingPayment ? 'Recording...' : 'Record Payment'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CustomersScreen;
