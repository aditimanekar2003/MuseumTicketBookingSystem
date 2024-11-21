import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';

const Museums = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const { Museums } = useContext(AppContext);

  const applyFilter = () => {
    let filteredMuseums = Museums;

    // Filter by speciality if it exists
    if (speciality) {
      filteredMuseums = Museums.filter(doc => doc.speciality === speciality);
    }

    // Filter by search query
    if (searchQuery) {
      filteredMuseums = filteredMuseums.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilterDoc(filteredMuseums);
  };

  useEffect(() => {
    applyFilter();
  }, [Museums, speciality, searchQuery]); // Add searchQuery to dependency array

  return (
    <div>
      <p className="text-gray-600">Browse through the Museums specialist.</p>
      
      {/* Search Bar */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search Museums... 🔍"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/3 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? 'bg-primary text-white' : ''
          }`}
        >
          Filters
        </button>
        <div
          className={`flex-col gap-4 text-sm text-gray-600 ${
            showFilter ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {/* "All Museums" Option */}
          <p
            onClick={() => navigate('/Museums')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              !speciality && searchQuery === '' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            All Museums
          </p>

          {/* Filter Options */}
          <p
            onClick={() =>
              speciality === 'Art Museum'
                ? navigate('/Museums')
                : navigate('/Museums/Art Museum')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Art Museum' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            Art Museum
          </p>
          <p
            onClick={() =>
              speciality === 'History Museum'
                ? navigate('/Museums')
                : navigate('/Museums/History Museum')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'History Museum' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            History Museum
          </p>
          <p
            onClick={() =>
              speciality === 'Science Museum'
                ? navigate('/Museums')
                : navigate('/Museums/Science Museum')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Science Museum' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            Science Museum
          </p>
          <p
            onClick={() =>
              speciality === 'Natural History Museum'
                ? navigate('/Museums')
                : navigate('/Museums/Natural History Museum')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Natural History Museum'
                ? 'bg-[#E2E5FF] text-black'
                : ''
            }`}
          >
            Natural History Museum
          </p>
          <p
            onClick={() =>
              speciality === 'Cultural Museum'
                ? navigate('/Museums')
                : navigate('/Museums/Cultural Museum')
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Cultural Museum' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            Cultural Museum
          </p>
        </div>

        {/* Museums Grid */}
        <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
          {filterDoc.map((item, index) => (
            <div
              onClick={() => {
                navigate(`/Booking/${item._id}`);
                scrollTo(0, 0);
              }}
              className="border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              key={index}
            >
              <img className="bg-[#EAEFFF]" src={item.image} alt="" />
              <div className="p-4">
                <div
                  className={`flex items-center gap-2 text-sm text-center ${
                    item.available ? 'text-green-500' : 'text-gray-500'
                  }`}
                >
                  <p
                    className={`w-2 h-2 rounded-full ${
                      item.available ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  ></p>
                  <p>{item.available ? 'Available' : 'Not Available'}</p>
                </div>
                <p className="text-[#262626] text-lg font-medium">{item.name}</p>
                <p className="text-[#5C5C5C] text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Museums;
