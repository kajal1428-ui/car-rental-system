import { useState, useEffect } from 'react';
import axios from 'axios';
import CarCard from '../components/CarCard';

function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    transmission: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.transmission) params.append('transmission', filters.transmission);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      const response = await axios.get(`/api/cars?${params}`);
      setCars(response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({ category: '', transmission: '', minPrice: '', maxPrice: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Find Your Perfect Ride
        </h1>
        <p className="text-gray-600">
          Choose from our wide selection of quality vehicles
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Filter Cars</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Categories</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Luxury">Luxury</option>
              <option value="Electric">Electric</option>
              <option value="Sports">Sports</option>
              <option value="Compact SUV">Compact SUV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transmission
            </label>
            <select
              name="transmission"
              value={filters.transmission}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price/Day
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="$0"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price/Day
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="$1000"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={resetFilters}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
        >
          Reset Filters
        </button>
      </div>

      {/* Cars Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading cars...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No cars found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
