import { useState, useEffect } from 'react';
import { products } from './data';
import './App.css';

function App() {
  // --- STATE ---
  const [cart, setCart] = useState([]); // Now stores items with a 'quantity' property
  const [currentView, setCurrentView] = useState('shop');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', address: '', city: '', zip: '' });

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- LOGIC ---
  const categories = ['All', ...new Set(products.map(item => item.category))];

  // Filter by category AND search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product, e) => {
    if(e) e.stopPropagation();
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    setToastMessage(`Added ${product.name} to cart!`);
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null; // null marks for deletion
      }
      return item;
    }).filter(Boolean)); // removes null items
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo(0, 0);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    setCurrentView('success');
    setCart([]); 
    window.scrollTo(0, 0);
  };

  // Calculate totals based on quantities
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="app-container">
      {/* TOAST NOTIFICATION */}
      {toastMessage && <div className="toast">{toastMessage}</div>}

      {/* NAVIGATION */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="brand" onClick={() => { setCurrentView('shop'); setSearchQuery(''); }}>
            ShopHeaven
          </div>
          
          {currentView === 'shop' && (
            <input 
              type="text" 
              className="search-bar" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}

          <div className="nav-links">
            <button className={`nav-link ${currentView === 'shop' ? 'active' : ''}`} onClick={() => setCurrentView('shop')}>Shop</button>
            <button className={`nav-link ${currentView === 'about' ? 'active' : ''}`} onClick={() => setCurrentView('about')}>About</button>
            <button className="cart-btn" onClick={() => setCurrentView('checkout')}>
              Cart ({cartItemCount}) - ${cartTotal.toFixed(2)}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="content-wrap">
        
        {/* VIEW: SHOP */}
        {currentView === 'shop' && (
          <>
            {!searchQuery && (
              <div className="hero">
                <h1>Elevate Your Everyday</h1>
                <p>Discover our curated collection of premium tech, accessories, and home goods designed for modern living.</p>
              </div>
            )}

            <div className="category-filters" style={{marginTop: searchQuery ? '40px' : '0'}}>
              {categories.map(category => (
                <button 
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{textAlign: 'center', padding: '64px 0', color: '#6b7280'}}>
                <h2>No products found matching "{searchQuery}"</h2>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="product-card" onClick={() => viewProductDetails(product)}>
                    <div className="category-badge">{product.category}</div>
                    <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                    
                    <div className="product-info">
                      <h2>{product.name}</h2>
                      <div className="rating">
                        ★ {product.rating} <span className="reviews">({product.reviews} reviews)</span>
                      </div>
                      <p>{product.description}</p>
                      <div className="card-footer">
                        <span className="price">${product.price.toFixed(2)}</span>
                        <button className="primary-btn" onClick={(e) => handleAddToCart(product, e)}>
                          Add +
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* VIEW: PRODUCT DETAILS */}
        {currentView === 'product' && selectedProduct && (
          <div className="details-container">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="details-image" />
            <div className="details-info">
              <span className="category-badge" style={{position: 'relative', top: '0', left: '0', display: 'inline-block', marginBottom: '16px', backgroundColor: '#e5e7eb'}}>
                {selectedProduct.category}
              </span>
              <h1>{selectedProduct.name}</h1>
              <div className="rating" style={{fontSize: '1.1rem', marginBottom: '16px'}}>
                ★ {selectedProduct.rating} <span className="reviews">({selectedProduct.reviews} customer reviews)</span>
              </div>
              <div className="details-price">${selectedProduct.price.toFixed(2)}</div>
              <p className="details-description">{selectedProduct.description}</p>
              
              <h3>Key Features</h3>
              <ul className="features-list">
                {selectedProduct.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>

              <button className="primary-btn full-width" onClick={() => handleAddToCart(selectedProduct)}>
                Add to Cart - ${selectedProduct.price.toFixed(2)}
              </button>
              <button className="nav-link" style={{marginTop: '24px', display: 'block'}} onClick={() => setCurrentView('shop')}>
                &larr; Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* VIEW: ABOUT PAGE */}
        {currentView === 'about' && (
          <div className="about-page">
            <h1>About ShopHeaven</h1>
            <p style={{fontSize: '1.2rem', color: '#4b5563', lineHeight: '1.8'}}>
              We believe in delivering high-quality, modern essentials directly to your doorstep. Founded in 2024, our mission is to cut through the noise of traditional retail and offer premium products at honest prices.
            </p>
          </div>
        )}

        {/* VIEW: CHECKOUT */}
        {currentView === 'checkout' && (
          <div className="checkout-container">
            <div className="checkout-box">
              <h2 style={{marginBottom: '24px', fontSize: '1.8rem'}}>Secure Checkout</h2>
              {cart.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px 0'}}>
                  <p style={{fontSize: '1.2rem', color: '#6b7280', marginBottom: '24px'}}>Your cart is looking a little empty.</p>
                  <button className="primary-btn" onClick={() => setCurrentView('shop')}>Start Shopping</button>
                </div>
              ) : (
                <form onSubmit={handleCheckout}>
                  <div className="form-group">
                    <input type="text" placeholder="Full Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <input type="text" placeholder="Shipping Address" required onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div style={{display: 'flex', gap: '16px'}}>
                    <div className="form-group" style={{flex: 1}}>
                      <input type="text" placeholder="City" required onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="form-group" style={{flex: 1}}>
                      <input type="text" placeholder="ZIP Code" required onChange={(e) => setFormData({...formData, zip: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="primary-btn full-width" style={{marginTop: '16px'}}>
                    Pay ${cartTotal.toFixed(2)}
                  </button>
                </form>
              )}
            </div>

            <div className="checkout-box">
              <h2 style={{marginBottom: '24px', fontSize: '1.8rem'}}>Order Summary</h2>
              <div>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-info">
                      <div className="cart-item-title">{item.name}</div>
                      <div className="cart-item-price">${item.price.toFixed(2)} each</div>
                    </div>
                    
                    <div className="qty-controls">
                      <button type="button" className="qty-btn" onClick={() => handleUpdateQuantity(item.id, -1)}>-</button>
                      <span style={{fontWeight: '600', width: '20px', textAlign: 'center'}}>{item.quantity}</span>
                      <button type="button" className="qty-btn" onClick={() => handleUpdateQuantity(item.id, 1)}>+</button>
                    </div>
                    
                    <div style={{fontWeight: '700', marginLeft: '16px', minWidth: '70px', textAlign: 'right'}}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                {cart.length > 0 && (
                  <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.5rem', marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #e5e7eb'}}>
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SUCCESS */}
        {currentView === 'success' && (
          <div style={{textAlign: 'center', padding: '100px 20px'}}>
            <div style={{fontSize: '4rem', marginBottom: '16px'}}>🎉</div>
            <h1 style={{color: '#10b981', marginBottom: '16px', fontSize: '2.5rem'}}>Order Placed!</h1>
            <p style={{fontSize: '1.2rem', color: '#4b5563', marginBottom: '8px'}}>Thank you, {formData.name}. Your items are on the way.</p>
            <p style={{fontSize: '1.1rem', color: '#6b7280'}}>Shipping to: {formData.address}, {formData.city} {formData.zip}</p>
            <button className="primary-btn" style={{marginTop: '40px', padding: '12px 32px'}} onClick={() => setCurrentView('shop')}>
              Return to Home
            </button>
          </div>
        )}
      </main>

      {/* PROFESSIONAL FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h2 style={{color: 'white', marginBottom: '16px', fontSize: '1.5rem'}}>ShopHeaven</h2>
            <p style={{fontSize: '0.9rem', lineHeight: '1.6'}}>Elevating your everyday with premium, thoughtfully designed essentials for modern living.</p>
          </div>
          <div className="footer-col">
            <h3>Shop</h3>
            <ul>
              <li onClick={() => {setCurrentView('shop'); setSelectedCategory('Tech');}}>Tech</li>
              <li onClick={() => {setCurrentView('shop'); setSelectedCategory('Accessories');}}>Accessories</li>
              <li onClick={() => {setCurrentView('shop'); setSelectedCategory('Workspace');}}>Workspace</li>
              <li onClick={() => {setCurrentView('shop'); setSelectedCategory('Home');}}>Home</li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Support</h3>
            <ul>
              <li>Contact Us</li>
              <li>Shipping & Returns</li>
              <li>FAQ</li>
              <li>Track Order</li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Stay in the loop</h3>
            <p style={{fontSize: '0.9rem', marginBottom: '12px'}}>Get 10% off your first order.</p>
            <input type="email" placeholder="Enter your email" className="newsletter-input" />
            <button className="primary-btn full-width" style={{padding: '10px'}}>Subscribe</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 ShopHeaven. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;