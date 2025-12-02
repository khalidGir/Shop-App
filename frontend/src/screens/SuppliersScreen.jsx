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
    Tabs,
    Tab,
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import {
    useGetSuppliersQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
    useGetSupplierProductsQuery,
} from '../slices/suppliersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const SuppliersScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Ethiopia',
        notes: '',
    });

    const { data: suppliers, isLoading, error, refetch } = useGetSuppliersQuery();
    const { data: supplierProducts } = useGetSupplierProductsQuery(selectedSupplier?._id, {
        skip: !selectedSupplier,
    });
    const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
    const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
    const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

    const filteredSuppliers = suppliers?.filter(
        (supplier) =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.phone?.includes(searchTerm)
    );

    const handleShowModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                contactPerson: supplier.contactPerson || '',
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address || '',
                city: supplier.city || '',
                country: supplier.country || 'Ethiopia',
                notes: supplier.notes || '',
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: 'Ethiopia',
                notes: '',
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await updateSupplier({ id: editingSupplier._id, ...formData }).unwrap();
                toast.success('Supplier updated successfully');
            } else {
                await createSupplier(formData).unwrap();
                toast.success('Supplier created successfully');
            }
            setShowModal(false);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error || 'An error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await deleteSupplier(id).unwrap();
                toast.success('Supplier deleted successfully');
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
                    <h1>Suppliers</h1>
                </Col>
                <Col className='text-end'>
                    <Button variant='primary' onClick={() => handleShowModal()}>
                        <FaPlus /> Add Supplier
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
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers?.length === 0 ? (
                            <tr>
                                <td colSpan={6} className='text-center'>
                                    No suppliers found
                                </td>
                            </tr>
                        ) : (
                            filteredSuppliers?.map((supplier) => (
                                <tr key={supplier._id}>
                                    <td>{supplier.name}</td>
                                    <td>{supplier.contactPerson || '-'}</td>
                                    <td>{supplier.email}</td>
                                    <td>{supplier.phone}</td>
                                    <td>{supplier.city || '-'}</td>
                                    <td>
                                        <Button
                                            variant='info'
                                            size='sm'
                                            className='me-2'
                                            onClick={() => {
                                                setSelectedSupplier(supplier);
                                                setShowDetailsModal(true);
                                            }}
                                        >
                                            <FaEye /> View
                                        </Button>
                                        <Button
                                            variant='light'
                                            size='sm'
                                            className='me-2'
                                            onClick={() => handleShowModal(supplier)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant='danger'
                                            size='sm'
                                            onClick={() => handleDelete(supplier._id)}
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

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Name *</Form.Label>
                                    <Form.Control
                                        type='text'
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Contact Person</Form.Label>
                                    <Form.Control
                                        type='text'
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type='email'
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Phone *</Form.Label>
                                    <Form.Control
                                        type='tel'
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className='mb-3'>
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type='text'
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type='text'
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant='primary' type='submit' disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? 'Saving...' : editingSupplier ? 'Update' : 'Create'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Supplier Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSupplier && (
                        <Tabs defaultActiveKey='info' className='mb-3'>
                            <Tab eventKey='info' title='Information'>
                                <Row>
                                    <Col md={6}>
                                        <p>
                                            <strong>Name:</strong> {selectedSupplier.name}
                                        </p>
                                        <p>
                                            <strong>Contact Person:</strong> {selectedSupplier.contactPerson || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {selectedSupplier.email}
                                        </p>
                                        <p>
                                            <strong>Phone:</strong> {selectedSupplier.phone}
                                        </p>
                                    </Col>
                                    <Col md={6}>
                                        <p>
                                            <strong>City:</strong> {selectedSupplier.city || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Address:</strong> {selectedSupplier.address || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Country:</strong> {selectedSupplier.country || 'N/A'}
                                        </p>
                                    </Col>
                                </Row>
                                {selectedSupplier.notes && (
                                    <Row>
                                        <Col>
                                            <p>
                                                <strong>Notes:</strong> {selectedSupplier.notes}
                                            </p>
                                        </Col>
                                    </Row>
                                )}
                            </Tab>
                            <Tab eventKey='products' title='Supplied Products'>
                                {supplierProducts ? (
                                    supplierProducts.length === 0 ? (
                                        <p className='text-muted'>No products linked yet</p>
                                    ) : (
                                        <Table striped bordered hover size='sm'>
                                            <thead>
                                                <tr>
                                                    <th>Product Name</th>
                                                    <th>Price (ETB)</th>
                                                    <th>Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {supplierProducts.map((product) => (
                                                    <tr key={product._id}>
                                                        <td>{product.name}</td>
                                                        <td>{product.price.toLocaleString()}</td>
                                                        <td>{product.countInStock}</td>
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
        </Container>
    );
};

export default SuppliersScreen;
