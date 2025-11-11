import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/CDC/Dashboard";
import Registration from "./pages/CDC/Registration";
import VirtualC from "./pages/CDC/VirtualC";
import ActivitySubmissions from "./pages/CDC/ActivitySubmissions";
import Profile from "./pages/CDC/Profile";
import Attendance from "./pages/CDC/Attendance";
import WeeklyPlans from "./pages/CDC/WeeklyPlans";
import StudentWeeklyPlans from "./pages/CDC/StudentWeeklyPlans";
import ChildrenProgress from "./pages/CDC/ChildrenProgress";
import Login from "./pages/CDC/Login";
import RegistrationForm from "./pages/CDC/RegistrationForm";
import CDCProfileForm from "./pages/CDC/CDProfile";
import DomainForm from "./pages/CDC/Domain";
import CDCStudentList from "./pages/CDC/StudentList";
import CreateParent from "./pages/CDC/CreateParent";
import StudentProfile from "./pages/CDC/StudentProfile";
import CDCInstructionalMaterials from "./pages/CDC/InstructionalMaterials";

import ECCDCCreateAcc from "./pages/ECCDC/ECCDC_CreateCDC";
import ECCDCProfile from "./pages/ECCDC/ECCDC_Profile"
import ECCDCAccount from "./pages/ECCDC/ECCDC_AccountList";
import UserProfile from "./pages/ECCDC/UserProfile";

import PresDashboard from "./pages/President/PresidentDashboard";
import AccList from "./pages/President/AccountList";
import PresVC from "./pages/President/PresVirtualC";
import PresWeeklyPlans from "./pages/President/WeeklyPlans";
import PresidentProfile from "./pages/President/President_Profile";
import WorkerProfile from "./pages/President/WorkerProfile";
import InstructionalMaterials from "./pages/President/InstructionalMaterials";

import ParentVirtualC from "./pages/Parent/ParentVirtualC";
import ParentDashboard from "./pages/Parent/ParentDashboard";
import ParentProfile from "./pages/Parent/ParentProfile";
import ChildProgress from "./pages/Parent/ChildProgress";
import ParentClassworks from "./pages/Parent/ParentClassworks";
import ActivityDetail from "./pages/Parent/ActivityDetail";

import AdminDashboard from "./pages/Admin/AdminDasboard";
import AccountList from "./pages/Admin/AccountList";
import ManageAcc from "./pages/Admin/ManageAcc";
import AdminProfile from "./pages/Admin/AdminProfile";

import ProtectedRoute from "./components/all/ProtectedRoute";

