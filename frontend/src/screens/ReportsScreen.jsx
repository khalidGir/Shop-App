import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Table,
  Badge,
  Tabs,
  Tab,
  Button,
  ProgressBar,
} from 'react-bootstrap';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaDownload, FaMoneyBillWave, FaFileInvoiceDollar, FaChartPie } from 'react-icons/fa';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { useGetExpensesQuery } from '../slices/expensesApiSlice';
import {
  useGetFinancialSummaryQuery,
  useGetCashFlowQuery,
  useGetReceivablesQuery,
  useGetPayablesQuery,
  useGetAgingReportQuery,
} from '../slices/financeApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportsScreen = () => {
  const [key, setKey] = useState('overview');
  const [dateRange, setDateRange] = useState('30'); // days

  // Existing queries
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetMyOrdersQuery();
  const { data: expenses, isLoading: expensesLoading, error: expensesError } = useGetExpensesQuery();

  // New financial queries
  const { data: financialSummary, isLoading: summaryLoading } = useGetFinancialSummaryQuery({
    startDate: new Date(new Date().setDate(new Date().getDate() - parseInt(dateRange))).toISOString(),
  });
  const { data: cashFlow, isLoading: cashFlowLoading } = useGetCashFlowQuery();
  const { data: receivables, isLoading: receivablesLoading } = useGetReceivablesQuery();
  const { data: payables, isLoading: payablesLoading } = useGetPayablesQuery();
  const { data: agingReport, isLoading: agingLoading } = useGetAgingReportQuery();

  // Filter data by date range for Overview tab
  const filterByDateRange = (items, dateField = 'createdAt') => {
    if (!items) return [];
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    return items.filter((item) => new Date(item[dateField]) >= daysAgo);
  };

  const filteredOrders = filterByDateRange(orders);
  const filteredExpenses = filterByDateRange(expenses, 'expenseDate');

  // Calculate metrics for Overview tab
  const totalRevenue = filteredOrders?.reduce((acc, order) => acc + (order.totalPrice || 0), 0) || 0;
  const totalExpenses = filteredExpenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
  const profit = totalRevenue - totalExpenses;
  const paidOrders = filteredOrders?.filter((order) => order.isPaid).length || 0;
  const unpaidOrders = filteredOrders?.filter((order) => !order.isPaid).length || 0;

  // Sales by day (last 7 days)
  const getLast7DaysData = () => {
    const days = [];
    const salesData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push(dateStr);

      const daySales = filteredOrders
        ?.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === date.toDateString();
        })
        .reduce((acc, order) => acc + (order.totalPrice || 0), 0) || 0;

      salesData.push(daySales);
    }

    return { days, salesData };
  };

  const { days, salesData } = getLast7DaysData();

  // Expense by category
  const getExpensesByCategory = () => {
    const categories = {};
    filteredExpenses?.forEach((expense) => {
      const cat = expense.category || 'General';
      categories[cat] = (categories[cat] || 0) + expense.amount;
    });
    return categories;
  };

  const expensesByCategory = getExpensesByCategory();

  // Chart data
  const salesChartData = {
    labels: days,
    datasets: [
      {
        label: 'Sales (ETB)',
        data: salesData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const expensePieData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Cash Flow Chart Data
  const cashFlowChartData = {
    labels: cashFlow?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'Inflow (Sales)',
        data: cashFlow?.map(item => item.inflow) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Outflow (Expenses + Purchases)',
        data: cashFlow?.map(item => item.outflow) || [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Export to CSV
  const exportFinancials = () => {
    if (!financialSummary) return;

    const rows = [
      ['Metric', 'Amount (ETB)'],
      ['Total Revenue', financialSummary.revenue],
      ['Cost of Goods Sold', financialSummary.cogs],
      ['Gross Profit', financialSummary.grossProfit],
      ['Operating Expenses', financialSummary.expenses],
      ['Net Profit', financialSummary.netProfit],
      [''],
      ['Receivables', receivables?.total || 0],
      ['Payables', payables?.total || 0],
    ];

    let csvContent = "data:text/csv;charset=utf-8,"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (ordersLoading || expensesLoading) return <Loader />;
  if (ordersError) return <Message variant='danger'>{ordersError?.data?.message || ordersError.error}</Message>;
  if (expensesError) return <Message variant='danger'>{expensesError?.data?.message || expensesError.error}</Message>;

  return (
    <Container>
      <Row className='align-items-center mb-4'>
        <Col>
          <h1>Reports & Analytics</h1>
        </Col>
        <Col md={3}>
          <Form.Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value='7'>Last 7 Days</option>
            <option value='30'>Last 30 Days</option>
            <option value='90'>Last 90 Days</option>
            <option value='365'>Last Year</option>
          </Form.Select>
        </Col>
      </Row>

      <Tabs
        id='reports-tabs'
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className='mb-4'
      >
        <Tab eventKey='overview' title='Overview'>
          {/* Summary Cards */}
          <Row className='mb-4'>
            <Col md={3}>
              <Card className='text-center h-100'>
                <Card.Body>
                  <Card.Title>Total Revenue</Card.Title>
                  <h3 className='text-success'>ETB {totalRevenue.toLocaleString()}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className='text-center h-100'>
                <Card.Body>
                  <Card.Title>Total Expenses</Card.Title>
                  <h3 className='text-danger'>ETB {totalExpenses.toLocaleString()}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className='text-center h-100'>
                <Card.Body>
                  <Card.Title>Net Profit</Card.Title>
                  <h3 className={profit >= 0 ? 'text-success' : 'text-danger'}>
                    ETB {profit.toLocaleString()}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className='text-center h-100'>
                <Card.Body>
                  <Card.Title>Total Orders</Card.Title>
                  <h3>{filteredOrders?.length || 0}</h3>
                  <small className='text-muted'>
                    {paidOrders} paid, {unpaidOrders} unpaid
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row className='mb-4'>
            <Col md={8}>
              <Card className='h-100'>
                <Card.Body>
                  <Card.Title>Sales Trend (Last 7 Days)</Card.Title>
                  <Bar data={salesChartData} options={chartOptions} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className='h-100'>
                <Card.Body>
                  <Card.Title>Expenses by Category</Card.Title>
                  {Object.keys(expensesByCategory).length > 0 ? (
                    <Pie data={expensePieData} options={chartOptions} />
                  ) : (
                    <p className='text-muted text-center'>No expense data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey='financials' title={<span><FaMoneyBillWave className='me-2' />Financials</span>}>
          {summaryLoading || cashFlowLoading || receivablesLoading || payablesLoading ? (
            <Loader />
          ) : (
            <>
              <Row className='mb-3'>
                <Col className='text-end'>
                  <Button variant='success' onClick={exportFinancials}>
                    <FaDownload className='me-2' /> Export CSV
                  </Button>
                </Col>
              </Row>

              {/* Financial Summary Cards */}
              <Row className='mb-4'>
                <Col md={4}>
                  <Card className='mb-3 border-primary'>
                    <Card.Body>
                      <Card.Title>Gross Profit</Card.Title>
                      <h2>ETB {financialSummary?.grossProfit?.toLocaleString()}</h2>
                      <div className='mt-3'>
                        <div className='d-flex justify-content-between text-muted small'>
                          <span>Revenue</span>
                          <span>ETB {financialSummary?.revenue?.toLocaleString()}</span>
                        </div>
                        <div className='d-flex justify-content-between text-muted small'>
                          <span>COGS (Purchases)</span>
                          <span>- ETB {financialSummary?.cogs?.toLocaleString()}</span>
                        </div>
                        <ProgressBar
                          now={(financialSummary?.grossProfit / financialSummary?.revenue) * 100}
                          variant='primary'
                          style={{ height: '5px' }}
                          className='mt-1'
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className='mb-3 border-danger'>
                    <Card.Body>
                      <Card.Title>Operating Expenses</Card.Title>
                      <h2 className='text-danger'>ETB {financialSummary?.expenses?.toLocaleString()}</h2>
                      <div className='mt-3'>
                        <div className='d-flex justify-content-between text-muted small'>
                          <span>% of Revenue</span>
                          <span>{((financialSummary?.expenses / financialSummary?.revenue) * 100).toFixed(1)}%</span>
                        </div>
                        <ProgressBar
                          now={(financialSummary?.expenses / financialSummary?.revenue) * 100}
                          variant='danger'
                          style={{ height: '5px' }}
                          className='mt-1'
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className='mb-3 border-success'>
                    <Card.Body>
                      <Card.Title>Net Profit</Card.Title>
                      <h2 className={financialSummary?.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                        ETB {financialSummary?.netProfit?.toLocaleString()}
                      </h2>
                      <div className='mt-3'>
                        <div className='d-flex justify-content-between text-muted small'>
                          <span>Net Margin</span>
                          <span>{((financialSummary?.netProfit / financialSummary?.revenue) * 100).toFixed(1)}%</span>
                        </div>
                        <ProgressBar
                          now={(financialSummary?.netProfit / financialSummary?.revenue) * 100}
                          variant='success'
                          style={{ height: '5px' }}
                          className='mt-1'
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Cash Flow Chart */}
              <Row className='mb-4'>
                <Col>
                  <Card>
                    <Card.Body>
                      <Card.Title>Cash Flow (Last 30 Days)</Card.Title>
                      <Line data={cashFlowChartData} options={chartOptions} />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Receivables & Payables */}
              <Row>
                <Col md={6}>
                  <Card className='h-100'>
                    <Card.Header className='bg-light'>
                      <FaFileInvoiceDollar className='me-2' />
                      Receivables (Unpaid Customer Orders)
                    </Card.Header>
                    <Card.Body>
                      <h4>Total: ETB {receivables?.total?.toLocaleString()}</h4>
                      <Table striped hover size='sm' responsive>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivables?.orders?.slice(0, 5).map(order => (
                            <tr key={order._id}>
                              <td>{order._id.substring(0, 8)}...</td>
                              <td>{order.user?.name || 'Guest'}</td>
                              <td>{order.totalPrice.toLocaleString()}</td>
                            </tr>
                          ))}
                          {receivables?.orders?.length === 0 && (
                            <tr><td colSpan={3} className='text-center'>No unpaid orders</td></tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className='h-100'>
                    <Card.Header className='bg-light'>
                      <FaChartPie className='me-2' />
                      Payables (Unpaid Supplier Purchases)
                    </Card.Header>
                    <Card.Body>
                      <h4>Total: ETB {payables?.total?.toLocaleString()}</h4>
                      <Table striped hover size='sm' responsive>
                        <thead>
                          <tr>
                            <th>Purchase ID</th>
                            <th>Supplier</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payables?.purchases?.slice(0, 5).map(purchase => (
                            <tr key={purchase._id}>
                              <td>{purchase._id.substring(0, 8)}...</td>
                              <td>{purchase.supplier?.name}</td>
                              <td>{purchase.totalCost.toLocaleString()}</td>
                            </tr>
                          ))}
                          {payables?.purchases?.length === 0 && (
                            <tr><td colSpan={3} className='text-center'>No unpaid purchases</td></tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Tab>

        <Tab eventKey='aging' title='Aging Report'>
          {agingLoading ? <Loader /> : (
            <Row>
              <Col>
                <Card>
                  <Card.Header>Accounts Receivable Aging (Overdue Invoices)</Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Days Overdue</th>
                          <th>Invoices</th>
                          <th>Total Amount (ETB)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agingReport && Object.entries(agingReport).map(([bucket, invoices]) => (
                          <tr key={bucket}>
                            <td><Badge bg='danger'>{bucket} Days</Badge></td>
                            <td>
                              {invoices.length > 0 ? (
                                <ul className='list-unstyled mb-0'>
                                  {invoices.map(inv => (
                                    <li key={inv._id}>
                                      <small>
                                        <strong>{inv.invoiceNumber}</strong> - {inv.customer?.name} (ETB {inv.total.toLocaleString()})
                                      </small>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className='text-muted'>No invoices</span>
                              )}
                            </td>
                            <td>
                              <strong>
                                ETB {invoices.reduce((acc, inv) => acc + inv.total, 0).toLocaleString()}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ReportsScreen;