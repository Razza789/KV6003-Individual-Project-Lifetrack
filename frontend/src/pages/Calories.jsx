import React, { useState, useEffect } from 'react';
import { Input, Button, Textarea } from '@nextui-org/react';

const Dietary = () => {
  const [caloriesAte, setCaloriesAte] = useState('');
  const [notes, setNotes] = useState('');
  const [dietaryRecords, setDietaryRecords] = useState([]);

  useEffect(() => {
    // Automatically load dietary records when the component mounts
    getDietaryData();
  }, []);

  const postDietaryData = () => {
    const token = localStorage.getItem('token');
    const dietaryData = {
      calories_ate: caloriesAte,
      notes: notes,
    };

    fetch('https://w20017978.nuwebspace.co.uk/lifetrack/App/dietary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(dietaryData),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Reset form, update state, or provide feedback
      setCaloriesAte('');
      setNotes('');
      getDietaryData(); // Refresh the list
    })
    .catch(error => console.error('Error:', error));
  };

  const getDietaryData = () => {
    const token = localStorage.getItem('token');

    fetch('https://w20017978.nuwebspace.co.uk/lifetrack/App/dietary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      setDietaryRecords(data.records);
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div className="container mx-auto my-10 p-5">
      <h1 className="text-2xl font-bold text-center mb-5">Calorie Tracker</h1>
      <div className="flex flex-col space-y-4 items-center">
        <div className="w-full max-w-xs">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="calories">
            Calories
          </label>
          <Input
            underlined
            clearable
            id="calories"
            type="number"
            value={caloriesAte}
            onChange={(e) => setCaloriesAte(e.target.value)}
            placeholder="Enter calories"
            className="w-full"
          />
        </div>
        <div className="w-full max-w-xs">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes (optional)
          </label>
          <Textarea
            underlined
            clearable
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes"
            className="w-full"
          />
        </div>
        <Button flat auto color="primary" onClick={postDietaryData}>
          Add Record
        </Button>
      </div>
      <div className="text-center my-4">
        <Button flat auto color="secondary" onClick={getDietaryData}>
          Load Dietary Records
        </Button>
      </div>
      <div className="overflow-x-auto mt-5">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Calories</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {dietaryRecords.map(record => (
              <tr key={record.id}>
                <td className="border px-4 py-2">{new Date(record.date_added).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{record.calories_ate}</td>
                <td className="border px-4 py-2">{record.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dietary;
