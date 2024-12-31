
// 'use client'
// import { useState, useEffect } from "react"
// import { getUnreadNotifications, markNotificationAsRead } from "@/app/actions/action"
// import { getUserBalance } from "@/app/actions/action"
// import { getUserByEmail } from "@/app/actions/action"
// import Link from "next/link"
// import { usePathname } from 'next/navigation'
// import { Button } from "@/components/ui/button"
// import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut } from "lucide-react"
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger 
// } from "@/components/ui/dropdown-menu"
// import { Badge } from "@/components/ui/badge"
// import { Web3Auth } from "@web3auth/modal"
// import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
// import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
// import { createUser } from "@/app/actions/action"
// import { useMediaQuery } from "@/app/hooks/useMediaQuery"

// const clientId = process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID 

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: "0xaa36a7",
//   rpcTarget: "https://rpc.ankr.com/eth_sepolia",
//   displayName: "Ethereum Sepolia Testnet",
//   blockExplorerUrl: "https://sepolia.etherscan.io",
//   ticker: "ETH",
//   tickerName: "Ethereum",
//   logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
// };

// const privateKeyProvider = new EthereumPrivateKeyProvider({
//   config: { chainConfig },
// });

// const web3auth = new Web3Auth({
//   clientId,
//   web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, // Changed from SAPPHIRE_MAINNET to TESTNET
//   privateKeyProvider,
// });

// interface HeaderProps {
//   onMenuClick: () => void;
//   totalEarnings: number;
// }
// export default function Header({onMenuClick,totalEarnings}:HeaderProps){
//   const [provider, setProvider] = useState<IProvider | null>(null);
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [userInfo, setUserInfo] = useState<any>(null);
//   const pathname = usePathname()
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [balance, setBalance] = useState(0)
//   const isMobile = useMediaQuery("(max-width: 768px)")

//   useEffect(()=>{
//     const init = async()=>{
//       try{
//         await Web3Auth.initModal();
//         setProvider(Web3Auth.provider)
//         if(Web3Auth.connected){
//           setLoggedIn(true);
//           const user = await Web3Auth.getUserInfo();
//           setUserInfo(user)
//           if(user.email){
//             localStorage.setItem('userEmail',user.email)
//             try{
//               await createUser(user.email,user.name || 'Anonymous')
//             }catch(error){
//                 console.log('Error creating user' , error)
//             }
//           }
//         }
//       }catch(error){
//         console.error('Error initializing web3auth',error)
//       }finally{
//         setLoading(false);
//       }
//     }
//     init()
//   },[])
  

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       if (userInfo && userInfo.email) {
//         const user = await getUserByEmail(userInfo.email);
//         if (user) {
//           const unreadNotifications = await getUnreadNotifications(user.id);
//           setNotifications(unreadNotifications);
//         }
//       }
//     };

//     fetchNotifications();

//     // Set up periodic checking for new notifications
//     const notificationInterval = setInterval(fetchNotifications, 30000); // Check every 30 seconds

//     return () => clearInterval(notificationInterval);
//   }, [userInfo]);

//   useEffect(() => {
//     const fetchUserBalance = async () => {
//       if (userInfo && userInfo.email) {
//         const user = await getUserByEmail(userInfo.email);
//         if (user) {
//           const userBalance = await getUserBalance(user.id);
//           setBalance(userBalance);
//         }
//       }
//     };

//     fetchUserBalance();

//     // Add an event listener for balance updates
//     const handleBalanceUpdate = (event: CustomEvent) => {
//       setBalance(event.detail);
//     };

//     window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);

//     return () => {
//       window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
//     };
//   }, [userInfo]);

//   const login = async () => {
//     if (!Web3Auth) {
//       console.log("web3auth not initialized yet");
//       return;
//     }
//     try {
//       const web3authProvider = await Web3Auth.connect();
//       setProvider(web3authProvider);
//       setLoggedIn(true);
//       const user = await Web3Auth.getUserInfo();
//       setUserInfo(user);
//       if (user.email) {
//         localStorage.setItem('userEmail', user.email);
//         try {
//           await createUser(user.email, user.name || 'Anonymous User');
//         } catch (error) {
//           console.error("Error creating user:", error);
//           // Handle the error appropriately, maybe show a message to the user
//         }
//       }
//     } catch (error) {
//       console.error("Error during login:", error);
//     }
//   };
  
//   const logout = async () => {
//     if (!Web3Auth) {
//       console.log("web3auth not initialized yet");
//       return;
//     }
//     try {
//       await web3Auth.logout();
//       setProvider(null);
//       setLoggedIn(false);
//       setUserInfo(null);
//       localStorage.removeItem('userEmail');
//     } catch (error) {
//       console.error("Error during logout:", error);
//     }
//   };
  
  
//   const getUserInfo = async () => {
//     if (Web3Auth.connected) {
//       const user = await Web3Auth.getUserInfo();
//       setUserInfo(user);
//       if (user.email) {
//         localStorage.setItem('userEmail', user.email);
//         try {
//           await createUser(user.email, user.name || 'Anonymous User');
//         } catch (error) {
//           console.error("Error creating user:", error);
//           // Handle the error appropriately, maybe show a message to the user
//         }
//       }
//     }
//   };
  
//   const handleNotificationClick = async (notificationId: string) => {
//     await markNotificationAsRead(notificationId);
//     // setNotifications(prevNotifications => 
//     //   prevNotifications.filter(notification => notification.id !== notificationId)
//     // );
//   };
  
//   if (loading) {
//     return <div>Loading Web3Auth...</div>;
//   }
  
//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
//         <div className="flex items center justify-between px-4 py-2">
//             <div className="flex items-center">
//                 <Button variant='ghost' size='icon' className="mr-2 md:mr-4" onClick={onMenuClick}>
//                     <Menu className="h-6 w-6 text-gray-800"/>
//                 </Button>
//                 <Link href="/" className=" flex flex-center">
//                 <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2"/>
//                 <span className="font-bold text-base md:text-lg text-gray-800">ZeroWaste</span>
//                 </Link>
//             </div>
//             {!isMobile && (
//           <div className="flex-1 max-w-xl mx-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//               <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             </div>
//           </div>
//         )}
//         <div className="flex items-center">
//           {isMobile && (
//             <Button variant="ghost" size="icon" className="mr-2">
//               <Search className="h-5 w-5"/>
//             </Button>
//           )}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="mr-2 relative">
//                 <Bell className="h-5 w-5" />
//                 {notifications.length > 0 && (
//                   <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
//                     {notifications.length}
//                   </Badge>
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-64">
//               {notifications.length > 0 ? (
//                 notifications.map((notification) => (
//                   <DropdownMenuItem 
//                     key={notification.id}
//                     onClick={() => handleNotificationClick(notification.id)}
//                   >
//                     <div className="flex flex-col">
//                       <span className="font-medium">{notification.type}</span>
//                       <span className="text-sm text-gray-500">{notification.message}</span>
//                     </div>
//                   </DropdownMenuItem>
//                 ))
//               ) : (
//                 <DropdownMenuItem>No new notifications</DropdownMenuItem>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
//             <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
//             <span className="font-semibold text-sm md:text-base text-gray-800">
//               {balance.toFixed(2)}
//             </span>
//           </div>
//           {!loggedIn ? (
//             <Button onClick={login} className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base">
//               Login
//               <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
//             </Button>
//           ) : (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="flex items-center">
//                   <User className="h-5 w-5 mr-1" />
//                   <ChevronDown className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={getUserInfo}>
//                   {userInfo ? userInfo.name : "Fetch User Info"}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Link href="/settings">Profile</Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>Settings</DropdownMenuItem>
//                 <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}
//         </div>
//         </div>
//     </header>
//   )
// }


'use client';
import { useState, useEffect } from 'react';
import { getUnreadNotifications, markNotificationAsRead, getUserBalance, getUserByEmail, createUser } from '@/app/actions/action';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';

const clientId = process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID;
// const clientId = "BMkYouyW30wklc7ljPz2FyUw2f1AjywlhoPBwk755mDBUHDpKDnYlLk1ntW44LNiRJKXit_Er6g3EuYg2waSRl0"
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0xaa36a7',
  rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
  displayName: 'Ethereum Sepolia Testnet',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId: clientId || '',
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
  privateKeyProvider,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
}

