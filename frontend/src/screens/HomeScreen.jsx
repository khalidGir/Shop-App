import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardSummaryQuery } from '../slices/dashboardApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data: summary, isLoading, error } = useGetDashboardSummaryQuery();

  return (
    <Container>
      <h1>Welcome to BizMekina</h1>
      {userInfo ? (
        <p className='lead'>👋 Welcome back, {userInfo.name}!</p>
      ) : (
        <p className='lead'>👋 Welcome to BizMekina!</p>
      )}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className='my-4'>
            <Col md={6} lg={3} className='mb-3'>
              <Card className='text-center'>
                <Card.Body>
                  <Card.Title>Sales Today</Card.Title>
                  <Card.Text>
                    ETB {summary.totalRevenue?.toLocaleString() || 0}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className='mb-3'>
              <Card className='text-center'>
                <Card.Body>
                  <Card.Title>Expenses Today</Card.Title>
                  <Card.Text>
                    ETB {summary.totalExpenses?.toLocaleString() || 0}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className='mb-3'>
              <Card className='text-center'>
                <Card.Body>
                  <Card.Title>Profit</Card.Title>
                  <Card.Text>
                    ETB {summary.profit?.toLocaleString() || 0}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className='mb-3'>
              <Card className='text-center'>
                <Card.Body>
                  <Card.Title>Orders</Card.Title>
                  <Card.Text>{summary.orderCount || 0}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Quick Actions */}
      <Row className='my-4'>
        <Col className='d-flex justify-content-around'>
          <Button variant='primary' onClick={() => navigate('/sales')}>
            + Sale
          </Button>
          <Button variant='warning' onClick={() => navigate('/expenses')}>
            + Expense
          </Button>
          <Button variant='success' onClick={() => navigate('/products')}>
            + Product
          </Button>
        </Col>
      </Row>

      {/* Charts Section */}
      {/* <Row className='my-4'>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Sales vs. Expenses (This Week)</Card.Title>
              <Bar data={salesVsExpensesData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className='my-4'>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Profit Trend (Last 30 Days)</Card.Title>
              <Line data={profitTrendData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
    </Container>
  );
};

export default HomeScreen;
