import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaHome, FaBox, FaShoppingCart, FaMoneyBillWave, FaUsers } from 'react-icons/fa'; // Example icons

const BottomNavBar = () => {
  return (
    <Navbar bg='dark' variant='dark' fixed='bottom' className='d-lg-none'> {/* Hide on large screens */}
      <Container className='justify-content-around'>
        <LinkContainer to='/'>
          <Nav.Link className='text-center'>
            <FaHome size={20} /><br />
            <small>Dashboard</small>
          </Nav.Link>
        </LinkContainer>
        <LinkContainer to='/products'>
          <Nav.Link className='text-center'>
            <FaBox size={20} /><br />
            <small>Products</small>
          </Nav.Link>
        </LinkContainer>
        <LinkContainer to='/sales'>
          <Nav.Link className='text-center'>
            <FaShoppingCart size={20} /><br />
            <small>Sales</small>
          </Nav.Link>
        </LinkContainer>
        <LinkContainer to='/expenses'>
          <Nav.Link className='text-center'>
            <FaMoneyBillWave size={20} /><br />
            <small>Expenses</small>
          </Nav.Link>
        </LinkContainer>
        <LinkContainer to='/customers'>
          <Nav.Link className='text-center'>
            <FaUsers size={20} /><br />
            <small>Customers</small>
          </Nav.Link>
        </LinkContainer>
      </Container>
    </Navbar>
  );
};

export default BottomNavBar;