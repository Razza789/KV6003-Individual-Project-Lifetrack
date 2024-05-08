import React, { useState, useEffect } from 'react';
import { Input, Button } from '@nextui-org/react';

const ProductivityTracker = () => {
  const [description, setDescription] = useState('');
  const [timeStarted, setTimeStarted] = useState('');
  const [timeCompleted, setTimeCompleted] = useState('');
  const [countdownTime, setCountdownTime] = useState(25 * 60); // Default 25 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive && countdownTime > 0) {
      interval = setInterval(() => {
        setCountdownTime((time) => time - 1);
      }, 1000);
    } else if (!timerActive && countdownTime === 0) {
      clearInterval(interval);
      // Set the time completed to current time once the countdown reaches 0
      setTimeCompleted(new Date().toISOString());
      // Automatically post the session to the database
      handlePostSession();
    }
    return () => clearInterval(interval);
  }, [timerActive, countdownTime]);
  
  const handlePostSession = () => {
    // Only proceed if there is a description and a start time
    if (!description || !timeStarted) {
      alert("Please enter a description and start time.");
      return;
    }
    
    // If there's no timeCompleted set (i.e., the countdown was used), use the current time
    const endTime = timeCompleted || new Date().toISOString();
  
    const token = localStorage.getItem('token');
    const payload = {
      description,
      time_started: timeStarted,
      time_completed: endTime,
    };
  
    fetch('https://w20017978.nuwebspace.co.uk/lifetrack/App/productivity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setDescription('');
      setTimeStarted('');
      setTimeCompleted('');
      setTimerActive(false); // Stop the timer if it was running
      setCountdownTime(25 * 60); // Reset the countdown timer
      loadSessions(); // Reload sessions
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const loadSessions = () => {
    const token = localStorage.getItem('token');

    fetch('https://w20017978.nuwebspace.co.uk/lifetrack/App/productivity', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        setSessions(data.sessions);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  // Start or resume the countdown
  const startTimer = () => {
    setTimeStarted(new Date().toISOString());
    setTimerActive(true);
  };

  // Stop the countdown
  const stopTimer = () => {
    setTimerActive(false);
    if (countdownTime !== 0) {
      setCountdownTime(25 * 60); // Reset to default time if stopped manually
    }
  };

  // Format countdown time into minutes and seconds
  const formatCountdown = () => {
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatDate = (isoString) => {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(isoString));
  };
  

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Productivity Tracker</h1>
      <p>Welcome to the Productivity Tracker! You can either manually input the session times yourself or use the countdown timer.</p>
      <div className="mb-4 w-full max-w-xs">
        <Input
          clearable
          bordered
          fullWidth
          color="primary"
          size="lg"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4 w-full max-w-xs">
        <Input
          type="datetime-local"
          clearable
          bordered
          fullWidth
          color="primary"
          size="lg"
          value={timeStarted}
          onChange={(e) => setTimeStarted(e.target.value)}
        />
      </div>
      <div className="mb-4 w-full max-w-xs">
        <Input
          type="datetime-local"
          clearable
          bordered
          fullWidth
          color="primary"
          size="lg"
          value={timeCompleted}
          onChange={(e) => setTimeCompleted(e.target.value)}
        />
      </div>
      <div className="mb-4 w-full max-w-xs">
        <Input
          type="number"
          clearable
          bordered
          fullWidth
          color="primary"
          size="lg"
          placeholder="Countdown in minutes"
          value={Math.floor(countdownTime / 60)}
          onChange={(e) => setCountdownTime(e.target.value * 60)}
        />
      </div>
      <Button className="mb-2" auto flat color="primary" onClick={startTimer}>
        Start Countdown
      </Button>
      <Button className="mb-2" auto flat color="secondary" onClick={stopTimer}>
        Stop Countdown
      </Button>
      <p className="mb-4">Countdown: {formatCountdown()}</p>
      <Button className="mb-2" auto flat color="primary" onClick={handlePostSession}>
        Add Session
      </Button>
      <Button className="mb-2" auto flat color="secondary" onClick={loadSessions}>
        Load Sessions
      </Button>
      <div className="w-full max-w-xl">
        {sessions.map((session, index) => (
        <div key={index} className="my-2 p-4 border rounded shadow-lg">
        <p><strong>Description:</strong> {session.description}</p>
        <p><strong>Start:</strong> {formatDate(session.time_started)}</p>
        <p><strong>End:</strong> {formatDate(session.time_completed)}</p>
      </div>
      ))}
      </div>
    </div>
  );
};

export default ProductivityTracker;
