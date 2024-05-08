import React, { useState, useEffect } from 'react';
import { Input, Button, Checkbox } from '@nextui-org/react';

export default function AccountSettings() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Handlers for password fields
  const handleCurrentPasswordChange = (event) => setCurrentPassword(event.target.value);
  const handleNewPasswordChange = (event) => setNewPassword(event.target.value);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  // Gets the token from storage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`https://w20017978.nuwebspace.co.uk/lifetrack/App/account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data) { // If data is an object, not an array
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setEmail(data.email || '');
          setPhoneNumber(data.phone_number || '');
        } else {
          throw new Error('User data is not in the expected format');
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
    } else {
      console.error('No token found');
    }
  }, []);


  const handleSubmit = (event) => {
    event.preventDefault();
  
    // Construct the payload object
    const payload = {
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(email && { email: email }),
      ...(phoneNumber && { phone_number: phoneNumber }),
      ...(newPassword && { password: newPassword }), // Assuming you want to update the password
    };
  
    const url = `https://w20017978.nuwebspace.co.uk/lifetrack/App/account`;
  
    fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json', // Indicate that we're sending a JSON body
      },
      body: JSON.stringify(payload), // Convert the payload object into a JSON string
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      // Handle success feedback here, like showing a message to the user
    })
    .catch(error => {
      console.error('Error updating user data:', error);
      // Handle errors here, like showing a message to the user
    });
  };

  const handleDeleteAccount = () => {
    // Confirm account deletion
    if (window.confirm('Are you sure you want to delete your account?')) {
      // Delete user account from the backend
      fetch(`https://w20017978.nuwebspace.co.uk/lifetrack/App/account`, {
        method: 'DELETE',
        headers: {
          // Include the Authorization header with the Bearer token
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          // If you want to know the exact status code, you can log it here
          console.error(`HTTP error! status: ${response.status}`);
          throw new Error('Network response was not ok');
        }
        // Handle account deletion success
        console.log('Account deleted successfully');
        // It's a good idea to clear local storage and update state here
        localStorage.removeItem('token');
        // Update the signed-in state if needed
        // props.setSignedIn(false);
      })
      .catch(error => {
        console.error('Error deleting account:', error);
      });
    }
  };


  return (
    <div className="container mx-auto my-10 p-8 bg-white shadow-lg max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900">First Name</label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            bordered
          />
        </div>
        <div className="mb-6">
          <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900">Last Name</label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            bordered
          />
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            bordered
          />
        </div>
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium text-gray-900">Phone Number</label>
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            bordered
          />
        </div>
        {/* Current Password Input */}
        <div className="mb-6">
          <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-gray-900">
            Current Password
          </label>
          <Input
            id="currentPassword"
            type={showPassword ? "text" : "password"}
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            fullWidth
            bordered
          />
        </div>

        {/* New Password Input */}
        <div className="mb-6">
          <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900">
            New Password
          </label>
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={handleNewPasswordChange}
            fullWidth
            bordered
          />
        </div>
        {/* Toggle Show Password */}
          <div className="mb-6 flex items-center">
            <Checkbox checked={showPassword} onChange={toggleShowPassword} />
            <span className="ml-2 text-sm font-medium text-gray-900">
            Show Password
            </span>
        </div>
        <div className="flex justify-end space-x-4">
          <Button auto flat color="error" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
          <Button type="submit" color="primary" auto>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}