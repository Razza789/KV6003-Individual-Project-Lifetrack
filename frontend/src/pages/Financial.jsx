import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTable } from 'react-table';
import 'chartjs-adapter-moment';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { TimeScale } from 'chart.js'; // This imports the time scale
import { Button, Input } from '@nextui-org/react';


// Register only the required components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Filler, Legend, TimeScale);


const FinancialData = () => {
  const [description, setDescription] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [dateMade, setDateMade] = useState('');
  const [financialRecords, setFinancialRecords] = useState([]);
  useEffect(() => {
    // Automatically load financial records when the component mounts
    getFinancialData();
  }, []);

  const postFinancialData = () => {
    const token = localStorage.getItem('token');
    const financialData = {
      description,
      amount_spent: amountSpent,
      date_made: dateMade,
    };
    fetch('https://w20017978.nuwebspace.co.uk/lifetrack/App/financial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(financialData),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Clear the form or provide feedback to the user
    })
    .catch(error => console.error('Error:', error));
  };

  const getFinancialData = () => {
    const token = localStorage.getItem('token');

    fetch('https://w20017978.nuwebspace.co.uk/lifetrack/App/financial', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      setFinancialRecords(data.records);
    })
    .catch(error => console.error('Error:', error));
  };

    // Data for bar chart
    const chartData = financialRecords && {
      labels: financialRecords.map(record => record.date_made),
      datasets: [
        {
          label: 'Amount Spent',
          data: financialRecords.map(record => record.amount_spent),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      scales: {
        x: {
          type: 'time',
          time: {
            parser: 'YYYY-MM-DD', // Define the format if your date does not follow ISO format
            tooltipFormat: 'll',
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    };
    
    

      // Configuration for react-table
  const data = React.useMemo(() => financialRecords, [financialRecords]);
  const columns = React.useMemo(() => [
    {
      Header: 'Description',
      accessor: 'description', // accessor is the "key" in the data
    },
    {
      Header: 'Amount Spent',
      accessor: 'amount_spent',
    },
    {
      Header: 'Date Made',
      accessor: 'date_made',
    },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  // Render form for posting financial data and list for displaying it
  return (
    <div className="container mx-auto my-10 p-5">
      <h1 className="text-2xl font-bold text-center mb-5">Financial Data</h1>

      <p1>Please remember that any form of financial data is completely optional!</p1>
      
      <div className="flex flex-col space-y-4">
        <Input
          underlined
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />
        <Input
          underlined
          placeholder="Amount Spent"
          type="number"
          value={amountSpent}
          onChange={(e) => setAmountSpent(e.target.value)}
          className="w-full"
        />
        <Input
          underlined
          labelPlaceholder="Date"
          type="date"
          value={dateMade}
          onChange={(e) => setDateMade(e.target.value)}
          className="w-full"
        />
        <Button flat auto color="primary" onClick={postFinancialData}>
          Submit
        </Button>
      </div>

      <div className="text-center my-4">
        <Button flat auto color="secondary" onClick={getFinancialData}>
          Load Financial Records
        </Button>
      </div>
      
      {financialRecords && financialRecords.length > 0 && (
        <Bar data={chartData} options={options} />
      )}
  
      {/* Table to display financial records */}
      <div className="overflow-x-auto mt-5"></div>
      <table {...getTableProps()} style={{ width: '100%', marginTop: '20px' }}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} style={{ padding: '10px', borderBottom: '2px solid black' }}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} style={{ padding: '10px', borderTop: '1px solid gray' }}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

};

export default FinancialData;