import React from 'react';
import { House, ShoppingCart, Users, CreditCard, PlusCircle, Package, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { useClerk } from '@clerk/clerk-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const sidebarItems = [
    { icon: House, label: 'Dashboard', href: '/admin' },
    { icon: ShoppingCart, label: 'Order Management', href: '/admin/orders' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: CreditCard, label: 'Sales Report', href: '/admin/sales-report' },
    { icon: PlusCircle, label: 'Add Products', href: '/admin/add-products' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { signOut } = useClerk();

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside
                className={`fixed left-0 top-0 z-30 h-screen w-64 bg-primary-background flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="p-6 flex items-center gap-3">
                    <img src={logo} alt="Mj Hair Palace" className="w-full object-contain" />
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.href}
                            end={item.href === '/admin' || item.href === '/admin/'}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-secondary hover:bg-primary/15 hover:text-primary'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
