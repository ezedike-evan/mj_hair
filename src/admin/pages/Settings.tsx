import React, { useState, useRef } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { User, Lock, Camera, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
];

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { user, isLoaded } = useUser();

    // Profile state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Avatar state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Password visibility toggles
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Populate fields once user loads
    React.useEffect(() => {
        if (user) {
            setFirstName(user.firstName ?? '');
            setLastName(user.lastName ?? '');
            setBio((user.unsafeMetadata?.bio as string) ?? '');
        }
    }, [isLoaded]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setAvatarUploading(true);
        try {
            await user.setProfileImage({ file });
        } catch (err: any) {
            alert(err?.errors?.[0]?.message ?? 'Failed to upload image.');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleProfileSave = async () => {
        if (!user) return;
        setProfileSaving(true);
        setProfileSuccess('');
        setProfileError('');
        try {
            await user.update({
                firstName,
                lastName,
                unsafeMetadata: { ...user.unsafeMetadata, bio },
            });
            setProfileSuccess('Profile updated successfully.');
        } catch (err: any) {
            setProfileError(err?.errors?.[0]?.message ?? 'Failed to update profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!user) return;
        setPasswordSuccess('');
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters.');
            return;
        }

        setPasswordSaving(true);
        try {
            await user.updatePassword({
                currentPassword: currentPassword || undefined,
                newPassword,
            });
            setPasswordSuccess('Password updated successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setPasswordError(err?.errors?.[0]?.message ?? 'Failed to update password.');
        } finally {
            setPasswordSaving(false);
        }
    };

    if (!isLoaded) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary font-sans">Settings</h1>
                <p className="text-text-secondary mt-1">Manage your account and store preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === tab.id
                                    ? 'bg-[#6A3E1D]/50 text-white shadow-md'
                                    : 'text-text-secondary hover:bg-admin-mint hover:text-admin-burgundy'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1"
                >
                    <div className="bg-primary-background rounded-2xl shadow-sm p-6 max-w-2xl">

                        {/* ── Profile Tab ── */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-text-primary font-sans mb-1">Public Profile</h2>
                                    <p className="text-sm text-text-secondary">This will be displayed on your profile.</p>
                                </div>

                                {/* Avatar */}
                                <div className="flex items-center gap-6">
                                    <div className="relative w-24 h-24">
                                        <div className="w-24 h-24 bg-secondary-background rounded-full border-4 border-primary-background shadow-sm overflow-hidden">
                                            {user?.imageUrl ? (
                                                <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-secondary text-2xl font-bold">
                                                    {user?.firstName?.[0] ?? '?'}
                                                </div>
                                            )}
                                        </div>
                                        {avatarUploading && (
                                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={avatarUploading}
                                            className="flex items-center gap-2 px-4 py-2 border border-secondary-background rounded-xl text-sm font-medium hover:bg-secondary-background text-text-primary transition-colors disabled:opacity-50"
                                        >
                                            <Camera size={15} />
                                            {avatarUploading ? 'Uploading...' : 'Change Avatar'}
                                        </button>
                                        <p className="text-xs text-text-secondary">JPG, PNG or GIF. Max 10MB.</p>
                                    </div>
                                </div>

                                {/* Name fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">First Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-4 py-2 bg-text-primary/15 text-text-primary rounded-xl focus:ring-2 focus:ring-admin-burgundy/10 focus:border-admin-burgundy/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-4 py-2 bg-text-primary/15 text-text-primary rounded-xl focus:ring-2 focus:ring-admin-burgundy/10 focus:border-admin-burgundy/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email (read-only — managed by Clerk) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-primary">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.primaryEmailAddress?.emailAddress ?? ''}
                                        readOnly
                                        className="w-full px-4 py-2 bg-text-primary/10 text-text-secondary rounded-xl outline-none cursor-not-allowed opacity-70"
                                    />
                                    <p className="text-xs text-text-secondary">Email changes are managed separately via verification.</p>
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-primary">Bio</label>
                                    <textarea
                                        rows={4}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full px-4 py-2 bg-text-primary/15 text-text-primary rounded-xl outline-none transition-all resize-none"
                                        placeholder="Tell us a little about yourself..."
                                    />
                                </div>

                                {profileSuccess && <p className="text-sm text-green-500">{profileSuccess}</p>}
                                {profileError && <p className="text-sm text-red-500">{profileError}</p>}

                                <button
                                    onClick={handleProfileSave}
                                    disabled={profileSaving}
                                    className="px-6 py-2 bg-[#6A3E1D] text-white text-sm font-medium rounded-xl hover:bg-[#5a3318] transition-colors disabled:opacity-50"
                                >
                                    {profileSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}

                        {/* ── Security Tab ── */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-text-primary font-sans mb-1">Password & Security</h2>
                                    <p className="text-sm text-text-secondary">
                                        {user?.passwordEnabled
                                            ? 'Update your existing password.'
                                            : 'Set a password to enable password-based login.'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Only show current password field if they already have one */}
                                    {user?.passwordEnabled && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-primary">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrent ? 'text' : 'password'}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-4 py-2 pr-10 bg-text-primary/10 text-text-primary rounded-xl focus:ring-2 focus:ring-admin-burgundy/10 focus:border-admin-burgundy/20 outline-none transition-all"
                                                />
                                                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-primary hover:text-primary transition-colors">
                                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">
                                            {user?.passwordEnabled ? 'New Password' : 'Password'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNew ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-2 pr-10 bg-text-primary/10 text-text-primary rounded-xl focus:ring-2 focus:ring-admin-burgundy/10 focus:border-admin-burgundy/20 outline-none transition-all"
                                            />
                                            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-primary hover:text-primary transition-colors">
                                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-2 pr-10 bg-text-primary/10 text-text-primary rounded-xl focus:ring-2 focus:ring-admin-burgundy/10 focus:border-admin-burgundy/20 outline-none transition-all"
                                            />
                                            <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-primary hover:text-primary transition-colors">
                                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {passwordSuccess && <p className="text-sm text-green-500">{passwordSuccess}</p>}
                                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

                                <button
                                    onClick={handlePasswordSave}
                                    disabled={passwordSaving}
                                    className="px-6 py-2 bg-[#6A3E1D] text-white text-sm font-medium rounded-xl hover:bg-[#5a3318] transition-colors disabled:opacity-50"
                                >
                                    {passwordSaving ? 'Saving...' : user?.passwordEnabled ? 'Update Password' : 'Set Password'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
};