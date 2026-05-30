import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SearchPinterest from './Components/search'
import SavedPage from './Pages/SavedPage'
import SettingsPage from './Pages/SettingsPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SearchPinterest />} />
        <Route path='/saved' element={<SavedPage />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App