import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  Card,
  Badge,
  Modal,
  ListGroup,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaCheckCircle, FaFileInvoice } from 'react-icons/fa';
import {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useUpdateOrderToPaidMutation,
} from '../slices/ordersApiSlice';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { useGetCustomersQuery } from '../slices/customersApiSlice';
import { useGenerateInvoiceFromOrderMutation } from '../slices/invoicesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const SalesScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'Ethiopia',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const { data: products } = useGetProductsQuery();
  const { data: customers } = useGetCustomersQuery();
  const { data: orders, isLoading, error, refetch } = useGetMyOrdersQuery();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [updateOrderToPaid] = useUpdateOrderToPaidMutation();
  const [generateInvoice, { isLoading: isGeneratingInvoice }] = useGenerateInvoiceFromOrderMutation();

  // Check permissions
  const userPermissions = userInfo?.roles?.flatMap((role) => role.permissions) || [];
  const canCreateOrders = true; // Temporarily allow all users until roles are set up

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((item) => item._id !== productId));
    } else {
      setCart(cart.map((item) => (item._id === productId ? { ...item, qty } : item)));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item._id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Validation: If no customer selected and no address provided (and address fields are shown), warn user.
    // If address fields are hidden and no customer, we'll assume Walk-in and use default/empty address if allowed.
    // For now, let's enforce address only if "Enter Custom Address" is checked or if we want to enforce it for everyone.
    // Let's relax it: If selectedCustomer is null and showAddressFields is false, we proceed with dummy data.

    if (!selectedCustomer && showAddressFields && (!customerInfo.address || !customerInfo.city)) {
      toast.error('Please fill in customer address');
      return;
    }

    // Credit Limit Check
    if (paymentMethod === 'Credit' && selectedCustomer) {
      const currentBalance = selectedCustomer.currentBalance || 0;
      const creditLimit = selectedCustomer.creditLimit || 0;
      const newTotal = calculateTotal();

      if (currentBalance + newTotal > creditLimit) {
        toast.error(`Credit limit exceeded! Limit: ${creditLimit}, Current Balance: ${currentBalance}, New Total: ${newTotal}`);
        return;
      }
    }

    try {
      const itemsPrice = calculateTotal();
      const taxPrice = 0; // No tax for now
      const shippingPrice = 0; // Free shipping
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      const orderData = {
        orderItems: cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          _id: item._id,
        })),
        customer: selectedCustomer?._id, // Add customer reference
        shippingAddress: selectedCustomer ? {
          address: selectedCustomer.address || 'Walk-in',
          city: selectedCustomer.city || 'Addis Ababa',
          postalCode: selectedCustomer.postalCode || '',
          country: selectedCustomer.country || 'Ethiopia',
        } : (showAddressFields ? customerInfo : {
          address: 'Walk-in Customer',
          city: 'Addis Ababa',
          postalCode: '0000',
          country: 'Ethiopia',
        }),
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      await createOrder(orderData).unwrap();
      toast.success('Order created successfully');
      setCart([]);
      setCustomerInfo({
        address: '',
        city: '',
        postalCode: '',
        country: 'Ethiopia',
      });
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to create order');
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      await updateOrderToPaid({
        id: orderId,
        id: 'manual-payment',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: userInfo?.email || '',
      }).unwrap();
      toast.success('Order marked as paid');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to update order');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedOrder) return;
    try {
      const res = await generateInvoice(selectedOrder._id).unwrap();
      toast.success('Invoice generated successfully');
      setShowDetailsModal(false);
      navigate(`/invoices/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to generate invoice');
    }
  };

  return (
    <Container>
      <Row className='align-items-center mb-4'>
        <Col>
          <h1>Sales & Orders</h1>
        </Col>
        <Col className='text-end'>
          <Button
            variant='primary'
            onClick={() => {
              if (!canCreateOrders) {
                toast.warning('You need "create_orders" permission to create sales.');
                return;
              }
              setShowCreateModal(true);
            }}
          >
            <FaPlus /> New Sale
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
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total (ETB)</th>
              <th>Payment</th>
              <th>Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.length === 0 ? (
              <tr>
                <td colSpan={7} className='text-center'>
                  No orders found
                </td>
              </tr>
            ) : (
              orders?.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}...</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.shippingAddress?.city || 'N/A'}</td>
                  <td>{order.totalPrice?.toLocaleString()}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    {order.isPaid ? (
                      <Badge bg='success'>Paid</Badge>
                    ) : (
                      <Badge bg='warning' text='dark'>
                        Unpaid
                      </Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      variant='info'
                      size='sm'
                      className='me-2'
                      onClick={() => viewOrderDetails(order)}
                    >
                      <FaEye /> View
                    </Button>
                    {!order.isPaid && (
                      <Button
                        variant='success'
                        size='sm'
                        onClick={() => handleMarkAsPaid(order._id)}
                      >
                        <FaCheckCircle /> Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Create Order Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Create New Sale</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h5>Select Products</h5>
              <Form.Control
                type="text"
                placeholder="Search products..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="mb-3"
              />
              <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {products?.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase())).map((product) => (
                  <ListGroup.Item
                    key={product._id}
                    action
                    onClick={() => addToCart(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className='d-flex justify-content-between'>
                      <span>{product.name}</span>
                      <span>ETB {product.price.toLocaleString()}</span>
                    </div>
                    <small className='text-muted'>Stock: {product.countInStock}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col md={6}>
              <h5>Cart</h5>
              {cart.length === 0 ? (
                <p className='text-muted'>No items in cart</p>
              ) : (
                <>
                  <ListGroup className='mb-3'>
                    {cart.map((item) => (
                      <ListGroup.Item key={item._id}>
                        <div className='d-flex justify-content-between align-items-center'>
                          <div>
                            <strong>{item.name}</strong>
                            <br />
                            <small>ETB {item.price.toLocaleString()} each</small>
                          </div>
                          <div className='d-flex align-items-center'>
                            <Button
                              size='sm'
                              variant='outline-secondary'
                              onClick={() => updateCartQty(item._id, item.qty - 1)}
                            >
                              -
                            </Button>
                            <span className='mx-2'>{item.qty}</span>
                            <Button
                              size='sm'
                              variant='outline-secondary'
                              onClick={() => updateCartQty(item._id, item.qty + 1)}
                            >
                              +
                            </Button>
                            <Button
                              size='sm'
                              variant='danger'
                              className='ms-2'
                              onClick={() => removeFromCart(item._id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <Card>
                    <Card.Body>
                      <h5>Total: ETB {calculateTotal().toLocaleString()}</h5>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Col>
          </Row>

          <hr />

          <hr />

          <h5>Customer Information</h5>
          <Form.Group className='mb-3'>
            <Form.Label>Select Existing Customer (Optional)</Form.Label>
            <Form.Select
              value={selectedCustomer?._id || ''}
              onChange={(e) => {
                const customer = customers?.find((c) => c._id === e.target.value);
                setSelectedCustomer(customer || null);
                if (customer) {
                  setCustomerInfo({
                    address: customer.address || '',
                    city: customer.city || '',
                    postalCode: customer.postalCode || '',
                    country: customer.country || 'Ethiopia',
                  });
                  setShowAddressFields(false);
                }
              }}
            >
              <option value=''>-- Walk-in Customer --</option>
              {customers?.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Enter Custom Address / Walk-in Details"
            checked={showAddressFields}
            onChange={(e) => setShowAddressFields(e.target.checked)}
            className="mb-3"
          />

          {showAddressFields && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type='text'
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, address: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type='text'
                      value={customerInfo.city}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, city: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type='text'
                      value={customerInfo.postalCode}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, postalCode: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}

          <Row>
            <Col md={12}>
              <Form.Group className='mb-3'>
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value='Cash'>Cash</option>
                  <option value='Bank Transfer'>Bank Transfer</option>
                  <option value='Mobile Money'>Mobile Money</option>
                  <option value='Credit'>Credit (Pay Later)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleCreateOrder}
            disabled={isCreating || cart.length === 0}
          >
            {isCreating ? 'Creating...' : 'Create Order'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p>
                <strong>Order ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {selectedOrder.isPaid ? (
                  <Badge bg='success'>Paid</Badge>
                ) : (
                  <Badge bg='warning' text='dark'>
                    Unpaid
                  </Badge>
                )}
              </p>

              <h5>Customer Address</h5>
              <p>
                {selectedOrder.shippingAddress?.address}
                <br />
                {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.postalCode}
                <br />
                {selectedOrder.shippingAddress?.country}
              </p>

              <h5>Order Items</h5>
              <ListGroup>
                {selectedOrder.orderItems?.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <div className='d-flex justify-content-between'>
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span>ETB {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <Card className='mt-3'>
                <Card.Body>
                  <h5>Total: ETB {selectedOrder.totalPrice?.toLocaleString()}</h5>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='primary'
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice}
            className='me-auto'
          >
            <FaFileInvoice className='me-2' />
            {isGeneratingInvoice ? 'Generating...' : 'Generate Invoice'}
          </Button>
          <Button variant='secondary' onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SalesScreen;