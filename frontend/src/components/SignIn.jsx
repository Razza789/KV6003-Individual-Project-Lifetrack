import { useState, useEffect } from 'react'
/**
* Signin component
* 
* This is the signin code that allows users to signin
* to the website and will store their token in a local storage
* 
* @author Ryan Field
*/
function SignIn(props) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [signInError, setSignInError] = useState(false)
    const [signUpError, setSignUpError] = useState(false) // New state for sign-up errors
    const [isSigningUp, setIsSigningUp] = useState(false); // Toggle between sign-in
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); 
    const [signUpSuccess, setSignUpSuccess] = useState(false); 
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    useEffect(
        () => {
            if (localStorage.getItem('token')) {
                props.setSignedIn(true);
            }
        }
        , []
    )

    const signIn = () => {
        const encodedString = btoa(username + ':' + password)

        fetch('https://w20017978.nuwebspace.co.uk/lifetrack/App/token',
            {
                method: 'GET',
                headers: new Headers({ "Authorization": "Basic " + encodedString })
            }
        )
            .then(response => {
                if (response.status === 200) {
                    props.setSignedIn(true)
                    setSignInError(false)
                } else {
                    setSignInError(true)
                }
                return response.json()
            })
            .then(data => {
                if (data.token) {
                    localStorage.setItem('token', data.token)
                }
            })
            .catch(error => console.log(error))
    }
    const signOut = () => {
        props.setSignedIn(false)
        localStorage.removeItem('token')
    }

      
      // Adjusted signUp function to call signInAfterSignUp upon success
      const signUp = () => {


        // Create user object
        const user = {
          first_name: firstName,
          last_name: lastName,
          email: username,
          phone_number: phoneNumber,
          password: password,
        };
      
        console.log('Attempting to sign up with user data:', user);
      
        fetch('https://w20017978.nuwebspace.co.uk/lifetrack/App/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.message === 'User created successfully') {
            setSignUpSuccess(true); // Show the success popup
            setTimeout(() => {
              setSignUpSuccess(false); // Hide the popup after 3 seconds
            }, 3000);
          } else {
              // Handle errors or unsuccessful sign-up
              setSignUpError(true);
          }
      })
      .catch(error => {
          console.error('Error during sign up', error);
          setSignUpError(true);
      });
  };

      

    const toggleSignUp = () => {
        setIsSigningUp(!isSigningUp)
        setSignInError(false)
        setSignUpError(false)
    }


    const handleUsernameChange = (event) => setUsername(event.target.value)
    const handlePasswordChange = (event) => setPassword(event.target.value)
    const handleFirstNameChange = (event) => setFirstName(event.target.value);
    const handleLastNameChange = (event) => setLastName(event.target.value);
    const handlePhoneNumberChange = (event) => setPhoneNumber(event.target.value);

    const bgColour = (signInError) ? " bg-red-200" : " bg-slate-100"

    return (
      <div className='relative bg-purple-900 p-2 text-md text-right'>
        {!props.signedIn && (
          <div>
            {isSigningUp ? (
              // Sign-up form
              <>
                <input type="text" placeholder='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)} className={'p-1 mx-2 rounded-md' + bgColour} />
                <input type="text" placeholder='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)} className={'p-1 mx-2 rounded-md' + bgColour} />
                <input type="tel" placeholder='Phone Number' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={'p-1 mx-2 rounded-md' + bgColour} />
                <input type="email" placeholder='Email' value={username} onChange={(e) => setUsername(e.target.value)} className={'p-1 mx-2 rounded-md' + bgColour} />
                <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className={'p-1 mx-2 rounded-md' + bgColour} />
                <button onClick={signUp} className='py-1 px-2 mx-2 bg-green-100 hover:bg-green-500 rounded-md'>Sign Up</button>
                {signUpSuccess && (
                  <div className="absolute top-0 left-0 right-0 bg-green-500 text-white p-4 rounded-md">
                    <p>Sign up successful! Please sign in.</p>
                  </div>
                )}
              </>
            ) : (
              // Sign-in form
              <>
                <input type="text" placeholder='Email' value={username} onChange={handleUsernameChange} className={'p-1 mx-2 rounded-md' + bgColour} />
                <input type="password" placeholder='Password' value={password} onChange={handlePasswordChange} className={'p-1 mx-2 rounded-md' + bgColour} />
                <button onClick={signIn} className='py-1 px-2 mx-2 bg-green-100 hover:bg-green-500 rounded-md'>Sign In</button>
              </>
            )}
            <button onClick={toggleSignUp} className='py-1 px-2 mx-2 bg-blue-100 hover:bg-blue-500 rounded-md'>
              {isSigningUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        )}
        {props.signedIn && (
          <button onClick={signOut} className='py-1 px-2 mx-2 bg-red-100 hover:bg-red-500 rounded-md'>Sign Out</button>
        )}
        {(signInError || signUpError) && <p className='text-red-500'>Error with username or password</p>}
      </div>
    )
}

export default SignIn;