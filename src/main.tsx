import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import RoleRouter from './routes/RoleRouter'
import Authservice from './shared/context/Authservice'
import { NotificationProvider } from './shared/context/NotificationContext'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>    
  <StrictMode>
    <Authservice>
      <NotificationProvider>
        <RoleRouter />
      </NotificationProvider>
    </Authservice>
  </StrictMode>
  </BrowserRouter>
)
