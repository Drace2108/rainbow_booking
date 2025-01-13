import '../App.css';
import { useEffect, useState } from 'react';

function Schedule() {
  const [bookings, setBookings] = useState([]);
  const [mode, setMode] = useState("add booking");
  const today = new Date();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    fetch("http://localhost:3000/bookings")
      .then(response => response.json())
      .then(data => setBookings(data))
      .catch(error => console.error('Error fetching bookings:', error));
  };

  const handleBooking = (colIndex, rowIndex) => {
    const time = formatTime(rowIndex);
    const date = formatDate(colIndex);
    const bookingId = bookings.find(booking => booking.date === date && booking.time === time)?._id;
    const userId = "user1";

    const url = mode === "add booking" ? "http://localhost:3000/book" : `http://localhost:3000/bookings/${bookingId}?userId=${userId}`;
    const method = mode === "add booking" ? "POST" : "DELETE";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: mode === "add booking" ? JSON.stringify({ userId, date, time }) : null
    })
      .then(fetchBookings)
      .catch(error => console.error(`Error ${mode === "add booking" ? "making" : "deleting"} booking:`, error));
  };

  const formatTime = (rowIndex) => `${String(rowIndex).padStart(2, '0')}:00`;

  const formatDate = (colIndex) => {
    const date = new Date(today.getTime() + (colIndex * 24 * 60 * 60 * 1000));
    return date.toISOString().split('T')[0]; // Format to yyyy-mm-dd
  };

  const isAvailableToBook = (colIndex, rowIndex) => {
    const time = formatTime(rowIndex);
    const date = formatDate(colIndex);
    console.log(date, time)
    return bookings.some(booking => booking.date == date && booking.time == time);
  };

  const findDetails = (colIndex, rowIndex) => {
    const time = formatTime(rowIndex);
    const date = formatDate(colIndex);
    const booking = bookings.find(booking => booking.date === date && booking.time === time);
    return booking ? `Booked by ${booking.userId}` : mode === "add booking" ? "Book" : "Delete";
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
      <button onClick={() => setMode(mode === "add booking" ? "delete booking" : "add booking")} style={{ margin: '20px 0' }}>
        Mode: {mode}
      </button>
      <table style={{ width: '70%', textAlign: 'center' }}>
        <thead>
          <tr>
            <th>Time</th>
            {Array.from({ length: 7 }, (_, i) => (
              <th key={i}>{new Date(today.getTime() + (i * 24 * 60 * 60 * 1000)).toDateString()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 24 }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <td>{formatTime(rowIndex)}</td>
              {Array.from({ length: 7 }, (_, colIndex) => (
                <td key={colIndex}>
                  <button onClick={() => handleBooking(colIndex, rowIndex)} disabled={mode === "add booking" ? isAvailableToBook(colIndex, rowIndex) : !isAvailableToBook(colIndex, rowIndex)}>
                    {findDetails(colIndex, rowIndex)}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Schedule;
