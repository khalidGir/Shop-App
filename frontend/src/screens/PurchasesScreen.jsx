import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Table,
    Button,
    Form,
    Modal,
    Badge,
    ListGroup,
    Card,
} from 'react-bootstrap';
import { FaPlus, FaEye, FaCheckCircle } from 'react-icons/fa';
import {
    useGetPurchasesQuery,
    useCreatePurchaseMutation,
    useReceivePurchaseMutation,
} from '../slices/purchasesApiSlice';
import { useGetSuppliersQuery } from '../slices/suppliersApiSlice';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const PurchasesScreen = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [purchaseItems, setPurchaseItems] = useState([]);
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const { data: purchases, isLoading, error, refetch } = useGetPurchasesQuery();
    const { data: suppliers } = useGetSuppliersQuery();
    const { data: products } = useGetProductsQuery();
    const [createPurchase, { isLoading: isCreating }] = useCreatePurchaseMutation();
    const [receivePurchase] = useReceivePurchaseMutation();

    const addPurchaseItem = (product) => {
        const existing = purchaseItems.find((item) => item.product === product._id);
        if (existing) {
            setPurchaseItems(
                purchaseItems.map((item) =>
                    item.product === product._id ? { ...item, quantity: item.quantity + 1 } : item
                )
            );
        } else {
            setPurchaseItems([
                ...purchaseItems,
                {
                    product: product._id,
                    name: product.name,
                    quantity: 1,
                    unitCost: product.price,
                },
            ]);
        }
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            setPurchaseItems(purchaseItems.filter((item) => item.product !== productId));
        } else {
            setPurchaseItems(
                purchaseItems.map((item) =>
                    item.product === productId ? { ...item, quantity } : item
                )
            );
        }
    };

    const updateUnitCost = (productId, unitCost) => {
        setPurchaseItems(
            purchaseItems.map((item) =>
                item.product === productId ? { ...item, unitCost: parseFloat(unitCost) || 0 } : item
            )
        );
    };

    const calculateTotal = () => {
        return purchaseItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
    };

    const handleCreatePurchase = async () => {
        if (!selectedSupplier) {
            toast.error('Please select a supplier');
            return;
        }
        if (purchaseItems.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        try {
            await createPurchase({
                supplier: selectedSupplier,
                purchaseItems,
                totalCost: calculateTotal(),
                purchaseDate,
                notes,
            }).unwrap();
            toast.success('Purchase order created successfully');
            setShowCreateModal(false);
            setSelectedSupplier('');
            setPurchaseItems([]);
            setNotes('');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleReceive = async (id) => {
        if (window.confirm('Mark this purchase as received? This will update inventory.')) {
            try {
                await receivePurchase(id).unwrap();
                toast.success('Purchase marked as received. Inventory updated!');
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
                    <h1>Purchase Orders</h1>
                </Col>
                <Col className='text-end'>
                    <Button variant='primary' onClick={() => setShowCreateModal(true)}>
                        <FaPlus /> New Purchase Order
                    </Button>
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
                            <th>Date</th>
                            <th>Supplier</th>
                            <th>Total Cost (ETB)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className='text-center'>
                                    No purchase orders found
                                </td>
                            </tr>
                        ) : (
                            purchases?.map((purchase) => (
                                <tr key={purchase._id}>
                                    <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                                    <td>{purchase.supplier?.name || 'N/A'}</td>
                                    <td>{purchase.totalCost?.toLocaleString()}</td>
                                    <td>
                                        {purchase.status === 'Received' ? (
                                            <Badge bg='success'>Received</Badge>
                                        ) : purchase.status === 'Cancelled' ? (
                                            <Badge bg='danger'>Cancelled</Badge>
                                        ) : (
                                            <Badge bg='warning' text='dark'>
                                                Pending
                                            </Badge>
                                        )}
                                    </td>
                                    <td>
                                        <Button
                                            variant='info'
                                            size='sm'
                                            className='me-2'
                                            onClick={() => {
                                                setSelectedPurchase(purchase);
                                                setShowDetailsModal(true);
                                            }}
                                        >
                                            <FaEye /> View
                                        </Button>
                                        {purchase.status === 'Pending' && (
                                            <Button
                                                variant='success'
                                                size='sm'
                                                onClick={() => handleReceive(purchase._id)}
                                            >
                                                <FaCheckCircle /> Receive
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {/* Create Purchase Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Create Purchase Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className='mb-3'>
                        <Form.Label>Supplier *</Form.Label>
                        <Form.Select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            required
                        >
                            <option value=''>Select Supplier</option>
                            {suppliers?.map((supplier) => (
                                <option key={supplier._id} value={supplier._id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                        <Form.Label>Purchase Date</Form.Label>
                        <Form.Control
                            type='date'
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                        />
                    </Form.Group>

                    <h5>Add Products</h5>
                    <Row>
                        <Col md={6}>
                            <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {products?.map((product) => (
                                    <ListGroup.Item
                                        key={product._id}
                                        action
                                        onClick={() => addPurchaseItem(product)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {product.name} - ETB {product.price}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>
                        <Col md={6}>
                            <h6>Purchase Items</h6>
                            {purchaseItems.length === 0 ? (
                                <p className='text-muted'>No items added</p>
                            ) : (
                                <ListGroup>
                                    {purchaseItems.map((item) => (
                                        <ListGroup.Item key={item.product}>
                                            <div className='mb-2'>
                                                <strong>{item.name}</strong>
                                            </div>
                                            <Row>
                                                <Col>
                                                    <Form.Label>Qty</Form.Label>
                                                    <Form.Control
                                                        type='number'
                                                        size='sm'
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateQuantity(item.product, parseInt(e.target.value))
                                                        }
                                                        min='1'
                                                    />
                                                </Col>
                                                <Col>
                                                    <Form.Label>Unit Cost</Form.Label>
                                                    <Form.Control
                                                        type='number'
                                                        size='sm'
                                                        value={item.unitCost}
                                                        onChange={(e) => updateUnitCost(item.product, e.target.value)}
                                                        min='0'
                                                    />
                                                </Col>
                                            </Row>
                                            <small>
                                                Subtotal: ETB {(item.quantity * item.unitCost).toLocaleString()}
                                            </small>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                            <Card className='mt-2'>
                                <Card.Body>
                                    <strong>Total: ETB {calculateTotal().toLocaleString()}</strong>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Form.Group className='mt-3'>
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                            as='textarea'
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowCreateModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='primary'
                        onClick={handleCreatePurchase}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create Purchase Order'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Purchase Order Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPurchase && (
                        <>
                            <p>
                                <strong>Supplier:</strong> {selectedPurchase.supplier?.name}
                            </p>
                            <p>
                                <strong>Date:</strong>{' '}
                                {new Date(selectedPurchase.purchaseDate).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Status:</strong>{' '}
                                <Badge
                                    bg={
                                        selectedPurchase.status === 'Received'
                                            ? 'success'
                                            : selectedPurchase.status === 'Cancelled'
                                                ? 'danger'
                                                : 'warning'
                                    }
                                >
                                    {selectedPurchase.status}
                                </Badge>
                            </p>
                            <h6>Items:</h6>
                            <ListGroup>
                                {selectedPurchase.purchaseItems?.map((item, index) => (
                                    <ListGroup.Item key={index}>
                                        {item.name} - Qty: {item.quantity} × ETB {item.unitCost} = ETB{' '}
                                        {(item.quantity * item.unitCost).toLocaleString()}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <Card className='mt-3'>
                                <Card.Body>
                                    <h5>Total: ETB {selectedPurchase.totalCost?.toLocaleString()}</h5>
                                </Card.Body>
                            </Card>
                            {selectedPurchase.notes && (
                                <p className='mt-2'>
                                    <strong>Notes:</strong> {selectedPurchase.notes}
                                </p>
                            )}
                        </>
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

export default PurchasesScreen;