interface UserInfo {
  email?: string;
  name?: string;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [balance, setBalance] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
  if (!web3auth) return; // Avoid running if web3auth is null

  const init = async () => {
    try {
      await web3auth.initModal();
      setProvider(web3auth.provider);

      if (web3auth.connected) {
        setLoggedIn(true);
        const user = await web3auth.getUserInfo();
        setUserInfo(user as UserInfo);

        if (user.email) {
          localStorage.setItem('userEmail', user.email);
          try {
            await createUser(user.email, user.name || 'Anonymous');
          } catch (error) {
            console.log('Error creating user', error);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing web3auth:', error);
    } finally {
      setLoading(false);
    }
  };

  init();
}, [web3auth]); // Add `web3auth` as a dependency

const login = async () => {
  if (!web3auth) {
    console.log('Web3Auth is not initialized yet');
    return;
  }

  try {
    if (!web3auth.provider) {
      console.log('Initializing Web3Auth modal...');
      await web3auth.initModal();
    }

    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    setLoggedIn(true);

    const user = await web3auth.getUserInfo();
    setUserInfo(user as UserInfo);

    if (user.email) {
      localStorage.setItem('userEmail', user.email);
      try {
        await createUser(user.email, user.name || 'Anonymous User');
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  } catch (error) {
    console.error('Error during login:', error); // More specific error logging
  }
};

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    fetchNotifications();

    const notificationInterval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

    fetchUserBalance();

    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);

    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, [userInfo]);

  const logout = async () => {
    if (!web3auth) {
      console.log('Web3Auth is not initialized yet');
      return;
    }
    try {
      await web3auth.logout(); // Use the instance 'web3auth'
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem('userEmail');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getUserInfo = async () => {
    if (web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        try {
          await createUser(user.email, user.name || 'Anonymous User');
        } catch (error) {
          console.error("Error creating user:", error);
          // Handle the error appropriately, maybe show a message to the user
        }
      }
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== notificationId)
    );
  };

  if (loading) {
    return <div>Loading Web3Auth...</div>;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:mr-4" onClick={onMenuClick}>
            <Menu className="h-6 w-6 text-gray-800" />
          </Button>
          <Link href="/" className="flex items-center">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <span className="font-bold text-base md:text-lg text-gray-800">ZeroWaste</span>
          </Link>
        </div>
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2">
              <Search className="h-5 w-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} onClick={() => handleNotificationClick(notification.id)}>
                    <div className="flex flex-col">
                      <span className="font-medium">{notification.type}</span>
                      <span className="text-sm text-gray-500">{notification.message}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
            {/* header coins do not change */}
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
            <span className="font-semibold text-sm md:text-base text-gray-800">
              {balance.toFixed(2)}
            </span>
          </div>
          {!loggedIn ? (
            <Button onClick={login} className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base">
              Login
              <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex items-center">
                  <User className="h-5 w-5 mr-1" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={getUserInfo}>
                  {userInfo ? userInfo.name : "Fetch User Info"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