export default function App() {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserType(user.type); // Set user type from localStorages
    }
  }, []);

  //test

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Worker (CDC) Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedTypes={["worker"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/registration" element={<ProtectedRoute allowedTypes={["worker", "admin"]}><Registration /></ProtectedRoute>} />
  <Route path="/virtual-classroom" element={<ProtectedRoute allowedTypes={["worker", "admin"]}><VirtualC /></ProtectedRoute>} />
  <Route path="/cdc/activity/:activityId" element={<ProtectedRoute allowedTypes={["worker"]}><ActivitySubmissions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedTypes={["worker", "admin"]}><Profile /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute allowedTypes={["worker", "admin"]}><Attendance /></ProtectedRoute>} />
        <Route path="/weekly-plans" element={<ProtectedRoute allowedTypes={["worker", "admin"]}><WeeklyPlans /></ProtectedRoute>} />
        <Route path="/student-weekly-plans" element={<ProtectedRoute allowedTypes={["worker", "admin"]}><StudentWeeklyPlans /></ProtectedRoute>} />
        <Route path="/children-progress" element={<ProtectedRoute allowedTypes={["worker", "admin"]}><ChildrenProgress /></ProtectedRoute>} />
        <Route path="/domain-form" element={<ProtectedRoute allowedTypes={["worker", "admin"]}><DomainForm /></ProtectedRoute>} />
        <Route path="/student-list" element={<ProtectedRoute allowedTypes={["worker"]}><CDCStudentList /></ProtectedRoute>} />
        <Route path="/create-parent" element={<ProtectedRoute allowedTypes={["worker"]}><CreateParent /></ProtectedRoute>} />
        <Route path="/student-profile/:studentId" element={<ProtectedRoute allowedTypes={["worker"]}><StudentProfile /></ProtectedRoute>} />
        <Route path="/cdc-instructional-materials" element={<ProtectedRoute allowedTypes={["worker"]}><CDCInstructionalMaterials /></ProtectedRoute>} />
        <Route path="/forms/registration" element={<ProtectedRoute allowedTypes={["worker"]}><RegistrationForm /></ProtectedRoute>} />
        <Route path="/forms/center-profile" element={<ProtectedRoute allowedTypes={["worker"]}><CDCProfileForm /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedTypes={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute allowedTypes={["admin"]}><AccountList /></ProtectedRoute>} />
        <Route path="/account-list" element={<ProtectedRoute allowedTypes={["admin"]}><AccountList /></ProtectedRoute>} />
        <Route path="/manage-account" element={<ProtectedRoute allowedTypes={["admin"]}><ManageAcc /></ProtectedRoute>} />
        <Route path="/admin-profile" element={<ProtectedRoute allowedTypes={["admin"]}><AdminProfile /></ProtectedRoute>} />

        {/* ECCDC Routes */}
        <Route path="/eccdc-createacc" element={<ProtectedRoute allowedTypes={["eccdc"]}><ECCDCCreateAcc /></ProtectedRoute>} />
        <Route path="/eccdc-profile" element={<ProtectedRoute allowedTypes={["eccdc"]}><ECCDCProfile /></ProtectedRoute>} />
        <Route path="/eccdc-list" element={<ProtectedRoute allowedTypes={["eccdc"]}><ECCDCAccount /></ProtectedRoute>} />
        <Route path="/president-list" element={<ProtectedRoute allowedTypes={["eccdc"]}><ECCDCAccount /></ProtectedRoute>} />
        
        {/* President Routes */}
        <Route path="/president-dashboard" element={<ProtectedRoute allowedTypes={["president"]}><PresDashboard /></ProtectedRoute>} />
        <Route path="/pres-account-list" element={<ProtectedRoute allowedTypes={["president"]}><AccList /></ProtectedRoute>} />
        <Route path="/pres-virtualc" element={<ProtectedRoute allowedTypes={["president"]}><PresVC /></ProtectedRoute>} />
        <Route path="/pres-weekly-plans" element={<ProtectedRoute allowedTypes={["president"]}><PresWeeklyPlans /></ProtectedRoute>} />
        <Route path="/president-profile" element={<ProtectedRoute allowedTypes={["president"]}><PresidentProfile /></ProtectedRoute>} />
        <Route path="/instructional-materials" element={<ProtectedRoute allowedTypes={["president"]}><InstructionalMaterials /></ProtectedRoute>} />
        <Route path="/worker-profile/:id" element={<ProtectedRoute allowedTypes={["president"]}><WorkerProfile /></ProtectedRoute>} />
        
        {/* Parent Routes */}
        <Route path="/parent-announcement" element={<ProtectedRoute allowedTypes={["parent"]}><ParentVirtualC /></ProtectedRoute>} />
        <Route path="/parent-classworks" element={<ProtectedRoute allowedTypes={["parent"]}><ParentClassworks /></ProtectedRoute>} />
        <Route path="/parent-dashboard" element={<ProtectedRoute allowedTypes={["parent"]}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent-profile" element={<ProtectedRoute allowedTypes={["parent"]}><ParentProfile /></ProtectedRoute>} />
        <Route path="/child-progress" element={<ProtectedRoute allowedTypes={["parent"]}><ChildProgress /></ProtectedRoute>} />
        <Route path="/parent/activity/:activityId" element={<ProtectedRoute allowedTypes={["parent"]}><ActivityDetail /></ProtectedRoute>} />

        {/* Shared Routes */}
        <Route
          path="/eccdc/user-profile/:id"
          element={
            <ProtectedRoute allowedTypes={["admin", "eccdc", "president", "parent"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-profile/:id"
          element={
            <ProtectedRoute allowedTypes={["admin", "eccdc", "president", "parent"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-profile/:id"
          element={
            <ProtectedRoute allowedTypes={["admin", "eccdc", "president","parent"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}