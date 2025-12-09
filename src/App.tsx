import { useState } from 'react'
import iconSunny from './assets/icon-sunny.png'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='mainPanel'>
        <div className='title'>
          <img className="iconMini" src={iconSunny}></img>
          <h1>  27°C</h1>
        </div>
        <h2>Sunny</h2>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
