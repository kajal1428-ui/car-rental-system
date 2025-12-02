import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CarDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const response = await axios.get(`/api/cars/${id}`);
      setCar(response.data);
    } catch (error) {
      console.error('Error fetching car details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 text-lg">Car not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Cars
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={car.image_url}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-96 object-cover"
            />
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {car.brand} {car.model}
            </h1>
            <p className="text-gray-600 mb-6">{car.year}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                ${car.price_per_day}
              </span>
              <span className="text-gray-600 text-lg">/day</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">Category:</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  {car.category}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">Transmission:</span>
                <span>{car.transmission}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">Seats:</span>
                <span>{car.seats} passengers</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">Fuel Type:</span>
                <span>{car.fuel_type}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">Availability:</span>
                <span className={car.available ? 'text-green-600' : 'text-red-600'}>
                  {car.available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Description:</h3>
              <p className="text-gray-600">{car.description}</p>
            </div>

            <button
              onClick={handleBookNow}
              disabled={!car.available}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                car.available
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {car.available ? 'Book Now' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetails;
