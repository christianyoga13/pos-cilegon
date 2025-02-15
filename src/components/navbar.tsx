export default function Navbar() {
    return(
    <nav className="bg-gray-800 p-4 flex justify-between items-center w-full">
        <div className="flex items-center">
            <input type="text" placeholder="Search..." className="bg-gray-700 text-white p-2 rounded" />
        </div>
        <div className="flex items-center space-x-4">
            <button className="text-white">Mail</button>
            <button className="text-white">Notification</button>
            <img src="https://media.licdn.com/dms/image/v2/D5635AQH6J8EuZs0XZA/profile-framedphoto-shrink_100_100/profile-framedphoto-shrink_100_100/0/1708619030313?e=1740214800&v=beta&t=bD8lo4WpUcminBS5gGW79Gyp6VwYgdTws0xpu3Xm_w4" alt="Profile" className="w-8 h-8 rounded-full" />
        </div>
    </nav>
    );

}