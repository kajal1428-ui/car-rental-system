import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Booking({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: ''
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  useEffect(() => {
    calculatePrice();
  }, [formData, car]);

  const fetchCarDetails = async () => {
    try {
      const response = await axios.get(`/api/cars/${id}`);
      setCar(response.data);
    } catch (error) {
      console.error('Error fetching car details:', error);
    }
  };

  const calculatePrice = () => {
    if (car && formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setTotalPrice(car.price_per_day * days);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (start >= end) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/bookings',
        {
          car_id: id,
          start_date: formData.start_date,
          end_date: formData.end_date
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/cars/${id}`)}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Car Details
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6">Book Your Car</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <img
              src={car.image_url}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {car.brand} {car.model}
            </h3>
            <p className="text-gray-600 mb-4">{car.year}</p>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Category:</span> {car.category}</p>
              <p><span className="font-semibold">Transmission:</span> {car.transmission}</p>
              <p><span className="font-semibold">Seats:</span> {car.seats}</p>
              <p><span className="font-semibold">Price:</span> ${car.price_per_day}/day</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                min={today}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || today}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {totalPrice > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Price:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking;
