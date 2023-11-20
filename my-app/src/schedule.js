import React, { useEffect, useState } from 'react';
import { getDatabase, ref, child, get, set } from "firebase/database";
import { database } from "./firebase";
import { useNavigate } from "react-router-dom";

const Schedule = (props) => {
  const { loggedIn, email } = props;
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dbRef = ref(getDatabase());
    get(dbRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setReservations(snapshot.val())
          setLoading(false);
        } else {
          console.log("No data available");
          setLoading(true);
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(true);
      });
  }, []);

  function formatDate(date) {
    const year = String(date.getFullYear()).padStart(4, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add 1 to the month
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");

    return day + month + year + hour;
  }

  const today = new Date();
  const todayIndex = today.getDay();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = [...daysOfWeek.slice(todayIndex), ...daysOfWeek.slice(0, todayIndex)];

  const hours = Array.from({ length: 24 }, (_, index) => index);

  const handleClick = (date) => {
    if (window.confirm(`You want to book at ${date}?`)) {
      const formattedDate = formatDate(date)
      const userDateReservations = {}
      Object.keys(reservations).forEach((key) => {
        if (key.startsWith(formattedDate.slice(0, -2)) && reservations[key].email === email) {
          userDateReservations[key] = reservations[key];
        }
      });
      if (Object.keys(userDateReservations).length < 2){
        set(ref(database, formattedDate), {
          email: email,
        });
        window.location.reload();
      }
      else{
        alert("nah uh")
      }
    }
  };

  if (loading || !loggedIn) {
    return <div>Loading...</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th><button>EXIT</button></th>
          {days.map((day, index) => {
            const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index);
            const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
            return <th key={day}>{day} ({formattedDate})</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {hours.map(hour => (
          <tr key={hour}>
            <td>{hour}:00</td>
            {days.map((day, index) => {
              const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index, hour);
              const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
              return (
                <td key={`${day}-${hour}`}>
                  <button
                    onClick={() => handleClick(date)}
                    disabled={reservations[formatDate(date)]}
                  >
                    {day} - {hour}:00 ({formattedDate}) {reservations[formatDate(date)]?.email}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Schedule;