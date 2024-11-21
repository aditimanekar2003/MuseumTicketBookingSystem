import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedMuseums from '../components/RelatedMuseums';
import axios from 'axios';
import { toast } from 'react-toastify';

const Booking = () => {
  const { docId } = useParams();
  const { Museums, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [numCandidates, setNumCandidates] = useState(1);
  const [totalFees, setTotalFees] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const navigate = useNavigate();

  const fetchDocInfo = async () => {
    const docInfo = Museums.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
    if (docInfo) {
      setTotalFees(docInfo.fees);
    }
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);
    let today = new Date();
    let allSlots = [];

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = `${day}_${month}_${year}`;
        const slotTime = formattedTime;

        const isSlotBooked =
          docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime);

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
          slotKey: `${slotDate}@${slotTime}`,
          isBooked: isSlotBooked,
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      allSlots.push({ date: new Date(today.getTime() + i * 86400000), timeSlots });
    }

    setDocSlots(allSlots);
  };

  const handleNumCandidatesChange = (e) => {
    const candidates = parseInt(e.target.value);
    if (candidates >= 1 && candidates <= 50) {
      setNumCandidates(candidates);
      setTotalFees(docInfo.fees * candidates);
    } else {
      toast.warning('Number of candidates must be between 1 and 50');
    }
  };

  const confirmBooking = () => {
    if (!selectedSlot || numCandidates < 1 || numCandidates > 50) {
      toast.warning('Please select a valid slot and number of candidates.');
      return;
    }

    setShowConfirmation(true);
  };

  const finalizeBooking = async () => {
    if (!token) {
      toast.warning('Login to book Ticket');
      return navigate('/login');
    }

    const [slotDate, slotTime] = selectedSlot.split('@');

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-Booking`,
        {
          docId,
          slotDate,
          slotTime,
          numCandidates,
          totalFees,
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctosData();
        navigate('/my-Bookings');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (Museums.length > 0) {
      fetchDocInfo();
    }
  }, [Museums, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  return docInfo ? (
    <div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img className="bg-primary w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt="" />
        </div>

        <div className="flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
            {docInfo.name} <img className="w-5" src={assets.verified_icon} alt="" />
          </p>
          <p className="text-gray-600 font-medium mt-4">
            Booking fee: <span className="text-gray-800">{currencySymbol}{totalFees}</span>
          </p>
          <div className="mt-4">
            <label htmlFor="candidates" className="text-gray-700">Number of candidates:</label>
            <input
              id="candidates"
              type="number"
              value={numCandidates}
              onChange={handleNumCandidatesChange}
              min="1"
              max="50"
              className="border border-gray-300 rounded-md p-2 ml-2"
            />
          </div>

          {/* Address Display */}
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700">Address</h3>
            <p className="text-gray-600 mt-2">{docInfo.address.line1}</p>
            <p className="text-gray-600 mt-2">{docInfo.address.line2}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700">About</h3>
        <p className="text-gray-600 mt-2">{docInfo.about}</p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700">Booking Slots</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {docSlots.map((day, dayIndex) => (
            <div key={dayIndex}>
              <p className="font-medium">{daysOfWeek[day.date.getDay()]} {day.date.toLocaleDateString()}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {day.timeSlots.map((slot, slotIndex) => (
                  <button
                    key={slotIndex}
                    onClick={() => !slot.isBooked && setSelectedSlot(slot.slotKey)}
                    className={`text-center px-5 py-2 rounded-full border ${
                      slot.isBooked
                        ? 'bg-red-500 text-white cursor-not-allowed'
                        : selectedSlot === slot.slotKey
                        ? 'bg-primary text-white'
                        : 'border-gray-300'
                    }`}
                    disabled={slot.isBooked}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center sm:justify-start gap-6 mt-10">
        <button onClick={confirmBooking} className="bg-primary text-white px-20 py-3 rounded-full font-medium">
          Confirm Booking
        </button>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold">Confirm Booking</h3>
            <p>Slot: {selectedSlot.split('@')[1]}</p>
            <p>Number of Candidates: {numCandidates}</p>
            <p>Total Fees: {currencySymbol}{totalFees}</p>
            <div className="flex justify-between gap-4 mt-4">
              <button onClick={finalizeBooking} className="bg-primary text-white px-6 py-2 rounded-md">Confirm</button>
              <button onClick={() => setShowConfirmation(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default Booking;
