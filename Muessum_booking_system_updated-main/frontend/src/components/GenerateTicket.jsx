import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const GenerateTicket = () => {
  const { bookingId } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.VITE_BACKEND_URL}/api/user/generate-ticket/${bookingId}`,
          {
            headers: { token: localStorage.getItem("token") },
          }
        );
        if (data.success) {
          setTicket(data.ticket);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch ticket details");
      }
    };

    fetchTicket();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (!ticket) {
    return <p>Loading ticket details...</p>;
  }

  return (
    <div className="ticket-container">
      <h1 className="text-xl font-bold text-center my-4">Museum Ticket</h1>
      <div className="ticket-details border p-4 rounded">
        <p><strong>Name:</strong> {ticket.docData.name}</p>
        <p><strong>Speciality:</strong> {ticket.docData.speciality}</p>
        <p><strong>Address:</strong></p>
        <p>{ticket.docData.address.line1}</p>
        <p>{ticket.docData.address.line2}</p>
        <p><strong>Date & Time:</strong> {ticket.slotDate} | {ticket.slotTime}</p>
        <p><strong>Number of Candidates:</strong> {ticket.numCandidates}</p>
        <p><strong>Total Fees:</strong> Rs {ticket.amount}</p>
        <p><strong>Status:</strong> {ticket.isCompleted ? "Completed" : "Pending"}</p>
      </div>
      <button
        onClick={handlePrint}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Print Ticket
      </button>
    </div>
  );
};

export default GenerateTicket;
