import React from 'react'
import Home from './pages/Home/Home'
import { TaskProvider } from './context/TaskContext'
import { SettingsProvider } from './context/SettingsContext'

const App = () => {
  return (
    <SettingsProvider>
      <TaskProvider>
        <Home />
      </TaskProvider>
    </SettingsProvider>
  )
}

export default App