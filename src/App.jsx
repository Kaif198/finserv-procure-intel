
import React, { useState, useMemo, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ComposedChart, ScatterChart, Scatter, ZAxis, ReferenceLine, Cell
} from 'recharts';
import {
    LayoutDashboard, PieChart, Users, FileText, AlertTriangle, Settings,
    Bell, Search, ChevronRight, ChevronDown, ArrowUpRight, ArrowDownRight,
    Filter, Download, Calendar, CheckCircle, AlertCircle, XCircle, MoreHorizontal,
    Lightbulb, TrendingUp, TrendingDown, DollarSign, Activity, ShieldAlert
} from 'lucide-react';
import _ from 'lodash';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ═══ 1. CONFIG & CONSTANTS ═══
const COLORS = {
    primary: '#00205C', // ALDI Navy
    secondary: '#0063B2', // ALDI Blue
    accent: '#FF6600', // ALDI Orange
    success: '#1A8754',
    warning: '#E8A317',
    danger: '#D63B30',
    bg: '#F7F8FA',
    surface: '#FFFFFF',
    text: { primary: '#1A1D23', secondary: '#5F6B7A' },
    chart: ['#00205C', '#0063B2', '#FF6600', '#1A8754', '#E8A317', '#8884d8', '#82ca9d']
};

const FORMATTERS = {
    currency: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
    currencyCompact: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 }),
    percent: new Intl.NumberFormat('de-DE', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    date: new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }),
};

const CATEGORIES = [
    'Payment Processing', 'Banking Services', 'Insurance', 'Card Network Fees',
    'Cash Handling & CIT', 'Treasury & FX', 'Audit & Compliance'
];

const COUNTRIES = ['Austria', 'Germany', 'UK', 'Ireland', 'Australia', 'USA', 'Hungary', 'Slovenia', 'Italy'];

