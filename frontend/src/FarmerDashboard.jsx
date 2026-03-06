import React, { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col, Card, Form, Badge, Nav, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop';

const CATEGORIZED_CATALOG = {
    'Vegetables': [
        { name: 'Tomato', image: '/product-images/tomato.png' },
        { name: 'Potato', image: '/product-images/potato.png' },
        { name: 'Carrot', image: '/product-images/carrot.png' },
        { name: 'Onion', image: '/product-images/onion.png' },
        { name: 'Corn', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop' },
        { name: 'Cucumber', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&auto=format&fit=crop' },
        { name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop' },
        { name: 'Garlic', image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&auto=format&fit=crop' },
        { name: 'Ginger', image: 'https://images.unsplash.com/photo-1599940824399-b88bf9260790?w=400&auto=format&fit=crop' },
        { name: 'Brinjal', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&auto=format&fit=crop' },
        { name: 'Cabbage', image: '/product-images/cabbage.png' },
        { name: 'Cauliflower', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&auto=format&fit=crop' },
        { name: 'Broccoli', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bef?w=400&auto=format&fit=crop' }
    ],
    'Fruits': [
        { name: 'Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60' },
        { name: 'Banana', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&auto=format&fit=crop&q=60' },
        { name: 'Mango', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=60' },
        { name: 'Grapes', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=60' },
        { name: 'Papaya', image: 'https://images.unsplash.com/photo-1525059337994-6f2a1311b4d4?w=500&auto=format&fit=crop&q=60' },
        { name: 'Watermelon', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=60' },
        { name: 'Pineapple', image: 'https://images.unsplash.com/photo-1550258114-b8a275a5a141?w=500&auto=format&fit=crop&q=60' },
        { name: 'Pomegranate', image: 'https://images.unsplash.com/photo-1615485925600-9a4f2f0a109a?w=500&auto=format&fit=crop&q=60' },
        { name: 'Guava', image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500&auto=format&fit=crop&q=60' }
    ],
    'Grains & Pulses': [
        { name: 'Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60' },
        { name: 'Wheat', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60' },
        { name: 'Peanut', image: 'https://images.unsplash.com/photo-1565261486716-e82df4b68453?w=500&auto=format&fit=crop&q=60' },
        { name: 'Soybean', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60' },
        { name: 'Lentils (Dal)', image: 'https://images.unsplash.com/photo-1585994192716-e82df4b68453?w=500&auto=format&fit=crop&q=60' },
        { name: 'Chickpeas', image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e2?w=500&auto=format&fit=crop&q=60' },
        { name: 'Mustard Seeds', image: 'https://images.unsplash.com/photo-1588253584673-c7011d871781?w=500&auto=format&fit=crop&q=60' }
    ],
    'Spices': [
        { name: 'Turmeric', image: 'https://images.unsplash.com/photo-1615485925600-9a4f2f0a109a?w=500&auto=format&fit=crop&q=60' },
        { name: 'Black Pepper', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=60' },
        { name: 'Cardamom', image: 'https://images.unsplash.com/photo-1599940824399-b88bf9260790?w=500&auto=format&fit=crop&q=60' },
        { name: 'Chilli', image: 'https://images.unsplash.com/photo-1564669047070-0abb87f7bdc1?w=500&auto=format&fit=crop&q=60' }
    ],
    'Dairy & Others': [
        { name: 'Milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60' },
        { name: 'Eggs', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=60' },
        { name: 'Sugarcane', image: 'https://images.unsplash.com/photo-1627731705609-b6b5535c361e?w=500&auto=format&fit=crop' }
    ]
};

const getUnitForProduct = (name) => {
    const n = name.toLowerCase();
    if (n.includes('milk') || n.includes('curd') || n.includes('oil') || n.includes('ghee')) return 'liters';
    if (n.includes('egg')) return 'count';
    return 'kg';
};

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [incomingOrders, setIncomingOrders] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // Array of items from catalog
    const [itemDetails, setItemDetails] = useState({}); // { itemName: { price, quantity, description } }

    // New state for custom product form
    const [customProduct, setCustomProduct] = useState({
        name: '',
        price: '',
        quantity: '',
        description: '',
        imageUrl: '',
        unit: 'kg'
    });
    const [uploading, setUploading] = useState(false);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyProducts();
        fetchIncomingOrders();
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setUserProfile(res.data);
        } catch (err) {
            console.error("Error fetching profile", err);
        }
    };

    const fetchMyProducts = async () => {
        try {
            const response = await api.get('/products/my-products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const fetchIncomingOrders = async () => {
        try {
            const response = await api.get('/orders/farmer-orders');
            setIncomingOrders(response.data);
        } catch (error) {
            console.error('Error fetching incoming orders', error);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status?status=${newStatus}`);
            fetchIncomingOrders();
            alert(t('order_no') + orderId + ' ' + t(newStatus.toLowerCase()) + ' successfully!');
        } catch (error) {
            console.error('Error updating status', error);
            alert(t('failed_confirm_delivery'));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/products/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCustomProduct({ ...customProduct, imageUrl: res.data.imageUrl });
            setUploading(false);
        } catch (err) {
            console.error('Upload failed', err);
            alert(t('failed_load_orders'));
            setUploading(false);
        }
    };

    const upiPendingCount = incomingOrders.filter(item =>
        item.order.status === 'PENDING' && item.order.paymentMethod === 'UPI'
    ).length;

    const handleSelectProduct = (item) => {
        const isSelected = selectedItems.find(i => i.name === item.name);
        if (isSelected) {
            setSelectedItems(selectedItems.filter(i => i.name !== item.name));
            const newDetails = { ...itemDetails };
            delete newDetails[item.name];
            setItemDetails(newDetails);
        } else {
            setSelectedItems([...selectedItems, item]);
            setItemDetails({
                ...itemDetails,
                [item.name]: { price: '', quantity: '', description: '', unit: getUnitForProduct(item.name) }
            });
        }
    };

    const handleDetailChange = (itemName, field, value) => {
        setItemDetails({
            ...itemDetails,
            [itemName]: { ...itemDetails[itemName], [field]: value }
        });
    };

    const handleAddProducts = async (e) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            alert(t('select_all'));
            return;
        }

        try {
            const promises = selectedItems.map(item => {
                const details = itemDetails[item.name];
                const price = parseFloat(details.price);
                const quantity = parseInt(details.quantity);

                if (isNaN(price) || price < 0) throw new Error(`Invalid price for ${item.name}`);
                if (isNaN(quantity) || quantity < 1) throw new Error(`Invalid quantity for ${item.name}. Minimum is 1.`);

                return api.post('/products', {
                    name: item.name,
                    imageUrl: item.image,
                    description: details.description || `Fresh ${item.name} directly from farm.`,
                    price: parseFloat(details.price),
                    quantity: parseInt(details.quantity),
                    unit: details.unit || 'kg'
                });
            });

            await Promise.all(promises);
            setSelectedItems([]);
            setItemDetails({});
            fetchMyProducts();
            alert(t('profile_updated'));
        } catch (error) {
            console.error('Error adding products', error);
            alert(t('failed_confirm_delivery'));
        }
    };

    const handleAddCustomProduct = async (e) => {
        e.preventDefault();
        const price = parseFloat(customProduct.price);
        const quantity = parseInt(customProduct.quantity);

        if (isNaN(price) || price < 0) {
            alert("Price must be 0 or greater.");
            return;
        }
        if (isNaN(quantity) || quantity < 1) {
            alert("Quantity must be 1 or greater.");
            return;
        }

        try {
            await api.post('/products', {
                ...customProduct,
                price: price,
                quantity: quantity,
                unit: customProduct.unit
            });
            setCustomProduct({ name: '', price: '', quantity: '', description: '', imageUrl: '', unit: 'kg' });
            setShowCustomForm(false);
            fetchMyProducts();
            alert(t('profile_updated'));
        } catch (error) {
            console.error('Error adding custom product', error);
            alert(t('failed_confirm_delivery'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_cancel_msg'))) {
            try {
                await api.delete(`/products/${id}`);
                fetchMyProducts();
            } catch (error) {
                console.error('Error deleting product', error);
            }
        }
    };

    return (
        <div className="dashboard-container bg-light min-vh-100 py-4">
            <Container>
                {!userProfile?.bankAccountNumber && (
                    <Alert variant="danger" className="mb-4 border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex align-items-center">
                            <div className="fs-1 me-4">⚠️</div>
                            <div>
                                <h4 className="fw-bold mb-2">{t('bank_missing')}</h4>
                                <p className="mb-3">{t('bank_missing_desc')}</p>
                                <Button variant="danger" size="sm" className="fw-bold px-4 rounded-pill" onClick={() => navigate('/bank-details')}>
                                    {t('bank_account')}
                                </Button>
                            </div>
                        </div>
                    </Alert>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold text-success mb-1">{t('farmer_dashboard')}</h2>
                        <p className="text-muted">{t('welcome')}, {user?.username}!</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {upiPendingCount > 0 && (
                            <Alert variant="warning" className="mb-0 py-2 px-3 rounded-pill border-0 shadow-sm animate__animated animate__pulse animate__infinite">
                                🔔 <strong>{upiPendingCount}</strong> New UPI Payment{upiPendingCount > 1 ? 's' : ''} to verify!
                            </Alert>
                        )}
                        <Button
                            variant="success"
                            className="rounded-pill px-4 shadow-sm"
                            onClick={() => setShowCustomForm(!showCustomForm)}
                            disabled={!userProfile?.bankAccountNumber}
                        >
                            {showCustomForm ? t('close_form') : t('add_new_product')}
                        </Button>
                    </div>
                </div>

                {/* Custom Product Form */}
                {showCustomForm && userProfile?.bankAccountNumber && (
                    <Card className="shadow-sm border-0 mb-5 animate__animated animate__fadeIn">
                        <Card.Body className="p-4">
                            <h4 className="mb-4 fw-bold">{t('list_new_product')}</h4>
                            <Form onSubmit={handleAddCustomProduct}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('product_name')}</Form.Label>
                                            <Form.Control
                                                placeholder="..."
                                                value={customProduct.name}
                                                onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('price')} (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={customProduct.price}
                                                onChange={(e) => setCustomProduct({ ...customProduct, price: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('quantity')}</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={customProduct.quantity}
                                                onChange={(e) => setCustomProduct({ ...customProduct, quantity: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('unit')}</Form.Label>
                                            <Form.Select
                                                value={customProduct.unit}
                                                onChange={(e) => setCustomProduct({ ...customProduct, unit: e.target.value })}
                                            >
                                                <option value="kg">{t('unit_kg') || 'kg'}</option>
                                                <option value="liters">{t('unit_liters') || 'liters'}</option>
                                                <option value="count">{t('unit_count') || 'count'}</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">{t('photo')}</Form.Label>
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="image-preview border rounded-3 d-flex align-items-center justify-content-center bg-light"
                                            style={{ width: '100px', height: '100px', overflow: 'hidden' }}
                                        >
                                            {customProduct.imageUrl ? (
                                                <img src={customProduct.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span className="text-muted small">No Photo</span>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={handleImageUpload}
                                                className="mb-2"
                                            />
                                            <Form.Text className="text-muted">{t('upload_hint') || 'Take a photo or upload a file.'}</Form.Text>
                                        </div>
                                    </div>
                                    {uploading && <div className="mt-2 small text-success">{t('uploading')}</div>}
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>{t('description')}</Form.Label>
                                    <Form.Control
                                        as="textarea" rows={2}
                                        value={customProduct.description}
                                        onChange={(e) => setCustomProduct({ ...customProduct, description: e.target.value })}
                                    />
                                </Form.Group>
                                <div className="text-end">
                                    <Button variant="success" type="submit" className="px-5 py-2 fw-bold">{t('publish_btn')}</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                )}

                {/* Catalog Section */}
                <div className="mb-5">
                    <h3 className="fw-bold mb-3">{t('catalog_add')}</h3>
                    <div className="bg-white p-4 rounded-3 shadow-sm overflow-auto" style={{ maxHeight: '400px' }}>
                        {Object.entries(CATEGORIZED_CATALOG).map(([category, items]) => (
                            <div key={category} className="mb-4">
                                <h6 className="text-uppercase text-muted fw-bold mb-3">
                                    {category === 'Vegetables' ? t('cat_veg') : category === 'Fruits' ? t('cat_fruits') : category === 'Grains & Pulses' ? t('cat_grains') : category === 'Spices' ? t('cat_spices') : category === 'Dairy & Others' ? t('cat_dairy') : category}
                                </h6>
                                <div className="d-flex gap-3 overflow-auto pb-2">
                                    {items.map((item, index) => {
                                        const isSelected = selectedItems.find(i => i.name === item.name);
                                        return (
                                            <div
                                                key={index}
                                                className={`catalog-card text-center p-2 rounded-3 border ${isSelected ? 'border-success bg-light' : 'bg-white'}`}
                                                onClick={() => handleSelectProduct(item)}
                                                style={{ minWidth: '120px', cursor: 'pointer' }}
                                            >
                                                <img src={item.image} alt={item.name} className="rounded mb-2" style={{ width: '80px', height: '80px', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                                                <div className="small fw-bold">{t(item.name)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Publication Row (from Catalog) */}
                {selectedItems.length > 0 && (
                    <Card className="mb-5 shadow-sm border-0 bg-success text-white">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">{t('confirm_catalog')} ({selectedItems.length})</h5>
                            <Form onSubmit={handleAddProducts}>
                                {selectedItems.map((item) => (
                                    <Row key={item.name} className="g-2 mb-2 align-items-center bg-white text-dark p-2 rounded-3 mx-0">
                                        <Col xs={4} md={3} className="fw-bold">{t(item.name)}</Col>
                                        <Col xs={4} md={3}>
                                            <Form.Control size="sm" type="number" min="0" step="0.01" placeholder={t('price')} onChange={(e) => handleDetailChange(item.name, 'price', e.target.value)} required />
                                        </Col>
                                        <Col xs={4} md={2}>
                                            <Form.Control size="sm" type="number" min="1" placeholder={t('quantity')} onChange={(e) => handleDetailChange(item.name, 'quantity', e.target.value)} required />
                                        </Col>
                                        <Col xs={4} md={1}>
                                            <Form.Select size="sm" value={itemDetails[item.name]?.unit} onChange={(e) => handleDetailChange(item.name, 'unit', e.target.value)}>
                                                <option value="kg">kg</option>
                                                <option value="liters">L</option>
                                                <option value="count">cnt</option>
                                            </Form.Select>
                                        </Col>
                                        <Col xs={12} md={3} className="text-end">
                                            <Button variant="danger" size="sm" onClick={() => handleSelectProduct(item)}>✕</Button>
                                        </Col>
                                    </Row>
                                ))}
                                <div className="text-end mt-3">
                                    <Button variant="light" type="submit" className="fw-bold text-success">{t('confirm_catalog')}</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                )}

                {/* Listings and Orders */}
                <Row className="g-4">
                    <Col lg={12}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Header className="bg-white py-3">
                                <h5 className="fw-bold mb-0">{t('active_listings')}</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">{t('product')}</th>
                                                <th>{t('price')}</th>
                                                <th>{t('stock')}</th>
                                                <th className="text-end pe-4">{t('actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr key={product.id}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center">
                                                            <img src={product.imageUrl || FALLBACK_IMAGE} alt="" className="rounded me-3" style={{ width: '45px', height: '45px', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                                                            <div className="fw-bold">{product.name}</div>
                                                        </div>
                                                    </td>
                                                    <td>₹{product.price}<small className="text-muted">/{product.unit}</small></td>
                                                    <td>
                                                        <Badge bg={product.quantity > 10 ? "success" : "warning"} className="rounded-pill">
                                                            {product.quantity} {product.unit}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product.id)}>{t('delete')}</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={12}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-white py-3">
                                <h5 className="fw-bold mb-0">{t('incoming_orders')}</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">{t('order_summary')}</th>
                                                <th>{t('customer')}</th>
                                                <th>{t('status')}</th>
                                                <th className="text-end pe-4">{t('actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {incomingOrders.map(item => (
                                                <tr key={item.id}>
                                                    <td className="ps-4">
                                                        <div className="small fw-bold">{t('order_no')}{item.order.id}</div>
                                                        <div className="text-success">{t(item.product.name)} ({item.quantity} {item.product.unit})</div>
                                                        <div className="text-muted small">{t('total')}: ₹{item.price * item.quantity}</div>
                                                    </td>
                                                    <td>
                                                        <div className="small fw-bold">{item.order.consumer.fullName}</div>
                                                        <div className="small text-muted">{item.order.consumer.phone}</div>
                                                    </td>
                                                    <td>
                                                        <Badge bg={
                                                            item.order.status === 'PENDING' ? 'warning' :
                                                                item.order.status === 'CONFIRMED' ? 'info' :
                                                                    item.order.status === 'SHIPPED' ? 'primary' :
                                                                        item.order.status === 'DELIVERED' ? 'success' : 'danger'
                                                        }>{t(item.order.status.toLowerCase())}</Badge>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        {item.order.status === 'PENDING' && (
                                                            <div className="btn-group">
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(item.order.id, 'CONFIRMED')}
                                                                    disabled={!userProfile?.bankAccountNumber && item.order.deliveryType !== 'HOME_DELIVERY'}
                                                                >
                                                                    {t('accept')}
                                                                </Button>
                                                                <Button variant="outline-danger" size="sm" onClick={() => handleUpdateStatus(item.order.id, 'CANCELLED')}>{t('reject')}</Button>
                                                            </div>
                                                        )}
                                                        {item.order.status === 'CONFIRMED' && (
                                                            <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(item.order.id, 'SHIPPED')}>{t('mark_shipped')}</Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <style>{`
                .catalog-card:hover { transform: scale(1.05); transition: 0.2s; }
                .cursor-pointer { cursor: pointer; }
                .animate__fadeIn { animation: fadeIn 0.5s; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default FarmerDashboard;
