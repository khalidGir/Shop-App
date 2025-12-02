import React, { useState } from 'react';
import { Container, Row, Col, Table, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../slices/productsApiSlice';
import { useGetSuppliersQuery } from '../slices/suppliersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const ProductScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    countInStock: 0,
    unitType: 'pcs',
    minStock: 0,
    reorderPoint: 10,
    reorderQuantity: 50,
    supplier: null,
  });

  const { data: products, isLoading, error, refetch } = useGetProductsQuery();
  const { data: suppliers } = useGetSuppliersQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Check permissions
  const userPermissions = userInfo?.roles?.flatMap((role) => role.permissions) || [];
  const canCreateProducts = userPermissions.includes('products:create');
  const canUpdateProducts = userPermissions.includes('products:update');
  const canDeleteProducts = userPermissions.includes('products:delete');

  // Filter products by search term
  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        countInStock: product.countInStock,
        unitType: product.unitType,
        minStock: product.minStock || 0,
        reorderPoint: product.reorderPoint || 10,
        reorderQuantity: product.reorderQuantity || 50,
        supplier: product.supplier || null,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        countInStock: '',
        unitType: 'pcs',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...formData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createProduct(formData).unwrap();
        toast.success('Product created successfully');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error || 'An error occurred');
      }
    }
  };

  return (
    <Container>
      <Row className='align-items-center mb-4'>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className='text-end'>
          {canCreateProducts && (
            <Button
              variant='primary'
              onClick={() => handleShowModal()}
            >
              <FaPlus /> Add Product
            </Button>
          )}
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
              placeholder='Search products...'
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
              <th>Description</th>
              <th>Price (ETB)</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts?.length === 0 ? (
              <tr>
                <td colSpan={6} className='text-center'>
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts?.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.description || '-'}</td>
                  <td>{product.price.toLocaleString()}</td>
                  <td>
                    {product.countInStock}{' '}
                    {product.countInStock < 10 && (
                      <Badge bg='warning' text='dark'>
                        Low Stock
                      </Badge>
                    )}
                  </td>
                  <td>{product.unitType}</td>
                  <td>
                    {canUpdateProducts && (
                      <Button
                        variant='light'
                        size='sm'
                        className='me-2'
                        onClick={() => handleShowModal(product)}
                      >
                        <FaEdit />
                      </Button>
                    )}
                    {canDeleteProducts && (
                      <Button
                        variant='danger'
                        size='sm'
                        onClick={() => handleDelete(product._id)}
                        disabled={isDeleting}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className='mb-3'>
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter product name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Enter description (optional)'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Price (ETB)</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='0.00'
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min='0'
                    step='0.01'
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Unit Type</Form.Label>
                  <Form.Select
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                  >
                    <option value='pcs'>Pieces</option>
                    <option value='kg'>Kilograms</option>
                    <option value='m'>Meters</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type='number'
                placeholder='0'
                value={formData.countInStock}
                onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
                required
                min='0'
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Min Stock (Critical)</Form.Label>
                  <Form.Control
                    type='number'
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    min='0'
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Reorder Point (Warning)</Form.Label>
                  <Form.Control
                    type='number'
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                    min='0'
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label>Reorder Quantity</Form.Label>
                  <Form.Control
                    type='number'
                    value={formData.reorderQuantity}
                    onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
                    min='0'
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label>Supplier (Optional)</Form.Label>
              <Form.Select
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value || null })}
              >
                <option value=''>-- No Supplier --</option>
                {suppliers?.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant='primary' type='submit' disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductScreen;