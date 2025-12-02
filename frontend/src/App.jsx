import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import LoginPage from './screens/LoginPage';
import RegisterPage from './screens/RegisterPage';
import ProductScreen from './screens/ProductScreen';
import SalesScreen from './screens/SalesScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import ReportsScreen from './screens/ReportsScreen';
import CustomersScreen from './screens/CustomersScreen';
import SuppliersScreen from './screens/SuppliersScreen';
import PurchasesScreen from './screens/PurchasesScreen';
import InventoryScreen from './screens/InventoryScreen';
import InvoicesScreen from './screens/InvoicesScreen';
import InvoiceEditScreen from './screens/InvoiceEditScreen';
import InvoiceDetailsScreen from './screens/InvoiceDetailsScreen';
import BottomNavBar from './components/BottomNavBar';
import ProfileScreen from './screens/ProfileScreen'; // Import ProfileScreen

const App = () => {
  return (
    <Router>
      <Header />
      <main className='py-3 pb-5'>
        <Container>
          <Routes>
            <Route path='/' element={<HomeScreen />} exact />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/profile' element={<ProfileScreen />} /> {/* Add Profile Route */}
            <Route path='/products' element={<ProductScreen />} />
            <Route path='/sales' element={<SalesScreen />} />
            <Route path='/expenses' element={<ExpensesScreen />} />
            <Route path='/reports' element={<ReportsScreen />} />
            <Route path='/customers' element={<CustomersScreen />} />
            <Route path='/suppliers' element={<SuppliersScreen />} />
            <Route path='/purchases' element={<PurchasesScreen />} />
            <Route path='/inventory' element={<InventoryScreen />} />
            <Route path='/invoices' element={<InvoicesScreen />} />
            <Route path='/invoices/create' element={<InvoiceEditScreen />} />
            <Route path='/invoices/:id' element={<InvoiceDetailsScreen />} />
            <Route path='/invoices/:id/edit' element={<InvoiceEditScreen />} />
          </Routes>
        </Container>
      </main>
      <BottomNavBar />
      <Footer />
    </Router>
  );
};

export default App;