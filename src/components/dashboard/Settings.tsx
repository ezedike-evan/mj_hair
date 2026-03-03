import { Bell, Shield, Moon, Fingerprint, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Settings() {
    const loginHistory = useQuery(api.settings.getLoginHistory) || [];
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div className="bg-white rounded-[24px] p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Poppins']">Settings</h2>

            <div className="space-y-6">
                {/* Account Security */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase ml-1">Account Security</h3>

                    <div className="bg-gray-50 rounded-2xl p-4">
                        <SettingItem
                            icon={<Fingerprint className="text-purple-500" />}
                            title="Two-Factor Authentication"
                            subtitle="Add an extra layer of security to your account"
                            toggle
                        />
                        <div className="h-px bg-gray-200 my-4 mx-12"></div>

                        <div className="flex flex-col">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                        <Shield className="text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">Login History</h4>
                                        <p className="text-xs text-gray-500">View your recent login activity</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-xs font-bold text-gray-500 hover:text-[#6A3E1D] bg-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1"
                                >
                                    {showHistory ? "Hide" : "View"}
                                    {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </div>

                            {showHistory && (
                                <div className="mt-4 pl-14">
                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                        {loginHistory.length === 0 ? (
                                            <p className="p-4 text-xs text-gray-400 text-center">No history available.</p>
                                        ) : (
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-xs text-gray-400 font-bold uppercase">
                                                    <tr>
                                                        <th className="p-3 pl-4">Device</th>
                                                        <th className="p-3">Location</th>
                                                        <th className="p-3 text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-xs text-gray-600 font-medium">
                                                    {loginHistory.map((login: any, i: number) => (
                                                        <tr key={i} className="border-t border-gray-50">
                                                            <td className="p-3 pl-4">{login.device}</td>
                                                            <td className="p-3">{login.location}</td>
                                                            <td className="p-3 text-right">{new Date(login.timestamp).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase ml-1">Preferences</h3>

                    <div className="bg-gray-50 rounded-2xl p-4">
                        <SettingItem
                            icon={<Bell className="text-orange-500" />}
                            title="Push Notifications"
                            subtitle="Receive updates about your orders"
                            toggle
                            defaultChecked
                        />
                        <div className="h-px bg-gray-200 my-4 mx-12"></div>
                        <SettingItem
                            icon={<Moon className="text-blue-500" />}
                            title="Dark Mode"
                            subtitle="Switch between light and dark themes"
                            toggle
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                // In a real app, this would call a deletion mutation
                                // toast.success("Account deletion scheduled. You will be logged out.");
                                alert("For security reasons, please contact support@mjhair.example.com to finalize account deletion.");
                            }
                        }}
                        className="text-red-500 font-bold text-sm hover:bg-red-50 px-4 py-2 rounded-lg transition"
                    >
                        Delete Account
                    </button>
                    <p className="text-xs text-gray-400 px-4 mt-1">Permanently allow us to remove your data.</p>
                </div>
            </div>
        </div>
    );
}

function SettingItem({ icon, title, subtitle, toggle, defaultChecked = false }: any) {
    const [isChecked, setIsChecked] = useState(defaultChecked);

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
                    <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
            </div>

            {toggle && (
                <button
                    onClick={() => setIsChecked(!isChecked)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${isChecked ? 'bg-[#6A3E1D]' : 'bg-gray-200'}`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            )}
        </div>
    );
}