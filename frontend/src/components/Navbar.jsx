import React, { useEffect, useRef, useState } from 'react'
import { navbarStyles } from '../assets/dummyStyles';
import img1 from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { User } from 'lucide-react';
import axios from 'axios';


const BASE_URL = import.meta.env.VITE_BASE_URL;



const Navbar = ({user: propUser, onLogout}) => {

    const navigate = useNavigate();
    const menuRef = useRef();
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(propUser || { name: "", email: "" });


    // to fetch user profile from server
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if(!token){
                    return;
                }
                const response = await axios.get(`${BASE_URL}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userData = response.data.user || response.data;
                setUser(userData);
            }catch(err){
                console.log("failed to load the profile: ", err);
            }
        };
        if(!propUser){
            fetchUserData();
        }
    }, [propUser]);


    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    const handleLogout = () => {
        setMenuOpen(false);
        localStorage.removeItem("token");
        onLogout?.();
        navigate("/login");
    };
    // closes toggle menu if clicked outside the box
     useEffect(() => {
        const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setMenuOpen(false);
        }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  return (
    <header className={navbarStyles.header}>
        <div className={navbarStyles.container}>
            {/* logo */}
            <div 
                onClick={()=> navigate("/")} 
                className={navbarStyles.logoContainer}
            >
                <div className={navbarStyles.logoImage}>
                    <img src={img1} alt="logo" />
                </div>
                <span className={navbarStyles.logoText}>Expense Tracker</span>
            </div>
            {/* if the user is present */}
            {user && (
                <div className={navbarStyles.userContainer} ref={menuRef}>
                    <button onClick={toggleMenu} className={navbarStyles.userButton}>
                        <div className="relative">
                            <div className={navbarStyles.userAvatar}>
                                {user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className={navbarStyles.statusIndicator}></div>
                        </div>
                        <div className={navbarStyles.userTextContainer}>
                            <p className={navbarStyles.userName}>{user?.name || "User"}</p>
                            <p className={navbarStyles.userEmail}>{user?.email || "user@gmail.com"}</p>
                            
                        </div>
                        <ChevronDown className={navbarStyles.chevronIcon(menuOpen)}></ChevronDown>
                    </button>

                    {/* dropdown menu */}
                    {menuOpen && (
                        <div className={navbarStyles.dropdownMenu}>
                            <div className={navbarStyles.dropdownHeader}>
                                <div className='flex items-center gap-3'>
                                    <div className={navbarStyles.dropdownAvatar}>
                                        {user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <div className={navbarStyles.dropdownName}>
                                            {user?.name || "User"}
                                        </div>
                                        <div className={navbarStyles.dropdownEmail}>
                                            {user?.email || "user@gmail.com"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={navbarStyles.menuItemContainer}>
                                <button onClick={()=>{
                                    setMenuOpen(false);
                                    navigate("/profile");
                                    }}
                                    className={navbarStyles.menuItem}
                                >
                                    <User className=" w-4 h-4"/>
                                    <span>My Profile</span>
                                </button>
                            </div>
                            <div className={navbarStyles.menuItemBorder}>
                                <button 
                                    className={navbarStyles.logoutButton}
                                    onClick={handleLogout}
                                >
                                    <LogOut className=" w-4 h-4"/>
                                    <span>Logout</span>
                                </button>
                                

                            </div>
                        </div>

                    )}
                </div>
            )}
        </div>
    </header>


  )
}

export default Navbar