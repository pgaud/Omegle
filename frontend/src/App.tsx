import React from 'react';
import {Route, BrowserRouter, Routes } from 'react-router-dom';
import './App.css';
import { Landing } from './component/Landing';
import { Room } from './component/Room';

function App() {
  return (
   <BrowserRouter>
    <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
   </BrowserRouter>
  );
}

export default App;
