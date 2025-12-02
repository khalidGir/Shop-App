import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header>
      <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>BizMekina</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='me-auto'>
              {userInfo && (
                <>
                  <LinkContainer to='/products'>
                    <Nav.Link>Products</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/sales'>
                    <Nav.Link>Sales</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/expenses'>
                    <Nav.Link>Expenses</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/reports'>
                    <Nav.Link>Reports</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/customers'>
                    <Nav.Link>Customers</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/suppliers'>
                    <Nav.Link>Suppliers</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/purchases'>
                    <Nav.Link>Purchases</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/inventory'>
                    <Nav.Link>Inventory</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/invoices'>
                    <Nav.Link>Invoices</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
            <Nav className='ms-auto'>
              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id='username'>
                    <LinkContainer to='/profile'>
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to='/login'>
                    <Nav.Link>
                      <FaSignInAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/register'>
                    <Nav.Link>
                      <FaSignInAlt /> Register
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;