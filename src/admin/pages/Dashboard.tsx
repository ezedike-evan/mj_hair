import React from 'react';
import { BestSellingWidget } from '../components/dashboard/BestSellingWidget';
import { MainLayout } from '../components/layout/MainLayout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { SalesChart } from '../components/dashboard/SalesChart';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { motion } from 'framer-motion';
import { useAnalyticsStore } from '../context/AnalyticsContext';

export const Dashboard: React.FC = () => {
    const {
        totalRevenue,
        totalSales,
        totalVisitors,
        weeklyRevenue,
        recentTransactions,
        bestSellingProduct,
        categoryBreakdown,
        loading
    } = useAnalyticsStore();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <p>Loading Dashboard...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div variants={itemVariants}>
                        <StatsCard
                            title="Total Income"
                            value={`£${totalRevenue.toLocaleString()}`}
                            isPositive={true}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <StatsCard
                            title="Total Sales"
                            value={totalSales.toLocaleString()}
                            isPositive={true}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <StatsCard
                            title="Total Website Visits"
                            value={totalVisitors.toString()}
                            isPositive={true}
                        />
                    </motion.div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Row 1: Chart and Best Selling */}
                    <div className="lg:col-span-2">
                        <motion.div variants={itemVariants} className="bg-primary-background rounded-2xl shadow-sm p-6 h-full">
                            <SalesChart
                                data={weeklyRevenue.map(d => ({ name: d.day, value: d.revenue }))}
                            />
                        </motion.div>
                    </div>


                    <div className="lg:col-span-1">
                        <motion.div variants={itemVariants} className="h-full">
                            <BestSellingWidget
                                bestSellingProduct={bestSellingProduct}
                                categories={categoryBreakdown}
                            />
                        </motion.div>
                    </div>

                    {/* Row 2: Recent Transactions and Calendar */}
                    <div className="lg:col-span-3">
                        <motion.div variants={itemVariants} className="h-full">
                            <RecentOrders orders={recentTransactions} />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </MainLayout>
    );
};
