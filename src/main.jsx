import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './cabinet.css'
import './premium.css'
import './atelier.css'
import './studio-plus.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
