// import React from "react";
// import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
// import './App.css';
// import Createuser from './Pages/Admin/createuser';
// import AddMembership from './Pages/Admin/addmembership';
// import AddTournament from './Pages/Admin/addtournment';
// import StudentDataManagement from './Pages/Admin/studentdatamanagemant';
// import Payment from './Pages/Admin/payment';
// import CertificateGenerate from './Pages/Admin/certificategenerate';
// import Reports from './Pages/Admin/reports';
// import UserManagement from "./Pages/Sub-Admin/usermanagement";


// function App() {    
//   return (
//     <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<Createuser />} />
//       <Route path="/addmembership" element={<AddMembership />} />
//       <Route path="/addtournament" element={<AddTournament />} />
//       <Route path="/studentdatamanagement" element={<StudentDataManagement />} />
//       <Route path="/payment" element={<Payment />} />
//       <Route path="/certificategenerate" element={<CertificateGenerate />} />
//       <Route path="/reports" element={<Reports />} />
//       <Route path="/usermanagement" element={<UserManagement />} />
//     </Routes>
//     </BrowserRouter>

//   );
// }   

// export default App;


import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import { initializeCsrf } from "./api";

function App() {
  useEffect(() => {
    initializeCsrf();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;