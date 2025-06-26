// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginScreen from "./screen/auth/LoginScreen";
import HomeSelector from "./screen/HomeSelector";
import MainLayout from "./screen/layout/MainLayout";
import Dashboard from "./screen/page/DashboardScreen";
import ArisanScreen from "./screen/page/ArisanScreen";
import PatunganScreen from "./screen/page/PatunganScreen";
import EdukasiScreen from "./screen/page/EdukasiScreen";
import KoperasiScreen from "./screen/page/KoperasiScreen";
import SedekahScreen from "./screen/page/SedekahScreen";
import UserScreen from "./screen/page/UserScreen";
import GaleryScreen from "./screen/page/GaleryScreen";
import BannerScreen from "./screen/page/BannerScreen";
import SettingScreen from "./screen/page/SettingScreen";



function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeSelector />} />
        <Route path="/HomeScreen" element={<MainLayout />}>
          <Route path="DashboardScreen" index element={<Dashboard />}/>
          <Route path="ArisanScreen" element={<ArisanScreen />}/>
          <Route path="PatunganScreen" element={<PatunganScreen />}/>
          <Route path="BannerScreen" element={<BannerScreen />}/>
          <Route path="SettingScreen" element={<SettingScreen />}/>


          <Route path="EdukasiScreen" element={<EdukasiScreen />}/>
          <Route path="KoperasiScreen" element={<KoperasiScreen />}/>
          <Route path="SedekahScreen" element={<SedekahScreen />}/>
          <Route path="UserScreen" element={<UserScreen />}/>
          <Route path="GaleryScreen" element={<GaleryScreen />}/>
        </Route>
        <Route path="/LoginScreen" element={<LoginScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
