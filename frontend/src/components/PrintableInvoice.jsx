import React from 'react';
import { Row, Col, Table } from 'react-bootstrap';

const PrintableInvoice = ({ invoice }) => {
    return (
        <div className='printable-invoice d-none d-print-block p-5'>
            {/* Header */}
            <Row className='mb-4'>
                <Col xs={6}>
                    <h1 className='text-primary'>INVOICE</h1>
                    <h5>#{invoice.invoiceNumber}</h5>
                </Col>
                <Col xs={6} className='text-end'>
                    <h3>ShopApp Inc.</h3>
                    <p>
                        123 Business Road<br />
                        Addis Ababa, Ethiopia<br />
                        Phone: +251 911 234 567<br />
                        Email: billing@shopapp.com
                    </p>
                </Col>
            </Row>

            {/* Bill To & Dates */}
            <Row className='mb-5'>
                <Col xs={6}>
                    <h5 className='text-muted'>Bill To:</h5>
                    <h4>{invoice.customer?.name}</h4>
                    <p>
                        {invoice.customer?.email}<br />
                        {invoice.customer?.phone}<br />
                        {invoice.customer?.address}
                    </p>
                </Col>
                <Col xs={6} className='text-end'>
                    <p>
                        <strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}<br />
                        <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}<br />
                        <strong>Status:</strong> {invoice.status}
                    </p>
                </Col>
            </Row>

            {/* Items */}
            <Table striped bordered className='mb-4'>
                <thead className='bg-light'>
                    <tr>
                        <th>Item Description</th>
                        <th className='text-center'>Qty</th>
                        <th className='text-end'>Price</th>
                        <th className='text-end'>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td className='text-center'>{item.quantity}</td>
                            <td className='text-end'>{item.price.toLocaleString()}</td>
                            <td className='text-end'>{item.amount.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Totals */}
            <Row>
                <Col xs={6}>
                    {invoice.notes && (
                        <div className='text-muted'>
                            <strong>Notes:</strong>
                            <p>{invoice.notes}</p>
                        </div>
                    )}
                </Col>
                <Col xs={6}>
                    <Table borderless size='sm'>
                        <tbody>
                            <tr>
                                <td className='text-end'><strong>Subtotal:</strong></td>
                                <td className='text-end'>ETB {invoice.subtotal.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className='text-end'><strong>Tax (15%):</strong></td>
                                <td className='text-end'>ETB {invoice.tax.toLocaleString()}</td>
                            </tr>
                            <tr className='border-top'>
                                <td className='text-end'><h4>Total:</h4></td>
                                <td className='text-end'><h4>ETB {invoice.total.toLocaleString()}</h4></td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>

            {/* Footer */}
            <div className='fixed-bottom p-4 text-center text-muted'>
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
};

export default PrintableInvoice;
