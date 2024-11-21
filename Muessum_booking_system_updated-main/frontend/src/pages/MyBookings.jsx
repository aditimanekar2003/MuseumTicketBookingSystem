import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyBookings = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [payment, setPayment] = useState("");
  const [showTicket, setShowTicket] = useState(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2];
  };

  const getUserBookings = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/Bookings", {
        headers: { token },
      });
      setBookings(data.Bookings.reverse());
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-Booking",
        { BookingId: bookingId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Booking Payment",
      description: "Booking Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verifyRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            setPayment(null);
            navigate("/my-Bookings");
            getUserBookings();
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
          setPayment(null);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const bookingRazorpay = async (bookingId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { BookingId: bookingId },
        { headers: { token } }
      );
      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const calculateTotalPrice = (numCandidates, pricePerSlot) => {
    return numCandidates * pricePerSlot;
  };

  const generateTicket = (bookingId) => {
    setShowTicket(bookingId); // Show the ticket modal
  };

  useEffect(() => {
    if (token) {
      getUserBookings();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 text-lg font-medium text-gray-600 border-b">
        My Bookings
      </p>
      <div>
        {bookings.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b"
          >
            <div>
              <img
                className="w-36 bg-[#EAEFFF]"
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-[#5E5E5E]">
              <p className="text-[#262626] text-base font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-[#464646] font-medium mt-1">Address:</p>
              <p>{item.docData.address.line1}</p>
              <p>{item.docData.address.line2}</p>
              <p className="mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">Date & Time:</span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
              <p className="mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">Number of Candidates:</span>{" "}
                {item.numCandidates}
              </p>
              <p className="mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">Total Fees:</span>{" "}
                Rs {item.amount}
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end text-sm text-center">
              {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                <button
                  onClick={() => setPayment(item._id)}
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Pay Online
                </button>
              )}
              {payment === item._id && (
                <button
                  className="text-[#696969] sm:min-w-48 py-2 border rounded bg-[#EAEFFF] cursor-not-allowed"
                  disabled
                >
                  Processing...
                </button>
              )}
              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border rounded text-[#696969] bg-[#EAEFFF]">
                  Paid
                </button>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelBooking(item._id)}
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel Booking
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border rounded text-[#696969] bg-red-200">
                  Cancelled
                </button>
              )}
              {item.isCompleted && (
                <>
                  <span className="text-green-600 font-bold sm:min-w-48">
                    Completed
                  </span>
                  <button
                    onClick={() => generateTicket(item._id)}
                    className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-green-600 hover:text-white transition-all duration-300"
                  >
                    Generate Ticket
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {showTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold text-center">Museum Pass</h2>
            {bookings
              .filter((item) => item._id === showTicket)
              .map((ticket) => (
                <div key={ticket._id} className="mt-4">
                  <div className="flex justify-center items-center mb-4">
                    <span className="text-green-600 font-bold text-xl flex items-center">
                      Payment Completed{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 ml-2 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  </div>
                  <p><strong>Booking ID:</strong> {ticket._id}</p>
                  <p><strong>Name:</strong> {ticket.docData.name}</p>
                  <p><strong>Date & Time:</strong> {slotDateFormat(ticket.slotDate)} | {ticket.slotTime}</p>
                  <p><strong>Number of Candidates:</strong> {ticket.numCandidates}</p>
                  <p><strong>Total Fees:</strong> Rs {ticket.amount}</p>
                  <p><strong>Address:</strong> {ticket.docData.address.line1}, {ticket.docData.address.line2}</p>
                  <button
                    onClick={() => window.print()}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Print Ticket
                  </button>
                </div>
              ))}
            <button
              onClick={() => setShowTicket(null)}
              className="mt-4 w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
