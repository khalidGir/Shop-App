import React, { useState } from 'react';
import { Container, Row, Col, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '../slices/expensesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const ExpensesScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'General',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  const { data: expenses, isLoading, error, refetch } = useGetExpensesQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  // Check permissions
  const userPermissions = userInfo?.roles?.flatMap((role) => role.permissions) || [];
  const canManageExpenses = true; // Temporarily allow all users until roles are set up

  const categories = ['General', 'Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Transportation', 'Other'];

  const handleShowModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
      });
    } else {
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: '',
        category: 'General',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await updateExpense({ id: editingExpense._id, ...formData }).unwrap();
        toast.success('Expense updated successfully');
      } else {
        await createExpense(formData).unwrap();
        toast.success('Expense added successfully');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id).unwrap();
        toast.success('Expense deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error || 'An error occurred');
      }
    }
  };

  const getTotalExpenses = () => {
    return expenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
  };

  return (
    <Container>
      <Row className='align-items-center mb-4'>
        <Col>
          <h1>Expenses</h1>
          <p className='text-muted'>
            Total Expenses: <strong>ETB {getTotalExpenses().toLocaleString()}</strong>
          </p>
        </Col>
        <Col className='text-end'>
          <Button
            variant='primary'
            onClick={() => {
              if (!canManageExpenses) {
                toast.warning('You need "manage_expenses" permission to add expenses.');
                return;
              }
              handleShowModal();
            }}
          >
            <FaPlus /> Add Expense
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
              <th>Description</th>
              <th>Category</th>
              <th>Amount (ETB)</th>
              <th>Recorded By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses?.length === 0 ? (
              <tr>
                <td colSpan={6} className='text-center'>
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses?.map((expense) => (
                <tr key={expense._id}>
                  <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                  <td>{expense.description}</td>
                  <td>
                    <Badge bg='secondary'>{expense.category}</Badge>
                  </td>
                  <td>{expense.amount.toLocaleString()}</td>
                  <td>{expense.user?.name || 'N/A'}</td>
                  <td>
                    <Button
                      variant='light'
                      size='sm'
                      className='me-2'
                      onClick={() => {
                        if (!canManageExpenses) {
                          toast.warning('You need "manage_expenses" permission to edit expenses.');
                          return;
                        }
                        handleShowModal(expense);
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant='danger'
                      size='sm'
                      onClick={() => {
                        if (!canManageExpenses) {
                          toast.warning('You need "manage_expenses" permission to delete expenses.');
                          return;
                        }
                        handleDelete(expense._id);
                      }}
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

      {/* Add/Edit Expense Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingExpense ? 'Edit Expense' : 'Add Expense'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter expense description'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Amount (ETB)</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='0.00'
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min='0'
                    step='0.01'
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label>Expense Date</Form.Label>
              <Form.Control
                type='date'
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant='primary' type='submit' disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Saving...' : editingExpense ? 'Update' : 'Add'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ExpensesScreen;