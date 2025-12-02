import { Link } from 'react-router-dom';

function CarCard({ car }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      <img
        src={car.image_url}
        alt={`${car.brand} ${car.model}`}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">
          {car.brand} {car.model}
        </h3>
        <p className="text-gray-600 text-sm mt-1">{car.year}</p>
        
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-semibold mr-2">Category:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {car.category}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">Transmission:</span>
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">Seats:</span>
            <span>{car.seats}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">Fuel:</span>
            <span>{car.fuel_type}</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ${car.price_per_day}
            </span>
            <span className="text-gray-600 text-sm">/day</span>
          </div>
          <Link
            to={`/cars/${car.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CarCard;
