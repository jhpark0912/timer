import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TaskManage from './pages/TaskManage';
import ActivityManual from './pages/ActivityManual';
import TimeTreePage from './pages/TimeTreePage';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskManage />} />
          <Route path="/activity" element={<ActivityManual />} />
          <Route path="/timetree" element={<TimeTreePage />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
