import {Navigate,Outlet} from 'react-router-dom';import {useAuth} from '../context/AuthContext';
export function Guard()
{
    const {user,ready}=useAuth();
if(!ready)return <div className="loading">Loading TRACE…</div>;return user?<Outlet/>:<Navigate to="/login" replace/>;
}
export function AdminGuard(){const {user}=useAuth();return user?.role==='ADMIN'?<Outlet/>:<Navigate to="/dashboard" replace/>;
}
