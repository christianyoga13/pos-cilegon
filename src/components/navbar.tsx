import { Bell, Mail } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
    return(
    <nav className="bg-gray-900 p-4 flex justify-between items-center w-full sticky top-0 z-20">
        <div className="flex items-center">
            <input type="text" placeholder="Search..." className="bg-gray-700 text-white p-2 rounded" />
        </div>
        <div className="flex items-center space-x-6">
            <Mail className="text-white w-6 h-6" />
            <Bell className="text-white w-6 h-6" />
            <Image src="https://media.licdn.com/dms/image/v2/D5635AQH6J8EuZs0XZA/profile-framedphoto-shrink_100_100/profile-framedphoto-shrink_100_100/0/1708619030313?e=1740214800&v=beta&t=bD8lo4WpUcminBS5gGW79Gyp6VwYgdTws0xpu3Xm_w4" alt="Profile" className="w-10 h-10 rounded-full" width={20} height={20} />
        </div>
    </nav>
    );

}