// ═══ 2. DATA GENERATORS ═══
const generateData = () => {
    // Vendors
    const vendors = [
        { id: 'V-001', name: 'Worldline', category: 'Payment Processing', risk: 'Low', sla: 99.8, spend: 14200000, trend: 12.4, status: 'Active' },
        { id: 'V-002', name: 'Adyen', category: 'Payment Processing', risk: 'Low', sla: 99.9, spend: 8500000, trend: 18.2, status: 'Active' },
        { id: 'V-003', name: 'SumUp', category: 'Payment Processing', risk: 'Medium', sla: 98.5, spend: 1200000, trend: 5.1, status: 'Active' },
        { id: 'V-004', name: 'Deutsche Bank', category: 'Banking Services', risk: 'Low', sla: 99.5, spend: 3400000, trend: 2.1, status: 'Active' },
        { id: 'V-005', name: 'Raiffeisen Bank', category: 'Banking Services', risk: 'Low', sla: 99.2, spend: 2100000, trend: 1.5, status: 'Active' },
        { id: 'V-006', name: 'Allianz', category: 'Insurance', risk: 'Low', sla: 98.8, spend: 6800000, trend: 4.2, status: 'Active' },
        { id: 'V-007', name: 'Zurich Insurance', category: 'Insurance', risk: 'Medium', sla: 97.9, spend: 4200000, trend: 3.8, status: 'Review' },
        { id: 'V-008', name: 'Loomis', category: 'Cash Handling & CIT', risk: 'High', sla: 94.2, spend: 2800000, trend: -2.4, status: 'Warning' },
        { id: 'V-009', name: 'Brinks', category: 'Cash Handling & CIT', risk: 'Medium', sla: 96.5, spend: 3100000, trend: -1.1, status: 'Active' },
        { id: 'V-010', name: 'Visa Europe', category: 'Card Network Fees', risk: 'Low', sla: 100, spend: 8900000, trend: 8.5, status: 'Active' },
        { id: 'V-011', name: 'Mastercard', category: 'Card Network Fees', risk: 'Low', sla: 100, spend: 7600000, trend: 7.9, status: 'Active' },
        { id: 'V-012', name: 'KPMG', category: 'Audit & Compliance', risk: 'Low', sla: 98.0, spend: 1500000, trend: 0.0, status: 'Active' },
        { id: 'V-013', name: 'HSBC', category: 'Treasury & FX', risk: 'Low', sla: 99.1, spend: 900000, trend: 1.2, status: 'Active' },
        // ... generated more programmatically below
    ];

    // Fill up to 40 vendors with realistic data
    for (let i = 14; i <= 40; i++) {
        const category = CATEGORIES[i % CATEGORIES.length];
        vendors.push({
            id: `V-${i.toString().padStart(3, '0')}`,
            name: `${['Global', 'Strategic', 'Prime', 'First', 'United'][i % 5]} ${['Finance', 'Solutions', 'Partners', 'Systems', 'Group'][i % 5]}`,
            category: category,
            risk: Math.random() > 0.8 ? 'High' : Math.random() > 0.6 ? 'Medium' : 'Low',
            sla: +(90 + Math.random() * 9.9).toFixed(1),
            spend: Math.round(100000 + Math.random() * 2000000),
            trend: +(-5 + Math.random() * 15).toFixed(1),
            status: Math.random() > 0.9 ? 'Expired' : Math.random() > 0.85 ? 'Review' : 'Active'
        });
    }

    // Spend Data (36 Months)
    const spendHistory = [];
    const currDate = new Date();
    for (let i = 35; i >= 0; i--) {
        const d = new Date(currDate.getFullYear(), currDate.getMonth() - i, 1);
        const monthData = {
            date: d.toISOString().split('T')[0],
            displayDate: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            total: 0
        };

        CATEGORIES.forEach(cat => {
            // Base + Trend + Seasonality
            let base = 500000 + Math.random() * 200000;
            if (cat === 'Payment Processing') base *= 4;
            if (cat === 'Card Network Fees') base *= 2.5;

            const trendFactor = 1 + (0.05 * (35 - i) / 12); // Growth over time
            const seasonality = cat === 'Insurance' && (d.getMonth() === 0) ? 2.5 :
                cat === 'Payment Processing' && (d.getMonth() === 11) ? 1.4 : 1;

            const val = Math.round(base * trendFactor * seasonality);
            monthData[cat] = val;
            monthData.total += val;
        });
        spendHistory.push(monthData);
    }

    // Contracts
    const contracts = vendors.map(v => ({
        id: `CTR-${v.id.split('-')[1]}`,
        vendorId: v.id,
        vendorName: v.name,
        category: v.category,
        value: v.spend,
        startDate: '2023-01-01',
        endDate: ['2025-06-30', '2026-12-31', '2025-12-31', '2024-12-31'][Math.floor(Math.random() * 4)],
        status: v.status === 'Active' ? 'Active' : v.status,
        renewalType: Math.random() > 0.5 ? 'Auto-renew' : 'Manual',
        noticePeriod: 90
    }));

    return { vendors, spendHistory, contracts };
};

const DATA = generateData();

