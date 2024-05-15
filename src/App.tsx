import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import ListPage from "./Pages/ListPage";
import ProfilePage from "./Pages/ProfilePage";
import Layout from "./Pages/Layout";
import SectionVideos from "./Pages/SectionVideos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<ListPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="section_videos" element={<SectionVideos />} />

        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
