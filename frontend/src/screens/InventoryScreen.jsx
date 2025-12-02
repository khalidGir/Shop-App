import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Tab,
    Tabs,
    Table,
    Badge,
    Button,
    Card,
    ProgressBar,
    Form,
    InputGroup,
} from 'react-bootstrap';
import {
    FaExclamationTriangle,
    FaHistory,
    FaLightbulb,
    FaChartLine,
    FaShoppingCart,
    FaSearch,
    FaFilter,
} from 'react-icons/fa';
import {
    useGetLowStockAlertsQuery,
    useGetReorderSuggestionsQuery,
    useGetStockTurnoverQuery,
    useGetInventoryValueQuery,
    useGetStockLevelsQuery,
} from '../slices/inventoryApiSlice';
import { useGetStockMovementsQuery } from '../slices/stockMovementsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Link } from 'react-router-dom';

const InventoryScreen = () => {
    const [key, setKey] = useState('alerts');
    const [movementFilter, setMovementFilter] = useState({ type: '', productId: '' });

    // Fetch data for all tabs
    const { data: alerts, isLoading: loadingAlerts } = useGetLowStockAlertsQuery();
    const { data: suggestions, isLoading: loadingSuggestions } = useGetReorderSuggestionsQuery();
    const { data: turnover, isLoading: loadingTurnover } = useGetStockTurnoverQuery(90);
    const { data: value, isLoading: loadingValue } = useGetInventoryValueQuery();
    const { data: movements, isLoading: loadingMovements } = useGetStockMovementsQuery(movementFilter);

    return (
        <Container>
            <Row className='align-items-center mb-4'>
                <Col>
                    <h1>Inventory Management</h1>
                </Col>
            </Row>

            <Tabs
                id='inventory-tabs'
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className='mb-4'
            >
                {/* Tab 1: Low Stock Alerts */}
                <Tab
                    eventKey='alerts'
                    title={
                        <span>
                            <FaExclamationTriangle className='me-2' />
                            Alerts
                            {alerts?.total > 0 && (
                                <Badge bg='danger' className='ms-2'>
                                    {alerts.total}
                                </Badge>
                            )}
                        </span>
                    }
                >
                    {loadingAlerts ? (
                        <Loader />
                    ) : (
                        <>
                            <Row className='mb-4'>
                                <Col md={4}>
                                    <Card className='text-center h-100 border-danger'>
                                        <Card.Body>
                                            <h3>{alerts?.critical?.length || 0}</h3>
                                            <Card.Text>Critical Items</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className='text-center h-100 border-warning'>
                                        <Card.Body>
                                            <h3>{alerts?.warning?.length || 0}</h3>
                                            <Card.Text>Warning Items</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className='text-center h-100 border-success'>
                                        <Card.Body>
                                            <h3>{alerts?.total || 0}</h3>
                                            <Card.Text>Total Alerts</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <h3>Critical Stock (Below Minimum)</h3>
                            <Table striped bordered hover responsive className='mb-4'>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Supplier</th>
                                        <th>Current Stock</th>
                                        <th>Min Stock</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts?.critical?.map((product) => (
                                        <tr key={product._id}>
                                            <td>{product.name}</td>
                                            <td>{product.supplier?.name || 'N/A'}</td>
                                            <td className='text-danger fw-bold'>{product.countInStock}</td>
                                            <td>{product.minStock}</td>
                                            <td>
                                                <Badge bg='danger'>Critical</Badge>
                                            </td>
                                            <td>
                                                <Link to='/purchases'>
                                                    <Button variant='outline-primary' size='sm'>
                                                        <FaShoppingCart /> Reorder
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {alerts?.critical?.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className='text-center'>
                                                No critical items
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            <h3>Low Stock (Below Reorder Point)</h3>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Supplier</th>
                                        <th>Current Stock</th>
                                        <th>Reorder Point</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts?.warning?.map((product) => (
                                        <tr key={product._id}>
                                            <td>{product.name}</td>
                                            <td>{product.supplier?.name || 'N/A'}</td>
                                            <td className='text-warning fw-bold'>{product.countInStock}</td>
                                            <td>{product.reorderPoint}</td>
                                            <td>
                                                <Badge bg='warning' text='dark'>
                                                    Low
                                                </Badge>
                                            </td>
                                            <td>
                                                <Link to='/purchases'>
                                                    <Button variant='outline-primary' size='sm'>
                                                        <FaShoppingCart /> Reorder
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {alerts?.warning?.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className='text-center'>
                                                No low stock items
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Tab>

                {/* Tab 2: Stock Movements */}
                <Tab
                    eventKey='movements'
                    title={
                        <span>
                            <FaHistory className='me-2' />
                            Movements
                        </span>
                    }
                >
                    <Row className='mb-3'>
                        <Col md={4}>
                            <Form.Select
                                value={movementFilter.type}
                                onChange={(e) => setMovementFilter({ ...movementFilter, type: e.target.value })}
                            >
                                <option value=''>All Types</option>
                                <option value='Sale'>Sale</option>
                                <option value='Purchase'>Purchase</option>
                                <option value='Adjustment'>Adjustment</option>
                                <option value='Return'>Return</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    {loadingMovements ? (
                        <Loader />
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Stock Change</th>
                                    <th>Reason</th>
                                    <th>User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements?.map((movement) => (
                                    <tr key={movement._id}>
                                        <td>{new Date(movement.createdAt).toLocaleString()}</td>
                                        <td>{movement.product?.name}</td>
                                        <td>
                                            <Badge
                                                bg={
                                                    movement.type === 'Purchase'
                                                        ? 'success'
                                                        : movement.type === 'Sale'
                                                            ? 'info'
                                                            : 'warning'
                                                }
                                            >
                                                {movement.type}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    movement.quantity > 0 ? 'text-success' : 'text-danger'
                                                }
                                            >
                                                {movement.quantity > 0 ? '+' : ''}
                                                {movement.quantity}
                                            </span>
                                        </td>
                                        <td>
                                            {movement.previousStock} → {movement.newStock}
                                        </td>
                                        <td>{movement.reason || '-'}</td>
                                        <td>{movement.createdBy?.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Tab>

                {/* Tab 3: Reorder Suggestions */}
                <Tab
                    eventKey='suggestions'
                    title={
                        <span>
                            <FaLightbulb className='me-2' />
                            Suggestions
                        </span>
                    }
                >
                    {loadingSuggestions ? (
                        <Loader />
                    ) : (
                        <>
                            <Message variant='info'>
                                Suggestions are based on sales velocity from the last 30 days.
                            </Message>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Current Stock</th>
                                        <th>Avg Daily Sales</th>
                                        <th>Days Remaining</th>
                                        <th>Suggested Order</th>
                                        <th>Urgency</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suggestions?.map((item) => (
                                        <tr key={item.product._id}>
                                            <td>{item.product.name}</td>
                                            <td>{item.product.currentStock}</td>
                                            <td>{item.analytics.avgDailySales}</td>
                                            <td>
                                                <span
                                                    className={
                                                        item.analytics.daysOfStockRemaining < 7
                                                            ? 'text-danger fw-bold'
                                                            : 'text-warning'
                                                    }
                                                >
                                                    {item.analytics.daysOfStockRemaining} days
                                                </span>
                                            </td>
                                            <td>{item.analytics.suggestedQuantity} units</td>
                                            <td>
                                                <Badge
                                                    bg={item.analytics.urgency === 'high' ? 'danger' : 'warning'}
                                                >
                                                    {item.analytics.urgency.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Link to='/purchases'>
                                                    <Button variant='primary' size='sm'>
                                                        Order Now
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {suggestions?.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className='text-center'>
                                                No reorder suggestions at this time.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Tab>

                {/* Tab 4: Analytics */}
                <Tab
                    eventKey='analytics'
                    title={
                        <span>
                            <FaChartLine className='me-2' />
                            Analytics
                        </span>
                    }
                >
                    {loadingValue || loadingTurnover ? (
                        <Loader />
                    ) : (
                        <>
                            <Row className='mb-4'>
                                <Col md={6}>
                                    <Card className='mb-3'>
                                        <Card.Header>Inventory Value</Card.Header>
                                        <Card.Body>
                                            <h2>ETB {value?.totalValue?.toLocaleString()}</h2>
                                            <p>Total Units: {value?.totalUnits?.toLocaleString()}</p>
                                            <p>Unique Products: {value?.productCount}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className='mb-3'>
                                        <Card.Header>Top Products by Value</Card.Header>
                                        <Card.Body>
                                            {value?.products?.slice(0, 5).map((p) => (
                                                <div key={p.product._id} className='mb-2'>
                                                    <div className='d-flex justify-content-between'>
                                                        <span>{p.product.name}</span>
                                                        <span>ETB {p.value.toLocaleString()}</span>
                                                    </div>
                                                    <ProgressBar
                                                        now={(p.value / value.totalValue) * 100}
                                                        variant='info'
                                                        style={{ height: '5px' }}
                                                    />
                                                </div>
                                            ))}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <h3>Stock Turnover (Last 90 Days)</h3>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Units Sold</th>
                                        <th>Avg Inventory</th>
                                        <th>Turnover Rate</th>
                                        <th>Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {turnover?.slice(0, 10).map((item) => (
                                        <tr key={item.product._id}>
                                            <td>{item.product.name}</td>
                                            <td>{item.totalSold}</td>
                                            <td>{item.product.currentStock}</td>
                                            <td>{item.turnoverRate}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        item.category === 'fast-moving'
                                                            ? 'success'
                                                            : item.category === 'medium-moving'
                                                                ? 'info'
                                                                : 'warning'
                                                    }
                                                >
                                                    {item.category}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default InventoryScreen;
