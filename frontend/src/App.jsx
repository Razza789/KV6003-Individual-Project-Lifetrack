import Home from './pages/Home'
import AccountSettings from './pages/AccountSettings'
import FinancialData from './pages/Financial'
import Dietary from './pages/Calories'
import ProductivityTracker from './pages/Productivity'
import Menu from './components/Menu'
import { Routes, Route} from "react-router-dom"
import SignIn from './components/SignIn'
import { useState } from 'react'

/**
 * Router
 * 
 * This will be the router for the website
 * it will be what displays the paths and for content, it will only show notes if its set to signedin
 * @author Ryan Field
 */
function App() {

  const [signedIn, setSignedIn] = useState(false);

  return (
    <>
      <SignIn signedIn={signedIn} setSignedIn={setSignedIn} />
      {signedIn && <Menu />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        {signedIn && <Route path="/Financial" element={<FinancialData />} />}
        {signedIn && <Route path="/Calories" element={<Dietary />} />}
        {signedIn && <Route path="/Productivity" element={<ProductivityTracker />} />}
        {signedIn && <Route path="/AccountSettings" element={<AccountSettings />} />}
      </Routes>
    </>
  )
}

export default App;