const ML_MODELS = {
    arima: {
        name: 'ARIMA(2,1,1)',
        trainPeriod: 'Jan 2023 - Dec 2025',
        rmse: 142300,
        mape: 3.2,
        forecast: Array.from({ length: 12 }, (_, i) => {
            const base = 4800000 * (1 + (i * 0.008)); // Slight upward trend
            return {
                month: new Date(2026, i, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                value: base,
                confidenceCurrent: [base * 0.95, base * 1.05]
            };
        })
    },
    randomForest: {
        accuracy: 89.3,
        f1: 0.87,
        features: [
            { name: 'SLA History', importance: 0.35 },
            { name: 'Payment Error Freq', importance: 0.28 },
            { name: 'Response Time', importance: 0.15 },
            { name: 'Contract Value', importance: 0.12 },
            { name: 'Relationship Yrs', importance: 0.06 },
            { name: 'Countries Served', importance: 0.04 }
        ]
    },
    regression: {
        r2: 0.91,
        pVal: '< 0.001',
        coefficients: [
            { name: 'Transaction Vol', coef: 0.43, p: 0.001 },
            { name: 'Store Count', coef: 0.31, p: 0.004 },
            { name: 'Contract Age', coef: -0.12, p: 0.021 },
            { name: 'Inflation Rate', coef: 0.08, p: 0.15 }
        ]
    }
};

// ═══ 3. UTILITY COMPONENTS ═══
const cn = (...inputs) => twMerge(clsx(inputs));

const Card = ({ children, className, hover = true }) => (
    <div className={cn(
        "bg-white rounded-xl border border-aldi-border p-6 shadow-card",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
    )}>
        {children}
    </div>
);

const KPICard = ({ title, value, trend, trendVal, narrative, color = "blue" }) => {
    const colorMap = {
        blue: "bg-aldi-secondary",
        green: "bg-aldi-success",
        orange: "bg-aldi-orange",
        navy: "bg-aldi-navy"
    };

    return (
        <Card className="relative overflow-hidden pl-6">
            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", colorMap[color])} />
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-aldi-text-secondary text-sm font-semibold uppercase tracking-wider">{title}</h3>
                {trend && (
                    <div className={cn("flex items-center text-xs font-bold px-2 py-1 rounded-full",
                        trend === 'up' ? "text-aldi-success bg-green-50" : "text-aldi-danger bg-red-50"
                    )}>
                        {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {trendVal}
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold text-aldi-text-primary mb-3 font-sans tracking-tight">{value}</div>
            <p className="text-xs text-aldi-text-secondary leading-relaxed border-t border-gray-100 pt-3 mt-1">
                {narrative}
            </p>
        </Card>
    );
};

const NarrativePanel = ({ headline, evidence, implication, recommendation }) => (
    <div className="bg-[#F8FAFD] border-l-4 border-aldi-blue p-5 rounded-r-lg mt-4">
        <div className="flex items-center gap-2 mb-2 text-aldi-blue">
            <Lightbulb size={18} />
            <span className="text-sm font-bold uppercase tracking-wide">Procurement Insight</span>
        </div>
        <h4 className="text-aldi-text-primary font-bold text-sm mb-2">{headline}</h4>
        <p className="text-sm text-aldi-text-secondary mb-2">{evidence}</p>
        <p className="text-sm text-aldi-text-secondary mb-3 italic">{implication}</p>
        <div className="text-sm font-bold text-aldi-orange flex items-start gap-1">
            <ArrowUpRight size={16} className="mt-0.5 shrink-0" />
            Action: {recommendation}
        </div>
    </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-2xl font-bold text-aldi-navy">{title}</h2>
            <p className="text-aldi-text-secondary text-sm mt-1">{subtitle}</p>
        </div>
        {action}
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Active: "bg-green-100 text-green-800",
        Review: "bg-amber-100 text-amber-800",
        Warning: "bg-red-100 text-red-800",
        Expired: "bg-gray-100 text-gray-800",
        High: "bg-red-100 text-red-800",
        Medium: "bg-amber-100 text-amber-800",
        Low: "bg-green-100 text-green-800",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold", styles[status] || styles.Active)}>
            {status}
        </span>
    );
};

const ModelCard = ({ model, type, children }) => (
    <div className="bg-white border border-aldi-border rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
                <Activity className="text-aldi-blue" size={18} />
                <span className="font-bold text-aldi-navy">{model.name || type} Model</span>
            </div>
            <div className="flex gap-4 text-xs text-aldi-text-secondary font-mono">
                {model.rmse && <span>RMSE: {FORMATTERS.currencyCompact.format(model.rmse)}</span>}
                {model.mape && <span>MAPE: {model.mape}%</span>}
                {model.r2 && <span>R²: {model.r2}</span>}
                {model.accuracy && <span>Accuracy: {model.accuracy}%</span>}
            </div>
        </div>
        {children}
    </div>
);

// ═══ 4. MODULES ═══

// --- Module 1: Executive Summary ---
const ExecutiveSummary = () => {
    const totalSpend = DATA.spendHistory.reduce((sum, m) => sum + m.total, 0);
    const prevSpend = totalSpend * 0.92; // Mock prev year

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader title="Executive Overview" subtitle="High-level performance indicators for Q1 2026" />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <KPICard
                    title="Total Annual Spend"
                    value={FORMATTERS.currencyCompact.format(47300000)}
                    trend="up" trendVal="12.3%"
                    color="navy"
                    narrative="Driven by 23% increase in digital payment processing volume. Remains 7.2% below budgeted ceiling for FY25."
                />
                <KPICard
                    title="Active Contracts"
                    value="38"
                    trend="down" trendVal="2 Expiring"
                    color="blue"
                    narrative="2 critical renewals pending in Q3 (Worldline, Allianz). 94% coverage of total spend under master agreements."
                />
                <KPICard
                    title="Negotiated Savings"
                    value={FORMATTERS.currencyCompact.format(2100000)}
                    trend="up" trendVal="4.1%"
                    color="green"
                    narrative="Exceeded Q1 target by €450k due to successful consolidation of DACH region cash handling services."
                />
                <KPICard
                    title="Master Data Health"
                    value="94.2%"
                    trend="down" trendVal="1.8%"
                    color="orange"
                    narrative="Dip due to 3 new vendor onboards pending banking verification. Audit risk remains low (Green status)."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spend Category Chart */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <h3 className="font-bold text-aldi-navy mb-4">Spend by Category (YTD)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={CATEGORIES.map(c => ({
                                    name: c,
                                    value: DATA.vendors.filter(v => v.category === c).reduce((s, v) => s + v.spend, 0)
                                })).sort((a, b) => b.value - a.value)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fill: '#5F6B7A' }} />
                                    <Tooltip formatter={(value) => FORMATTERS.currencyCompact.format(value)} cursor={{ fill: '#F3F4F6' }} />
                                    <Bar dataKey="value" fill="#0063B2" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <NarrativePanel
                            headline="Payment Processing dominates cost structure (42% of spend)"
                            evidence="Payment Processing spend (€18.7M) is 2.4x higher than the next largest category. This correlates with the 98% POS terminal uptime requirement."
                            implication="Single-source dependency on primary processor poses operational risk."
                            recommendation="Accelerate secondary processor onboarding pilot in Hungary region."
                        />
                    </Card>
                </div>

                {/* Feed & Timeline */}
                <Card>
                    <h3 className="font-bold text-aldi-navy mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { date: 'Today', text: 'RFP issued for Cash Handling (DACH)', type: 'alert' },
                            { date: 'Yesterday', text: 'Worldline contract auto-renewed', type: 'success' },
                            { date: 'Feb 18', text: 'Audit completed for 12 vendors', type: 'info' },
                            { date: 'Feb 15', text: 'Q1 Savings Report published', type: 'file' },
                            { date: 'Feb 12', text: 'Risk alert: Loomis credit downgrade', type: 'warning' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 text-sm pb-3 border-b border-gray-100 last:border-0">
                                <div className="w-16 text-xs text-aldi-text-secondary font-mono mt-0.5">{item.date}</div>
                                <div className="text-aldi-text-primary">{item.text}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-bold text-xs uppercase text-aldi-text-secondary mb-3">Renewals Timeline (12 Mo)</h4>
                        <div className="space-y-3">
                            {[
                                { name: 'Zurich Insurance', days: 14, val: '€4.2M', urgency: 'red' },
                                { name: 'Brinks CIT', days: 45, val: '€1.8M', urgency: 'amber' },
                                { name: 'Mastercard Scheme', days: 120, val: '€7.6M', urgency: 'green' }
                            ].map((c, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full",
                                            c.urgency === 'red' ? 'bg-red-500' : c.urgency === 'amber' ? 'bg-amber-500' : 'bg-green-500'
                                        )} />
                                        <span>{c.name}</span>
                                    </div>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{c.days} days</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- Module 2: Analytics ---
const SpendAnalytics = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader title="Spend Intelligence & ML Forecasts" subtitle="Advanced analytics powered by internal data lake" />

            {/* 1. Spend Overview */}
            <Card>
                <div className="flex justify-between mb-4">
                    <h3 className="font-bold text-aldi-navy">36-Month Spend Trend</h3>
                    <div className="flex gap-2">
                        <button className="text-xs px-3 py-1 bg-aldi-blue text-white rounded">All Categories</button>
                        <button className="text-xs px-3 py-1 bg-gray-100 text-aldi-text-secondary rounded hover:bg-gray-200">By Country</button>
                    </div>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DATA.spendHistory}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00205C" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#00205C" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#5F6B7A' }} />
                            <YAxis tickFormatter={(val) => `€${val / 1000000}M`} tick={{ fontSize: 12, fill: '#5F6B7A' }} />
                            <Tooltip formatter={(value) => FORMATTERS.currency.format(value)} contentStyle={{ borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="total" stroke="#00205C" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <NarrativePanel
                    headline="Consistent 12% YoY growth trajectory driven by digital payments."
                    evidence="Spend has grown from €3.1M/mo to €4.2M/mo over 36 months. The slope is steepest in Q4 annually."
                    implication="At this rate, FY26 budget will be engaged by October 2026."
                    recommendation="Initiate 'Cashless Stores' efficiency review to offset rising processing fees."
                />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2. ARIMA Forecast */}
                <Card>
                    <ModelCard model={ML_MODELS.arima} type="ARIMA">
                        <div className="text-xs text-gray-500 mb-2 italic">Projection for next 12 months with 95% confidence interval</div>
                    </ModelCard>
                    <div className="h-64">
                        <ResponsiveContainer>
                            <ComposedChart data={ML_MODELS.arima.forecast}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                <YAxis tickFormatter={(v) => `€${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10 }} domain={['min', 'max']} />
                                <Tooltip />
                                <Area dataKey="confidenceCurrent" fill="#EBF0F7" stroke="none" />
                                <Line type="monotone" dataKey="value" stroke="#FF6600" strokeWidth={2} dot={{ r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <NarrativePanel
                        headline="Forecast predicts €49.8M spend in FY26 (±€1.2M)."
                        evidence="ARIMA model identifies strong seasonality in insurance renewals (Jan) and payment volume (Dec)."
                        implication="Q1 cash flow requirements will be significantly higher than historical average."
                        recommendation="Pre-fund treasury accounts for Jan 15th insurance sweeps."
                    />
                </Card>

                {/* 3. Random Forest Risk */}
                <Card>
                    <ModelCard model={ML_MODELS.randomForest} type="Vendor Risk (RF)">
                        <div className="text-xs text-gray-500 mb-2">Feature Importance Analysis</div>
                    </ModelCard>
                    <div className="h-64">
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={ML_MODELS.randomForest.features} margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="importance" fill="#0063B2" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <NarrativePanel
                        headline="SLA History is the #1 predictor of vendor failure."
                        evidence="The Random Forest model assigns 35% weight to past SLA breaches, outweighing financial health."
                        implication="Vendors with declining SLA scores (like Loomis) have 72% probability of critical failure."
                        recommendation="Place Loomis on Performance Improvement Plan immediately."
                    />
                </Card>
            </div>
        </div>
    );
};

// --- Module 3: Vendor Directory ---
const VendorHub = () => {
    const [filter, setFilter] = useState('');

    const filteredVendors = DATA.vendors.filter(v =>
        v.name.toLowerCase().includes(filter.toLowerCase()) ||
        v.category.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader title="Vendor Master Data" subtitle="Registry of all financial service providers"
                action={<button className="bg-aldi-navy text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-opacity-90"><Download size={16} /> Export Report</button>}
            />

            {/* Completeness Heatmap */}
            <Card className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-aldi-navy">Data Completeness Analysis</h3>
                    <span className="text-sm text-aldi-success font-bold flex items-center gap-1"><CheckCircle size={16} /> 94.2% Verified</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <div className="grid grid-cols-12 gap-1 text-xs">
                            {DATA.vendors.slice(0, 12).map((v, i) => (
                                <React.Fragment key={v.id}>
                                    <div className="col-span-3 font-mono text-gray-500 truncate" title={v.name}>{v.name}</div>
                                    <div className={cn("col-span-1 h-4 rounded", v.dataCompleteness > 90 ? "bg-emerald-500" : "bg-red-500")}></div>
                                    <div className={cn("col-span-1 h-4 rounded", "bg-emerald-500")}></div>
                                    <div className={cn("col-span-1 h-4 rounded", Math.random() > 0.8 ? "bg-gray-300" : "bg-emerald-500")}></div>
                                    <div className={cn("col-span-1 h-4 rounded", "bg-emerald-500")}></div>
                                    <div className={cn("col-span-1 h-4 rounded", v.risk === 'High' ? "bg-amber-400" : "bg-emerald-500")}></div>
                                    <div className={cn("col-span-1 h-4 rounded", "bg-emerald-500")}></div>
                                    <div className={cn("col-span-1 h-4 rounded", "bg-emerald-500")}></div>
                                    <div className={cn("col-span-1 h-4 rounded", "bg-emerald-500")}></div>
                                    <div className={cn("col-span-1 h-4 rounded", "bg-emerald-500")}></div>
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-aldi-text-secondary justify-end">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" /> Complete</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded" /> Partial</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /> Missing</span>
                        </div>
                    </div>
                    <div>
                        <NarrativePanel
                            headline="3 Vendors missing critical banking certs."
                            evidence="Loomis, Local Cash Co, and SecureTrans have expired ISO certificates in the system."
                            implication="Compliance breach risk for Q2 Audit."
                            recommendation="Trigger automated request for updated documents."
                        />
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-aldi-blue"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                        <Filter size={16} /> Filters
                    </button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#F7F8FA] text-aldi-text-secondary uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-3">Vendor</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3 text-right">Ann. Spend</th>
                            <th className="px-6 py-3">SLA</th>
                            <th className="px-6 py-3">Risk</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredVendors.slice(0, 10).map((v) => (
                            <tr key={v.id} className="hover:bg-aldi-hover group cursor-pointer transition-colors">
                                <td className="px-6 py-4 font-medium text-aldi-navy">
                                    {v.name}
                                    <div className="text-xs text-gray-400 font-normal">{v.id}</div>
                                </td>
                                <td className="px-6 py-4">{v.category}</td>
                                <td className="px-6 py-4 text-right font-mono">{FORMATTERS.currencyCompact.format(v.spend)}</td>
                                <td className="px-6 py-4">
                                    <span className={cn("font-bold", v.sla < 98 ? "text-red-500" : "text-green-600")}>{v.sla}%</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn("inline-flex w-2 h-2 rounded-full mr-2",
                                        v.risk === 'High' ? 'bg-red-500' : v.risk === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                                    )} />
                                    {v.risk}
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                                <td className="px-6 py-4 text-gray-400">
                                    <ChevronRight size={18} className="group-hover:text-aldi-blue group-hover:translate-x-1 transition-all" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};


// --- Module 4: Contract Manager ---
const ContractManager = () => {
    const expiringContracts = DATA.contracts.filter(c => new Date(c.endDate) < new Date(2026, 3, 1));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader title="Contract Lifecycle Manager" subtitle="Active agreements and renewal pipeline" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-aldi-navy">Active Contracts ({DATA.contracts.length})</h3>
                            <div className="flex gap-2">
                                <button className="text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Filter by Status</button>
                                <button className="text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Sort by Value</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="py-2 pl-2">Vendor</th>
                                        <th className="py-2">Category</th>
                                        <th className="py-2">End Date</th>
                                        <th className="py-2 text-right">Value</th>
                                        <th className="py-2 text-center">Auto-Renew</th>
                                        <th className="py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {DATA.contracts.map(c => (
                                        <tr key={c.id} className="hover:bg-aldi-hover group cursor-pointer">
                                            <td className="py-3 pl-2 font-medium text-aldi-navy">{c.vendorName}</td>
                                            <td className="py-3 text-xs text-gray-500">{c.category}</td>
                                            <td className="py-3 text-xs font-mono">{FORMATTERS.date.format(new Date(c.endDate))}</td>
                                            <td className="py-3 text-right text-xs font-mono">{FORMATTERS.currencyCompact.format(c.value)}</td>
                                            <td className="py-3 text-center text-xs">{c.renewalType === 'Auto-renew' ? 'Yes' : 'No'}</td>
                                            <td className="py-3"><StatusBadge status={c.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div>
                    {/* Detailed Card for Expiring */}
                    <Card className="bg-orange-50 border-orange-100 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-aldi-orange shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold text-aldi-navy text-sm">Action Required</h4>
                                <p className="text-xs text-aldi-text-secondary mt-1">
                                    {expiringContracts.length} contracts expiring in next 90 days. Total value exposure: {FORMATTERS.currencyCompact.format(expiringContracts.reduce((a, b) => a + b.value, 0))}.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <NarrativePanel
                        headline="Worldline & Allianz renewals are critical path."
                        evidence="Both contracts expire in Q3/Q4. Worldline includes a 6-month notice period for termination (Deadline: March 30)."
                        implication="Missing the notice window triggers a 12-month auto-renewal at +4% CPI adjustment."
                        recommendation="Issue 'Notice of Intent to Renegotiate' by Feb 28 to preserve leverage."
                    />
                </div>
            </div>
        </div>
    );
};

// --- Module 5: Risk Monitor ---
const RiskMonitor = () => {
    // Scatter data: x=probability (random), y=impact (spend)
    const riskData = DATA.vendors.map(v => ({
        ...v,
        x: v.risk === 'High' ? 60 + Math.random() * 30 : v.risk === 'Medium' ? 30 + Math.random() * 30 : Math.random() * 30, // Probability
        y: (v.spend / 15000000) * 100, // Impact normalized
        z: v.spend // Size
    }));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader title="Risk & Compliance Monitor" subtitle="Vendor risk assessment and dependency analysis" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="font-bold text-aldi-navy mb-4">Risk Matrix (Likelihood vs Impact)</h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid />
                                    <XAxis type="number" dataKey="x" name="Likelihood" unit="%" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Likelihood of Failure', position: 'bottom', offset: 0, fontSize: 12 }} />
                                    <YAxis type="number" dataKey="y" name="Impact" unit="" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Financial Impact', angle: -90, position: 'left', offset: 0, fontSize: 12 }} />
                                    <ZAxis type="number" dataKey="z" range={[50, 400]} name="Spend" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded text-xs">
                                                    <div className="font-bold text-aldi-navy">{d.name}</div>
                                                    <div>Spend: {FORMATTERS.currencyCompact.format(d.spend)}</div>
                                                    <div className={cn("font-bold", d.risk === 'High' ? "text-red-500" : "text-green-600")}>Risk: {d.risk}</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }} />
                                    <ReferenceLine x={50} stroke="red" strokeDasharray="3 3" label={{ position: 'top', value: 'High Probability' }} />
                                    <ReferenceLine y={50} stroke="red" strokeDasharray="3 3" label={{ position: 'right', value: 'High Impact' }} />
                                    <Scatter name="Vendors" data={riskData} fill="#8884d8">
                                        {riskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.risk === 'High' ? '#D63B30' : entry.risk === 'Medium' ? '#E8A317' : '#1A8754'} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <NarrativePanel
                            headline="Concentration Risk Alert: Payment Processing."
                            evidence="Worldline and Adyen account for 67% of total transaction volume processing."
                            implication="A localized failure at Worldline Frankfurt hub would impact 42% of DACH region stores."
                            recommendation="Prioritize 'Active-Active' routing redundancy project in Q2."
                        />
                    </Card>
                </div>

                <div>
                    <Card className="h-full">
                        <h3 className="font-bold text-aldi-navy mb-4">Compliance Status</h3>
                        <div className="space-y-4">
                            {[
                                { cert: 'PCI-DSS', status: 'Valid', vendor: 'Worldline', color: 'green' },
                                { cert: 'ISO 27001', status: 'Expiring', vendor: 'Zurich', color: 'amber' },
                                { cert: 'SOC 2 Type II', status: 'Missing', vendor: 'Loomis', color: 'red' },
                                { cert: 'GDPR Audit', status: 'Valid', vendor: 'Adyen', color: 'green' },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <div className="font-bold text-aldi-navy text-sm">{c.cert}</div>
                                        <div className="text-xs text-gray-500">{c.vendor}</div>
                                    </div>
                                    <span className={cn("text-xs font-bold px-2 py-1 rounded",
                                        c.color === 'green' ? "bg-green-100 text-green-700" : c.color === 'amber' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {c.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// ═══ 5. LAYOUT ═══
const Sidebar = ({ active, setActive }) => {
    const items = [
        { id: 'summary', icon: LayoutDashboard, label: 'Executive Summary' },
        { id: 'analytics', icon: PieChart, label: 'Spend Analytics' },
        { id: 'vendors', icon: Users, label: 'Vendor Master Data' },
        { id: 'contracts', icon: FileText, label: 'Contract Manager' },
        { id: 'risk', icon: ShieldAlert, label: 'Risk Monitor' },
    ];

    return (
        <div className="w-64 bg-[#00205C] min-h-screen text-white flex flex-col fixed left-0 top-0 shadow-xl z-20">
            <div className="p-6 border-b border-[#ffffff1a]">
                <h1 className="font-bold text-xl tracking-tight">ALDI SÜD</h1>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Procurement Intelligence</p>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActive(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                            active === item.id
                                ? "bg-[#FF6600] text-white shadow-lg"
                                : "text-gray-300 hover:bg-[#ffffff1a] hover:text-white"
                        )}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-[#ffffff1a]">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">MK</div>
                    <div>
                        <div className="text-sm font-medium">Mohammed Kaif</div>
                        <div className="text-xs text-gray-400">Procurement Lead</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TopBar = () => (
    <header className="h-16 bg-white border-b border-aldi-border sticky top-0 z-10 flex items-center justify-between px-8 pl-72 shadow-sm">
        <div className="flex bg-gray-100 rounded-lg p-1">
            {['Global', 'DACH', 'UK & IE', 'USA'].map((r, i) => (
                <button key={r} className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", i === 0 ? "bg-white shadow-sm text-aldi-navy" : "text-gray-500 hover:text-gray-900")}>
                    {r}
                </button>
            ))}
        </div>
        <div className="flex items-center gap-4">
            <div className="relative">
                <Bell size={20} className="text-gray-400 hover:text-aldi-navy cursor-pointer transition-colors" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-aldi-orange rounded-full animate-pulse" />
            </div>
            <div className="h-8 w-[1px] bg-gray-200" />
            <div className="text-xs text-right hidden md:block">
                <div className="text-gray-400">Last updated</div>
                <div className="font-mono font-bold text-aldi-navy">{new Date().toLocaleString()}</div>
            </div>
        </div>
    </header>
);

// ═══ 6. MAIN APP ═══
function App() {
    const [activeModule, setActiveModule] = useState('summary');
    const [isLoading, setIsLoading] = useState(true);

    // Fake loading sequence
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="h-screen w-screen bg-aldi-bg flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-aldi-border border-t-aldi-blue rounded-full animate-spin mb-6" />
                <h1 className="text-aldi-navy font-bold text-xl animate-pulse">Loading Procurement Intelligence...</h1>
                <p className="text-aldi-text-secondary text-sm mt-2">Connecting to Data Lake • Running ML Models</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] font-sans text-aldi-text-primary selection:bg-aldi-blue selection:text-white">
            {/* Styles for explicit font imports since we can't use headers */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      `}</style>

            <Sidebar active={activeModule} setActive={setActiveModule} />
            <TopBar />

            <main className="pl-64 pt-6 p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)]">
                {activeModule === 'summary' && <ExecutiveSummary />}
                {activeModule === 'analytics' && <SpendAnalytics />}
                {activeModule === 'vendors' && <VendorHub />}
                {activeModule === 'contracts' && <ContractManager />}
                {activeModule === 'risk' && <RiskMonitor />}
            </main>
        </div>
    );
}

export default App;
