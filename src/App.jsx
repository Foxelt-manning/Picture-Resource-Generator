import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SearchPinterest from './Components/search'
import NotFound from './Pages/NotFound'
import PwaInstallButton from './Components/PwaInstallButton'
import SavedPage from './Pages/SavedPage'
import SettingsPage from './Pages/SettingsPage'

const App = () => {
  return (
    <BrowserRouter>
      <PwaInstallButton />
      <Routes>
        <Route path='/' element={<SearchPinterest />} />
        <Route path='/saved' element={<SavedPage />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App