import React from 'react'
import { createRoot } from 'react-dom/client'
import { DashboardApp } from './ui/DashboardApp'
import '../index.css'

const container = document.getElementById('root')!
createRoot(container).render(
  <React.StrictMode>
    <DashboardApp />
  </React.StrictMode>
)
