import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

function DashboardChart({ stats = {} }) {
    const data = [
        {
            name: "Total Catalog",
            count: stats.total_books || 0,
            fill: "#4f46e5"
        },
        {
            name: "Active Loans",
            count: stats.active_borrowed_books ?? stats.active_borrowings ?? 0,
            fill: "#06b6d4"
        },
        {
            name: "Members",
            count: stats.total_users || 0,
            fill: "#10b981"
        },
        {
            name: "Holds Queue",
            count: stats.total_reservations || 0,
            fill: "#f59e0b"
        }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-800">
                    <p className="font-semibold">{label}</p>
                    <p className="text-indigo-300 font-bold mt-1">
                        Count: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default DashboardChart;