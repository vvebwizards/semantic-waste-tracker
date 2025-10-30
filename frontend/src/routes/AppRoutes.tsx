import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../frontOffice/pages/Home';
import Register from '../frontOffice/pages/Register';
import Login from '../frontOffice/pages/Login';
import NotFound from '../frontOffice/pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
