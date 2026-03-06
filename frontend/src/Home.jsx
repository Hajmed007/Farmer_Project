import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Nav, Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import api from './api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop';

const CATEGORIES = [
    { name: 'cat_all', icon: '🧺' },
    { name: 'cat_veg', icon: '🥕' },
    { name: 'cat_fruits', icon: '🍎' },
    { name: 'cat_grains', icon: '🌾' },
    { name: 'cat_spices', icon: '🌶️' },
    { name: 'cat_dairy', icon: '🥛' }
];

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('cat_all');
    const [requestedQuantities, setRequestedQuantities] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, selectedCategory]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
            const initialQtys = {};
            response.data.forEach(p => {
                initialQtys[p.id] = 1;
            });
            setRequestedQuantities(initialQtys);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const filterProducts = () => {
        let result = products;

        if (selectedCategory !== 'cat_all') {
            result = result.filter(p => {
                if (selectedCategory === 'cat_veg') return ['Tomato', 'Potato', 'Carrot', 'Onion', 'Corn', 'Cucumber', 'Spinach', 'Garlic', 'Ginger', 'Brinjal', 'Cabbage', 'Cauliflower', 'Broccoli'].includes(p.name);
                if (selectedCategory === 'cat_fruits') return ['Apple', 'Banana', 'Mango', 'Grapes', 'Papaya', 'Watermelon', 'Pineapple', 'Pomegranate', 'Guava'].includes(p.name);
                return true;
            });
        }

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredProducts(result);
    };

    const handleQuantityChange = (productId, delta, maxStock) => {
        setRequestedQuantities(prev => {
            const current = prev[productId] || 1;
            const next = Math.max(1, Math.min(maxStock, current + delta));
            return { ...prev, [productId]: next };
        });
    };

    const handleAddToCart = (product) => {
        if (!user) {
            navigate('/login');
            return;
        }
        const qty = requestedQuantities[product.id] || 1;
        addToCart(product, qty);
        setToastMessage(t('added_msg', { qty, unit: product.unit, name: product.name }));
        setShowToast(true);
    };

    const handleBuyNow = (product) => {
        if (!user) {
            navigate('/login');
            return;
        }
        const qty = requestedQuantities[product.id] || 1;
        // Create a temporary checkout item structure consistent with cart items
        const checkoutItem = {
            ...product,
            cartQuantity: qty,
            stock: product.quantity,
            farmerName: product.farmer?.fullName || 'Local Farmer'
        };
        navigate('/checkout', { state: { items: [checkoutItem] } });
    };

    return (
        <div className="home-wrapper min-vh-100 pb-5" style={{ backgroundColor: '#fdfcf9' }}>
            {/* Immersive Hero Section */}
            <header className="hero-section position-relative overflow-hidden mb-5">
                <div className="hero-bg" style={{
                    backgroundImage: `url(${HERO_IMAGE})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    height: '550px',
                    filter: 'brightness(0.85)'
                }}></div>
                <div className="hero-overlay position-absolute bottom-0 w-100 p-5 d-flex flex-column align-items-center justify-content-center text-center">
                    <Container>
                        <Badge bg="success" className="mb-3 px-3 py-2 rounded-pill shadow-sm animate__animated animate__fadeInUp" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                            {t('hero_badge')}
                        </Badge>
                        <h1 className="display-2 fw-bold text-white mb-3 text-shadow animate__animated animate__fadeInUp" style={{ letterSpacing: '-1px' }}>
                            {t('welcome')}
                        </h1>
                        <p className="lead text-white fs-4 mb-5 opacity-90 mx-auto animate__animated animate__fadeInUp" style={{ maxWidth: '700px' }}>
                            {t('hero_subtitle')}
                        </p>

                        <div className="search-container mx-auto animate__animated animate__fadeInUp animate__delay-1s" style={{ maxWidth: '750px' }}>
                            <div className="search-glass shadow-lg rounded-pill p-2 d-flex align-items-center">
                                <div className="ps-4 text-white-50 fs-4">🔍</div>
                                <Form.Control
                                    className="border-0 ps-3 py-3 shadow-none bg-transparent fs-5 text-white placeholder-white-50"
                                    placeholder={t('search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ caretColor: '#91e174' }}
                                />
                                <Button className="rounded-pill px-5 py-3 fw-bold btn-glow border-0 ms-2">
                                    {t('search_btn')}
                                </Button>
                            </div>
                        </div>
                    </Container>
                </div>
            </header>

            <Container>
                {/* Modern Category Selector */}
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-4 text-dark" style={{ letterSpacing: '-0.5px' }}>{t('categories')}</h2>
                    <div className="category-scroll-wrapper d-flex justify-content-center gap-3 py-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`category-card ${selectedCategory === cat.name ? 'active' : ''}`}
                            >
                                <span className="cat-icon">{cat.icon}</span>
                                <span className="cat-name">{t(cat.name)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-5 border rounded-5 bg-white shadow-sm mt-4">
                        <div className="display-1 text-muted mb-4 opacity-50">🚜</div>
                        <h3 className="text-dark fw-bold">{t('nothing_here')}</h3>
                        <p className="text-muted">{t('filter_hint')}</p>
                        <Button variant="success" className="rounded-pill px-4 mt-2" onClick={() => { setSearchTerm(''); setSelectedCategory('cat_all'); }}>
                            {t('reset_filters')}
                        </Button>
                    </div>
                ) : (
                    <Row xs={1} md={2} lg={3} xl={4} className="g-4 mt-2">
                        {filteredProducts.map((product, index) => {
                            const isOutOfStock = product.quantity <= 0;
                            const currentQty = requestedQuantities[product.id] || 1;

                            return (
                                <Col key={product.id} className="animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <Card className="h-100 border-0 shadow-sm overflow-hidden product-premium-card">
                                        <div className="position-relative" style={{ height: '240px' }}>
                                            <Card.Img
                                                variant="top"
                                                src={product.imageUrl || FALLBACK_IMAGE}
                                                className={`h-100 w-100 object-fit-cover transition-img ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
                                                onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                            />
                                            <div className="stock-badge position-absolute top-0 end-0 m-3">
                                                {isOutOfStock ? (
                                                    <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm">{t('sold_out')}</Badge>
                                                ) : (
                                                    <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">{t('fresh_harvest')}</Badge>
                                                )}
                                            </div>
                                            {!isOutOfStock && (
                                                <div className="price-tag position-absolute bottom-0 start-0 m-3 bg-white p-2 rounded-3 shadow-sm px-3 border border-light">
                                                    <span className="text-success fw-bold h5 mb-0">₹{product.price}</span>
                                                    <small className="text-muted ms-1">/{product.unit}</small>
                                                </div>
                                            )}
                                        </div>

                                        <Card.Body className="p-4 d-flex flex-column">
                                            <div className="mb-2">
                                                <h5 className="fw-bold text-dark mb-1">{product.name}</h5>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-1 text-muted small">
                                                        <span>👨‍🌾</span> {t('sold_by')}: {product.farmer?.fullName || 'Local Partner'}
                                                    </div>
                                                    {!isOutOfStock && (
                                                        <Badge bg="light" text="dark" className="border">
                                                            {t('stock')}: {product.quantity} {product.unit}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <Card.Text className="text-muted small mb-4 flex-grow-1" style={{ fontSize: '0.85rem' }}>
                                                {product.description || 'Nutrient-rich produce harvested just for you.'}
                                            </Card.Text>

                                            {!isOutOfStock && user?.role !== 'FARMER' && user?.role !== 'ADMIN' && (
                                                <div className="action-area mt-auto">
                                                    <div className="d-flex align-items-center justify-content-between mb-3 bg-light p-1 rounded-pill">
                                                        <Button
                                                            variant="white"
                                                            className="rounded-circle shadow-none p-1 px-3 fs-5"
                                                            onClick={() => handleQuantityChange(product.id, -1, product.quantity)}
                                                        >−</Button>
                                                        <span className="fw-bold px-2">{currentQty} <small>{product.unit}</small></span>
                                                        <Button
                                                            variant="white"
                                                            className="rounded-circle shadow-none p-1 px-3 fs-5"
                                                            onClick={() => handleQuantityChange(product.id, 1, product.quantity)}
                                                        >+</Button>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-center mb-2">
                                                        <Badge bg="light" text="dark" className="border">
                                                            {t('stock')}: {product.quantity} {product.unit}
                                                        </Badge>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="outline-success"
                                                            className="w-50 fw-bold py-2 rounded-pill shadow-sm"
                                                            onClick={() => handleAddToCart(product)}
                                                        >
                                                            {t('add_to_cart')} 🛒
                                                        </Button>
                                                        <Button
                                                            variant="success"
                                                            className="w-50 fw-bold py-2 rounded-pill shadow-sm btn-premium"
                                                            onClick={() => handleBuyNow(product)}
                                                        >
                                                            {t('buy_now')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Container>

            <ToastContainer position="bottom-center" className="p-4" style={{ zIndex: 3000 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={4000} autohide className="border-0 shadow-lg rounded-5 overflow-hidden animate__animated animate__slideInUp" style={{ minWidth: '320px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                    <Toast.Body className="p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center p-3 fs-3" style={{ width: '50px', height: '50px' }}>
                                🛒
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fw-bold mb-1">{t('added_to_cart')}</h6>
                                <p className="text-muted small mb-0">{toastMessage}</p>
                            </div>
                            <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => navigate('/cart')}>
                                {t('view')}
                            </Button>
                        </div>
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
                
                .home-wrapper {
                    font-family: 'Outfit', sans-serif;
                }

                .text-shadow {
                    text-shadow: 0 4px 15px rgba(0,0,0,0.5);
                }

                .search-glass {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }

                .search-glass:focus-within {
                    background: rgba(255, 255, 255, 0.25);
                    border-color: rgba(145, 225, 116, 0.5);
                    box-shadow: 0 0 30px rgba(145, 225, 116, 0.2) !important;
                }

                .placeholder-white-50::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }

                .btn-glow {
                    background: #91e174;
                    color: #1a4d2e;
                    box-shadow: 0 5px 15px rgba(145, 225, 116, 0.4);
                    transition: all 0.3s ease;
                }

                .btn-glow:hover {
                    background: #a8ee8a;
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(145, 225, 116, 0.6);
                    color: #1a4d2e;
                }

                .hero-section {
                    height: 550px;
                    border-radius: 0 0 60px 60px;
                }

                .hero-overlay {
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                    height: 100%;
                }

                .btn-premium {
                    background: linear-gradient(135deg, #1fa33f 0%, #157347 100%);
                    border: none;
                    transition: all 0.3s ease;
                }

                .btn-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
                }

                .category-scroll-wrapper {
                    overflow-x: auto;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .category-scroll-wrapper::-webkit-scrollbar {
                    display: none;
                }

                .category-card {
                    background: white;
                    border: 1px solid #eff0f2;
                    padding: 12px 24px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 120px;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.02);
                }

                .category-card .cat-icon {
                    font-size: 1.8rem;
                    margin-bottom: 5px;
                }

                .category-card .cat-name {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #4a5568;
                }

                .category-card:hover {
                    transform: translateY(-5px);
                    border-color: #28a745;
                    box-shadow: 0 10px 25px rgba(40,167,69,0.1);
                }

                .category-card.active {
                    background: #28a745;
                    border-color: #28a745;
                }

                .category-card.active .cat-name {
                    color: white;
                }

                .product-premium-card {
                    transition: all 0.4s ease;
                    border-radius: 24px !important;
                }

                .product-premium-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                }

                .product-premium-card:hover .transition-img {
                    transform: scale(1.1);
                }

                .transition-img {
                    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                }

                .object-fit-cover {
                    object-fit: cover;
                }

                .price-tag {
                    z-index: 2;
                }

                @media (max-width: 768px) {
                    .hero-section {
                        height: 450px;
                    }
                    .display-2 {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;


