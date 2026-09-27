import {Link,NavLink,Outlet,useNavigate} from 'react-router-dom';import {useAuth} from '../context/AuthContext';
export default function Layout(){
    
    const {user,logout}=useAuth(),
    
    nav=useNavigate();return <><header className="topbar"><Link className="brand" to="/dashboard"><span className="brandmark">T</span><span>TRACE<small>Evidence Reconstruction</small>
    </span></Link><nav><NavLink to="/dashboard">Dashboard</NavLink><NavLink to="/incidents">Incidents</NavLink>
    
    {user?.role==='ADMIN'&&<NavLink to="/admin">Admin</NavLink>}</nav><div className="userbox"><span>{user?.name}<small>
        {
        user?.role?.replace('_',' ')}</small></span><button className="button secondary compact" onClick={async()=>{await logout();nav('/login')

        }
    }>Log out</button></div></header><main className="shell"><Outlet/></main></>
}
