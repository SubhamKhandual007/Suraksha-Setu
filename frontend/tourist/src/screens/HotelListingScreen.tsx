import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, ArrowUpDown, ChevronLeft, Building2, Lock, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { overpassService, OverpassElement } from '../services/overpassService';
import { locationService } from '../services/locationService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { paymentAPI } from '../services/api';

const stripePromise = loadStripe('pk_test_51T5PkUFMm1x5WhjXk2Yzr2ptCbg6m1kZ9FVnVNHztsYlgjNwaON1fM4cSHMhu3MTe124JBugZ4s0LHQ4rfV85e7G00nefAf8Vo');

interface Hotel extends OverpassElement {
  price: number;
  category: 'Budget' | 'Mid-range' | 'Luxury';
  rating: number;
  distance: string;
  imageUrl: string;
}

const HotelListingScreen: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Budget' | 'Mid-range' | 'Luxury'>('All');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating'>('price-low');
  
  // Booking State
  const [bookingStep, setBookingStep] = useState<'listing' | 'booking' | 'confirmation'>('listing');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [bookingData, setBookingData] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 1,
    rooms: 1,
    name: '',
    phone: '',
    email: '',
    paymentMethod: 'Pay at Hotel'
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    email: false
  });
  const [bookingId, setBookingId] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSecurePayment, setShowSecurePayment] = useState(false);
  
  // Card States
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    holder: ''
  });
  const [cardErrors, setCardErrors] = useState({
    number: '',
    expiry: '',
    cvc: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    const userLoc = await new Promise<any>((resolve) => {
      locationService.startLocationTracking(
        (loc) => resolve(loc),
        () => resolve({ latitude: 20.2961, longitude: 85.8245 }) // Fallback to Bhubaneswar center
      );
    });

    const data = await overpassService.fetchNearbyPlaces(userLoc.latitude, userLoc.longitude, 10000);
    const hotelElements = data.filter(el => el.tags.tourism === 'hotel' || el.tags.amenity === 'hotel');
    
    // Bhubaneswar Featured Hotels for realistic data
    const featuredHotels: Partial<Hotel>[] = [
      { id: 1001, tags: { name: 'Mayfair Lagoon' }, price: 4900, category: 'Luxury', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' },
      { id: 1002, tags: { name: 'Trident Bhubaneswar' }, price: 4500, category: 'Luxury', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
      { id: 1003, tags: { name: 'Hotel Swosti Premium' }, price: 3800, category: 'Mid-range', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' },
      { id: 1004, tags: { name: 'Ginger Bhubaneswar' }, price: 2400, category: 'Mid-range', rating: 4.2, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
      { id: 1005, tags: { name: 'Hotel Keshari' }, price: 1200, category: 'Budget', rating: 3.8, imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80' },
      { id: 1006, tags: { name: 'Suryansh Hotels' }, price: 2800, category: 'Mid-range', rating: 4.0, imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80' },
      { id: 1007, tags: { name: 'The New Marrion' }, price: 3200, category: 'Mid-range', rating: 4.3, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
      { id: 1008, tags: { name: 'Hotel Arya' }, price: 950, category: 'Budget', rating: 3.5, imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80' },
      { id: 1009, tags: { name: 'Hotel Empire' }, price: 2600, category: 'Mid-range', rating: 4.1, imageUrl: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80' },
      { id: 1010, tags: { name: 'Pal Heights' }, price: 4800, category: 'Luxury', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=800&q=80' },
      { id: 1011, tags: { name: 'The Crown' }, price: 4200, category: 'Luxury', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' },
      { id: 1012, tags: { name: 'Hotel Pushpak' }, price: 1600, category: 'Budget', rating: 3.9, imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80' },
      { id: 1013, tags: { name: 'Sandy\'s Tower' }, price: 3100, category: 'Mid-range', rating: 4.0, imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80' },
      { id: 1014, tags: { name: 'HHI Bhubaneswar' }, price: 4600, category: 'Luxury', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
      { id: 1015, tags: { name: 'Padmaja Premium' }, price: 4950, category: 'Luxury', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80' }
    ];

    const processedHotels: Hotel[] = hotelElements.map(el => {
      // Check if it's one of our featured ones to sync data
      const featured = featuredHotels.find(f => el.tags.name?.includes(f.tags?.name || ''));
      
      let price, category: 'Budget' | 'Mid-range' | 'Luxury', rating, imageUrl;
      
      if (featured) {
        price = featured.price!;
        category = featured.category!;
        rating = featured.rating!;
        imageUrl = featured.imageUrl!;
      } else {
        const random = Math.random();
        if (random > 0.8) {
          price = Math.floor(Math.random() * 1000) + 4000;
          category = 'Luxury';
          imageUrl = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80';
        } else if (random > 0.4) {
          price = Math.floor(Math.random() * 1500) + 2000;
          category = 'Mid-range';
          imageUrl = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
        } else {
          price = Math.floor(Math.random() * 900) + 600;
          category = 'Budget';
          imageUrl = 'https://images.unsplash.com/photo-1512918766775-d56aabc28b49?auto=format&fit=crop&w=800&q=80';
        }
        rating = Number((Math.random() * 1.5 + 3.5).toFixed(1));
      }

      return {
        ...el,
        price,
        category,
        rating,
        imageUrl,
        distance: overpassService.getDistance(userLoc.latitude, userLoc.longitude, el.lat || el.center?.lat || 0, el.lon || el.center?.lon || 0)
      } as Hotel;
    });

    // Merge with any featured hotels not found in OSM for better demo
    featuredHotels.forEach(f => {
      if (!processedHotels.some(p => p.tags.name === f.tags?.name)) {
        processedHotels.push({
          ...f,
          lat: userLoc.latitude + (Math.random() - 0.5) * 0.05,
          lon: userLoc.longitude + (Math.random() - 0.5) * 0.05,
          distance: (Math.random() * 5 + 1).toFixed(1)
        } as Hotel);
      }
    });

    setHotels(processedHotels);
    setLoading(false);
  };

  const filteredHotels = hotels
    .filter(h => h.tags.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(h => categoryFilter === 'All' || h.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return b.rating - a.rating;
    });



  const calculateNights = () => {
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Full name is required';
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name must contain only alphabets';
        else if (value.trim().length < 3) error = 'Name must be at least 3 characters long';
        break;
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{3,}\.[a-zA-Z]{2,}$/;
        if (!value.trim()) error = 'Email address is required';
        else if (!emailRegex.test(value)) error = 'Please enter a valid email address';
        break;
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!value.trim()) error = 'Phone number is required';
        else if (!phoneRegex.test(value)) error = 'Enter a valid 10-digit Indian number starting with 6-9';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') formattedValue = formatCardNumber(value);
    if (name === 'expiry') formattedValue = formatExpiry(value);
    if (name === 'cvc') formattedValue = value.replace(/[^0-9]/gi, '').substring(0, 3);

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    validateCardField(name, formattedValue);
  };

  const getCardFieldError = (name: string, value: string) => {
    let error = '';
    if (name === 'number') {
      if (value.replace(/\s/g, '').length !== 16) error = 'Enter 16-digit card number';
    } else if (name === 'expiry') {
      const parts = value.split('/');
      if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
        error = 'Enter MM/YY';
      } else {
        const month = parseInt(parts[0]);
        const year = parseInt('20' + parts[1]);
        const now = new Date();
        const expiry = new Date(year, month, 0);
        if (month < 1 || month > 12) error = 'Invalid month';
        else if (expiry < now) error = 'Card expired';
      }
    } else if (name === 'cvc') {
      if (value.length !== 3) error = 'Invalid CVC';
    }
    return error;
  };

  const validateCardField = (name: string, value: string) => {
    const error = getCardFieldError(name, value);
    setCardErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const isCardValid = () => {
    const nErr = getCardFieldError('number', cardDetails.number);
    const eErr = getCardFieldError('expiry', cardDetails.expiry);
    const cErr = getCardFieldError('cvc', cardDetails.cvc);
    return !nErr && !eErr && !cErr;
  };

  const isFormValid = () => {
    const nameValid = validateField('name', bookingData.name);
    const emailValid = validateField('email', bookingData.email);
    const phoneValid = validateField('phone', bookingData.phone);
    return nameValid && emailValid && phoneValid;
  };

  const handleBookingConfirm = async () => {
    if (!isFormValid()) return;

    if (bookingData.paymentMethod === 'Online Payment') {
      setShowSecurePayment(true);
      return;
    }

    // Cash / Pay at Hotel flow
    completeBooking();
  };

  const completeBooking = () => {
    const id = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Save to localStorage for Payment History
    if (selectedHotel) {
      const newBooking = {
        id,
        hotelName: selectedHotel.tags.name || 'Unnamed Hotel',
        amount: selectedHotel.price * calculateNights() * bookingData.rooms,
        date: new Date().toISOString().split('T')[0],
        status: bookingData.paymentMethod === 'Pay at Hotel' ? 'Pending' : 'Completed',
        method: bookingData.paymentMethod,
        nights: calculateNights()
      };
      
      const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      localStorage.setItem('hotelBookings', JSON.stringify([newBooking, ...existingBookings]));
    }

    setBookingId(id);
    setBookingStep('confirmation');
    setClientSecret(null);
  };

  if (bookingStep === 'confirmation' && selectedHotel) {
    const total = selectedHotel.price * calculateNights() * bookingData.rooms;
    return (
      <div className="fade-in" style={{ padding: '20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '20px', fontSize: '40px' }}>
          ✓
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>Booking Confirmed!</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Your stay at {selectedHotel.tags.name} is successfully booked.</p>
        
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'left', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <span style={{ color: '#64748b', fontSize: '13px' }}>Booking ID</span>
            <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{bookingId}</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Hotel</div>
            <div style={{ fontWeight: '700' }}>{selectedHotel?.tags.name}</div>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Check-in</div>
              <div style={{ fontWeight: '700' }}>{bookingData.checkIn}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Check-out</div>
              <div style={{ fontWeight: '700' }}>{bookingData.checkOut}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '10px', borderTop: '2px dashed #e2e8f0' }}>
            <span style={{ fontWeight: '800' }}>Total Amount</span>
            <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '18px' }}>₹{total}</span>
          </div>
        </div>

        <button 
          onClick={() => { setBookingStep('listing'); setSelectedHotel(null); }}
          className="btn btn-primary" 
          style={{ marginTop: '30px', padding: '15px 40px', borderRadius: '15px' }}
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '20px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Nearby Hotels</h1>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
        <input 
          type="text" 
          placeholder="Search by hotel name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '14px 14px 14px 45px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            background: 'white',
            fontSize: '14px',
            outline: 'none',
            boxShadow: 'var(--shadow-sm)'
          }} 
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px', scrollbarWidth: 'none' }}>
        {['All', 'Budget', 'Mid-range', 'Luxury'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat as any)}
            style={{
              padding: '10px 18px',
              borderRadius: '25px',
              border: 'none',
              background: categoryFilter === cat ? 'var(--primary)' : 'white',
              color: categoryFilter === cat ? 'white' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{filteredHotels.length} Hotels found</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
          <ArrowUpDown size={14} />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ border: 'none', background: 'transparent', color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit', outline: 'none', cursor: 'pointer' }}
          >
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Hotel List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 0' }}>
          <div className="spinner" style={{ marginBottom: '15px' }}></div>
          <p style={{ color: '#64748b' }}>Finding best hotels for you...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredHotels.map((hotel) => (
            <div 
              key={hotel.id} 
              className="card" 
              style={{ 
                padding: '0', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                border: '1px solid #f1f5f9'
              }}
            >
              <div style={{ position: 'relative', height: '160px', background: '#f8fafc' }}>
                <img src={hotel.imageUrl} alt={hotel.tags.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  background: 'rgba(255,255,255,0.9)', 
                  padding: '4px 8px', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontWeight: '800',
                  fontSize: '12px'
                }}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  {hotel.rating}
                </div>
                <div style={{ 
                  position: 'absolute', 
                  bottom: '12px', 
                  left: '12px', 
                  background: 'var(--primary)', 
                  color: 'white',
                  padding: '4px 10px', 
                  borderRadius: '8px', 
                  fontWeight: '700',
                  fontSize: '11px'
                }}>
                  {hotel.category}
                </div>
              </div>

              <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#1e293b' }}>{hotel.tags.name || 'Unnamed Hotel'}</h3>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>₹{hotel.price}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>per night</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
                    <MapPin size={14} />
                    {hotel.distance} km
                  </div>
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>✓ Safe for Tourists</div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => { setSelectedHotel(hotel); setBookingStep('booking'); }}
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '13px' }}
                  >
                    Book Now
                  </button>
                  <button className="btn" style={{ background: '#f1f5f9', color: '#1e293b', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '13px' }}>
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredHotels.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Building2 size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
              <p>No hotels found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal/Overlay */}
      {bookingStep === 'booking' && selectedHotel && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          zIndex: 2000, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}>
          <div className="fade-up" style={{ 
            background: 'white', 
            borderTopLeftRadius: '30px', 
            borderTopRightRadius: '30px', 
            height: '90vh', 
            overflowY: 'auto',
            padding: '25px'
          }}>
            <div style={{ 
              background: '#2ecc71', 
              color: 'white', 
              padding: '20px 25px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px',
              margin: '-25px -25px 25px -25px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Book Your Stay</h2>
              <button 
                onClick={() => setBookingStep('listing')} 
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '24px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '16px', color: '#334155', fontWeight: '500' }}>
              Selected Hotel: <span style={{ fontWeight: '700' }}>{selectedHotel?.tags.name}</span>
            </div>



            {/* Booking Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '15px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '10px' }}>Rooms & Guests</label>
                <select 
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    borderRadius: '12px', 
                    border: '1px solid #cbd5e1', 
                    fontSize: '15px', 
                    color: '#64748b', 
                    background: 'white', 
                    outline: 'none'
                  }}
                  value={`${bookingData.rooms} Room, ${bookingData.guests} Guest`}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '1 Room, 1 Guest') setBookingData({...bookingData, rooms: 1, guests: 1});
                    else if (val === '1 Room, 2 Guests') setBookingData({...bookingData, rooms: 1, guests: 2});
                    else if (val === '2 Rooms, 4 Guests') setBookingData({...bookingData, rooms: 2, guests: 4});
                  }}
                >
                  <option>1 Room, 1 Guest</option>
                  <option>1 Room, 2 Guests</option>
                  <option>2 Rooms, 4 Guests</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '15px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '10px' }}>Name</label>
                <input 
                  name="name"
                  placeholder="Enter your name"
                  value={bookingData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    borderRadius: '12px', 
                    border: `1px solid ${touched.name && errors.name ? 'var(--danger)' : '#cbd5e1'}`, 
                    fontSize: '15px', 
                    outline: 'none'
                  }} 
                />
                {touched.name && errors.name && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.name}</div>}
              </div>

              <div>
                <label style={{ fontSize: '15px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '10px' }}>Email</label>
                <input 
                  name="email"
                  placeholder="Enter your email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    borderRadius: '12px', 
                    border: `1px solid ${touched.email && errors.email ? 'var(--danger)' : '#cbd5e1'}`, 
                    fontSize: '15px', 
                    outline: 'none'
                  }} 
                />
                {touched.email && errors.email && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.email}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '15px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '10px' }}>Check-in Date</label>
                  <input 
                    type="date"
                    value={bookingData.checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newCheckIn = e.target.value;
                      let newCheckOut = bookingData.checkOut;
                      if (new Date(newCheckOut) <= new Date(newCheckIn)) {
                        newCheckOut = new Date(new Date(newCheckIn).getTime() + 86400000).toISOString().split('T')[0];
                      }
                      setBookingData({...bookingData, checkIn: newCheckIn, checkOut: newCheckOut});
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '15px', 
                      borderRadius: '12px', 
                      border: '1px solid #cbd5e1', 
                      fontSize: '15px', 
                      outline: 'none'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '15px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '10px' }}>Check-out Date</label>
                  <input 
                    type="date"
                    value={bookingData.checkOut}
                    min={new Date(new Date(bookingData.checkIn).getTime() + 86400000).toISOString().split('T')[0]}
                    onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '15px', 
                      borderRadius: '12px', 
                      border: '1px solid #cbd5e1', 
                      fontSize: '15px', 
                      outline: 'none'
                    }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '15px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '10px' }}>Phone Number</label>
                <input 
                  name="phone"
                  placeholder="Enter your phone number"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    borderRadius: '12px', 
                    border: `1px solid ${touched.phone && errors.phone ? 'var(--danger)' : '#cbd5e1'}`, 
                    fontSize: '15px', 
                    outline: 'none'
                  }} 
                />
                {touched.phone && errors.phone && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.phone}</div>}
              </div>

              <div>
                <label style={{ fontSize: '15px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '10px' }}>Select Payment Method</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Pay at Hotel', 'Online Payment'].map(method => (
                    <button
                      key={method}
                      onClick={() => setBookingData({...bookingData, paymentMethod: method})}
                      style={{ 
                        flex: 1, 
                        padding: '15px', 
                        borderRadius: '12px', 
                        border: bookingData.paymentMethod === method ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                        background: bookingData.paymentMethod === method ? '#eef2ff' : 'white',
                        color: bookingData.paymentMethod === method ? 'var(--primary)' : '#475569',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>



              {/* Price Summary */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>₹{selectedHotel.price} x {calculateNights()} Nights x {bookingData.rooms} Rooms</span>
                  <span style={{ fontWeight: '700' }}>₹{selectedHotel.price * calculateNights() * bookingData.rooms}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900' }}>
                  <span>Total Payable</span>
                  <span style={{ color: 'var(--primary)' }}>₹{selectedHotel.price * calculateNights() * bookingData.rooms}</span>
                </div>
              </div>

              {clientSecret ? (
                <div className="fade-in" style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '2px solid var(--primary)' }}>
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <CheckoutForm 
                      amount={selectedHotel.price * calculateNights() * bookingData.rooms} 
                      onSuccess={completeBooking}
                      onCancel={() => setClientSecret(null)}
                    />
                  </Elements>
                </div>
              ) : (
                <button 
                  onClick={handleBookingConfirm}
                  disabled={paymentLoading}
                  className="btn btn-primary" 
                  style={{ 
                    padding: '16px', 
                    borderRadius: '16px', 
                    fontSize: '15px', 
                    marginTop: '10px'
                  }}
                >
                  {paymentLoading ? 'Initialising Payment...' : (bookingData.paymentMethod === 'Online Payment' ? 'Proceed to Pay' : 'Confirm Booking')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    {showSecurePayment && selectedHotel && (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0,0,0,0.85)', 
        zIndex: 3000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="fade-in" style={{ 
          background: 'white', 
          width: '100%', 
          maxWidth: '500px', 
          borderRadius: '30px', 
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Header */}
          <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '10px' }}>
                <Lock size={20} color="#10b981" />
              </div>
              <span style={{ color: '#1e293b', fontSize: '16px', fontWeight: '800' }}>SECURE PAYMENT</span>
            </div>
            <button 
              onClick={() => setShowSecurePayment(false)}
              style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '25px', overflowY: 'auto', maxHeight: '85vh' }}>
            {/* Visual Card Preview */}
            <div style={{ 
              width: '100%', 
              height: '220px', 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
              borderRadius: '20px', 
              marginBottom: '30px', 
              padding: '30px', 
              color: 'white',
              position: 'relative',
              boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '50px', height: '40px', background: 'linear-gradient(45deg, #d4af37, #f1e49c)', borderRadius: '8px' }}></div>
                <CreditCard size={32} color="rgba(255,255,255,0.8)" />
              </div>

              <div>
                <div style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '3px', textShadow: '0 2px 4px rgba(0,0,0,0.3)', marginBottom: '15px' }}>
                  {cardDetails.number || '0000 0000 0000 0000'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>Card Holder</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>{bookingData.name || 'Your Name'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>Expires</div>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{cardDetails.expiry || 'MM/YY'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>CARD NUMBER</label>
                <input 
                  name="number"
                  placeholder="0000 0000 0000 0000"
                  value={cardDetails.number}
                  onChange={handleCardInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '14px', 
                    border: `2px solid ${cardErrors.number ? '#ef4444' : (cardDetails.number.length === 19 ? '#10b981' : '#e2e8f0')}`, 
                    fontSize: '16px', 
                    outline: 'none',
                    transition: 'all 0.2s'
                  }} 
                />
                {cardErrors.number && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px', fontWeight: '600' }}>{cardErrors.number}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>EXPIRY DATE</label>
                  <input 
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={handleCardInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      borderRadius: '14px', 
                      border: `2px solid ${cardErrors.expiry ? '#ef4444' : (cardDetails.expiry.length === 5 ? '#10b981' : '#e2e8f0')}`, 
                      fontSize: '16px', 
                      outline: 'none',
                      transition: 'all 0.2s'
                    }} 
                  />
                  {cardErrors.expiry && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px', fontWeight: '600' }}>{cardErrors.expiry}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>CVC</label>
                  <input 
                    name="cvc"
                    placeholder="000"
                    type="password"
                    value={cardDetails.cvc}
                    onChange={handleCardInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      borderRadius: '14px', 
                      border: `2px solid ${cardErrors.cvc ? '#ef4444' : (cardDetails.cvc.length === 3 ? '#10b981' : '#e2e8f0')}`, 
                      fontSize: '16px', 
                      outline: 'none',
                      transition: 'all 0.2s'
                    }} 
                  />
                  {cardErrors.cvc && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px', fontWeight: '600' }}>{cardErrors.cvc}</div>}
                </div>
              </div>

              {/* Summary Info */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '15px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>Booking for:</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>{selectedHotel?.tags.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800' }}>
                  <span style={{ color: '#1e293b' }}>Total Due:</span>
                  <span style={{ color: '#2563eb' }}>₹{(selectedHotel?.price || 0) * calculateNights() * bookingData.rooms}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (isCardValid()) {
                    setPaymentLoading(true);
                    setTimeout(() => {
                      setPaymentLoading(false);
                      setShowSecurePayment(false);
                      completeBooking();
                    }, 2000);
                  }
                }}
                disabled={paymentLoading}
                style={{ 
                  width: '100%', 
                  background: isCardValid() ? '#2563eb' : '#94a3b8', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '16px', 
                  padding: '18px', 
                  fontSize: '18px', 
                  fontWeight: '800', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  cursor: isCardValid() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  marginTop: '10px'
                }}
              >
                {paymentLoading ? (
                  <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div>
                ) : (
                  <>
                    <Lock size={20} />
                    Confirm Payment
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8', fontSize: '12px' }}>
                <ShieldCheck size={14} />
                <span>Your payment data is encrypted and secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default HotelListingScreen;
