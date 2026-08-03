/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — ADMINISTRATIVE DASHBOARDS COMPONENT
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Description:
 * This component renders the main dashboard views for both the standard Admin
 * and Super Admin roles. It adapts the UI, grids, charts, tables, and statistics
 * based on the role of the logged-in user.
 * 
 * TABLE OF CONTENTS:
 * 1. IMPORTS & HELPERS (Utility formatters)
 * 2. SUB-COMPONENTS:
 *    - StatCard (Unified grid stat widgets)
 *    - AreaChart (Gold smooth bezier curve SVG line chart)
 *    - DonutChart (Distribution percentages SVG donut wheel)
 * 3. MAIN DASHBOARD CONTROLLER:
 *    - State & Auth role logic (isSuper)
 *    - Data Merging (Combines live DB statistics with mockups)
 *    - Render layout divisions (Admin vs Super Admin statistics)
 * 
 * DEVELOPER NOTE FOR FUTURE IMPROVEMENTS:
 * - To bind more metrics to the database, update the 'useDashboard' hook in 
 *   src/api/admin.js and integrate returning values inside 'dbStats'.
 */

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useDashboard } from '../../api/admin';
import './admin.css';

// ─── 1. HELPERS & FORMATTERS ────────────────────────────────────────────────
const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

// ─── 2. SUB-COMPONENTS ───────────────────────────────────────────────────────

/**
 * StatCard Widget
 * Renders individual card statistics with color tokens, icons, and trend lines.
 */
const StatCard = ({ label, value, icon, color, trend, trendType }) => (
  <div className="admin-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '110px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="admin-stat-label" style={{ marginBottom: 4 }}>{label}</div>
        <div className="admin-stat-value" style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</div>
      </div>
      <div className="admin-stat-icon" style={{ 
        background: `${color}12`, 
        color, 
        width: 38, 
        height: 38, 
        borderRadius: 8, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        margin: 0,
        fontSize: '1.1rem'
      }}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className={trendType === 'down' ? 'admin-trend-down' : 'admin-trend-up'}>
        {trend}
      </div>
    )}
    {!trend && (
      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-dim)', marginTop: 4 }}>—</div>
    )}
  </div>
);

/**
 * AreaChart Widget (SVG Area Line Chart)
 * Renders a smooth gold bezier area curve chart with vector grid lines and coordinates.
 */
const AreaChart = ({ points, dates, width = 600, height = 220, color = "#c5a85c" }) => {
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const spread = maxVal - minVal || 1;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const coords = points.map((p, idx) => {
    const x = paddingLeft + (idx / (points.length - 1)) * chartWidth;
    const y = height - paddingBottom - ((p - minVal) / spread) * chartHeight;
    return { x, y };
  });

  let pathStr = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const cpX1 = coords[i].x + (coords[i+1].x - coords[i].x) / 2;
    const cpY1 = coords[i].y;
    const cpX2 = coords[i].x + (coords[i+1].x - coords[i].x) / 2;
    const cpY2 = coords[i+1].y;
    pathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i+1].x} ${coords[i+1].y}`;
  }

  const fillPathStr = `${pathStr} L ${coords[coords.length-1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.00" />
        </linearGradient>
      </defs>
      
      {/* Grid Lines */}
      <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
      <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="rgba(0,0,0,0.03)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="rgba(0,0,0,0.03)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Y Axis Labels */}
      <text x={paddingLeft - 10} y={paddingTop + 4} textAnchor="end" style={{ fontSize: '0.65rem', fill: 'var(--admin-text-dim)', fontWeight: 500 }}>
        {maxVal >= 100000 ? `${(maxVal/100000).toFixed(1)}L` : maxVal}
      </text>
      <text x={paddingLeft - 10} y={paddingTop + chartHeight / 2 + 4} textAnchor="end" style={{ fontSize: '0.65rem', fill: 'var(--admin-text-dim)', fontWeight: 500 }}>
        {((maxVal + minVal) / 2 >= 100000) ? `${(((maxVal + minVal)/2)/100000).toFixed(1)}L` : Math.round((maxVal + minVal)/2)}
      </text>
      <text x={paddingLeft - 10} y={height - paddingBottom + 4} textAnchor="end" style={{ fontSize: '0.65rem', fill: 'var(--admin-text-dim)', fontWeight: 500 }}>
        0
      </text>

      {/* Filled Area */}
      <path d={fillPathStr} fill="url(#areaGradient)" />

      {/* Stroke Line */}
      <path d={pathStr} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Coordinate Dots */}
      {coords.map((c, idx) => (
        <g key={idx}>
          <circle cx={c.x} cy={c.y} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
          {idx === coords.length - 1 && (
            <circle cx={c.x} cy={c.y} r="8" fill={color} fillOpacity="0.15" />
          )}
        </g>
      ))}

      {/* X Axis Labels */}
      {dates.map((d, idx) => {
        const x = paddingLeft + (idx / (dates.length - 1)) * chartWidth;
        return (
          <text key={idx} x={x} y={height - 10} textAnchor="middle" style={{ fontSize: '0.65rem', fill: 'var(--admin-text-dim)', fontWeight: 500 }}>
            {d}
          </text>
        );
      })}
    </svg>
  );
};

/**
 * DonutChart Widget (SVG Circle Donut)
 * Renders segmented circle arcs representing category distribution percentages.
 */
const DonutChart = ({ data, totalValueText, width = 180, height = 180 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const r = 58;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * r;

  const segments = data.reduce(({ currentAcc, list }, item) => {
    const pct = (item.value / total) * 100;
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    const rotationOffset = (currentAcc / 100) * circumference;
    return {
      currentAcc: currentAcc + pct,
      list: [
        ...list,
        {
          ...item,
          strokeDashoffset,
          rotationOffset,
        },
      ],
    };
  }, { currentAcc: 0, list: [] }).list;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '10px 0' }}>
      <div style={{ position: 'relative', width, height, flexShrink: 0 }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ transform: 'rotate(-90deg)' }}>
          {segments.map((item, idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={item.strokeDashoffset}
              style={{
                transform: `rotate(${(item.rotationOffset / circumference) * 360}deg)`,
                transformOrigin: `${cx}px ${cy}px`,
                transition: 'stroke-dashoffset 0.8s ease'
              }}
            />
          ))}
        </svg>

        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          width: '80%'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)', wordBreak: 'break-all', lineHeight: 1.1 }}>{totalValueText}</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3 }}>Total Revenue</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {data.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="admin-legend-dot" style={{ backgroundColor: item.color }} />
                <span style={{ fontWeight: 500, color: 'var(--admin-text-muted)' }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── 3. MAIN DASHBOARD CONTROLLER ────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useDashboard();
  const navigate = useNavigate();

  const isSuper = user?.role === 'superadmin';

  if (isLoading) return <div className="admin-loading"><span className="admin-spinner" /> Loading dashboard...</div>;
  if (error) return <div className="admin-login-error">Error: {error.message}</div>;

  const dbStats = data?.dashboard || {};

  // ─── MOCKUP & LIVE MERGED METRICS DATA SETS ─────────────────────────────────
  
  // Standard Admin metrics
  const adminStats = [
    { label: "Today's Revenue", value: formatCurrency(dbStats.totalRevenue || 145680), icon: "₹", color: "#c5a85c", trend: "↗ 12.5% vs yesterday", trendType: "up" },
    { label: "Today's Orders", value: dbStats.totalOrders || 124, icon: "📦", color: "#c5a85c", trend: "↗ 8.3% vs yesterday", trendType: "up" },
    { label: "Pending Orders", value: dbStats.pendingOrders || 18, icon: "⏳", color: "#c5a85c" },
    { label: "Products", value: dbStats.activeProducts || 356, icon: "🏷", color: "#c5a85c" },
    { label: "Low Stock Items", value: 23, icon: "📄", color: "#c5a85c" },
    { label: "Return Requests", value: 7, icon: "🔄", color: "#c5a85c" }
  ];

  // Super Admin metrics
  const superStats = [
    { label: "Gross Revenue", value: formatCurrency(dbStats.totalRevenue ? dbStats.totalRevenue * 15 : 2485680), icon: "💼", color: "#c5a85c", trend: "↗ 18.6% vs last 30 days", trendType: "up" },
    { label: "Net Revenue", value: formatCurrency(dbStats.totalRevenue ? dbStats.totalRevenue * 12 : 2045320), icon: "📈", color: "#c5a85c", trend: "↗ 16.2% vs last 30 days", trendType: "up" },
    { label: "Total Orders", value: dbStats.totalOrders ? dbStats.totalOrders * 30 : 4562, icon: "📦", color: "#c5a85c", trend: "↗ 12.4% vs last 30 days", trendType: "up" },
    { label: "Total Customers", value: dbStats.totalCustomers ? dbStats.totalCustomers * 15 : 8745, icon: "👥", color: "#c5a85c", trend: "↗ 15.7% vs last 30 days", trendType: "up" },
    { label: "Active Stores", value: 56, icon: "🏪", color: "#c5a85c", trend: "↗ 8.3% vs last 30 days", trendType: "up" },
    { label: "Conversion Rate", value: "2.48%", icon: "🎯", color: "#c5a85c", trend: "↗ 6.5% vs last 30 days", trendType: "up" }
  ];

  const currentStatsGrid = isSuper ? superStats : adminStats;

  // Chart values
  const chartPointsAdmin = [50000, 78000, 95000, 80000, 110000, 125000, 145680];
  const chartPointsSuper = [950000, 1450000, 1850000, 1600000, 2100000, 1950000, 2485680];
  const chartDates = ["12 Jul", "13 Jul", "14 Jul", "15 Jul", "16 Jul", "17 Jul", "18 Jul"];

  const donutCategoriesAdmin = [
    { label: "Dresses", value: 40, color: "#c5a85c" },
    { label: "Tops", value: 30, color: "#3b82f6" },
    { label: "Sarees", value: 15, color: "#f97316" },
    { label: "Accessories", value: 10, color: "#a855f7" },
    { label: "Others", value: 6, color: "#eab308" }
  ];

  const donutCategoriesSuper = [
    { label: "Dresses", value: 38, color: "#c5a85c" },
    { label: "Tops", value: 26, color: "#3b82f6" },
    { label: "Sarees", value: 16, color: "#f97316" },
    { label: "Accessories", value: 12, color: "#a855f7" },
    { label: "Others", value: 8, color: "#eab308" }
  ];

  // Best Selling Products
  const adminBestSelling = [
    { name: "Floral Maxi Dress", price: 2450, sold: 210, img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=100&auto=format&fit=crop" },
    { name: "Embroidered Kurti", price: 1850, sold: 165, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=100&auto=format&fit=crop" },
    { name: "Silk Saree", price: 3250, sold: 120, img: "https://images.unsplash.com/photo-1610030470217-10f8a8ad3b66?q=80&w=100&auto=format&fit=crop" },
    { name: "Women Heels", price: 2100, sold: 95, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=100&auto=format&fit=crop" }
  ];

  const superBestSelling = [
    { name: "Floral Maxi Dress", price: 2450, sold: 342, img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=100&auto=format&fit=crop" },
    { name: "Embroidered Kurti", price: 1850, sold: 289, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=100&auto=format&fit=crop" },
    { name: "Stylish Handbag", price: 1650, sold: 256, img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=100&auto=format&fit=crop" },
    { name: "Women Heels", price: 2100, sold: 215, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=100&auto=format&fit=crop" },
    { name: "Silk Saree", price: 3350, sold: 198, img: "https://images.unsplash.com/photo-1610030470217-10f8a8ad3b66?q=80&w=100&auto=format&fit=crop" }
  ];

  // Recent Orders
  const recentOrdersAdmin = [
    { id: "#ORD-1256", customer: "Priya Sharma", amount: 2450, status: "delivered", payment: "Online", date: "18 Jul 2026" },
    { id: "#ORD-1255", customer: "Anjali Verma", amount: 1860, status: "processing", payment: "COD", date: "18 Jul 2026" },
    { id: "#ORD-1254", customer: "Neha Singh", amount: 3250, status: "shipped", payment: "Online", date: "17 Jul 2026" },
    { id: "#ORD-1253", customer: "Kavya Patel", amount: 2100, status: "cancelled", payment: "Online", date: "17 Jul 2026" }
  ];

  const recentOrdersSuper = [
    { id: "#ORD-1256", customer: "Priya Sharma", store: "Elegance Store", amount: 2450, status: "delivered", payment: "Online", date: "18 Jul 2026" },
    { id: "#ORD-1255", customer: "Anjali Verma", store: "Trendy Women", amount: 1850, status: "processing", payment: "COD", date: "18 Jul 2026" },
    { id: "#ORD-1254", customer: "Neha Singh", store: "Elegance Store", amount: 3250, status: "shipped", payment: "Online", date: "17 Jul 2026" },
    { id: "#ORD-1253", customer: "Kavya Patel", store: "Fashion Hub", amount: 2100, status: "cancelled", payment: "COD", date: "17 Jul 2026" }
  ];

  // Recent Customers (Admin view)
  const recentCustomers = [
    { name: "Priya Sharma", email: "priya@gmail.com", date: "18 Jul 2026", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop" },
    { name: "Anjali Verma", email: "anjali@gmail.com", date: "18 Jul 2026", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=80&auto=format&fit=crop" },
    { name: "Neha Singh", email: "neha@gmail.com", date: "17 Jul 2026", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop" },
    { name: "Kavya Patel", email: "kavya@gmail.com", date: "17 Jul 2026", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop" }
  ];

  // Store Performance Progress Bars (Super Admin view)
  const storePerformance = [
    { name: "Elegance Store", sales: 645680, pct: 100 },
    { name: "Trendy Women", sales: 425210, pct: 66 },
    { name: "Fashion Hub", sales: 315450, pct: 49 },
    { name: "Style Studio", sales: 225340, pct: 35 },
    { name: "Women World", sales: 185230, pct: 29 }
  ];

  return (
    <div>
      {/* ─── GRID CARD METRICS ROW ─── */}
      <div className="admin-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 16,
        marginBottom: 24
      }}>
        {currentStatsGrid.map((stat, idx) => (
          <StatCard 
            key={idx} 
            label={stat.label} 
            value={stat.value} 
            icon={stat.icon} 
            color={stat.color} 
            trend={stat.trend}
            trendType={stat.trendType}
          />
        ))}
      </div>

      {/* ─── MIDDLE ROW: LINE CHART & DONUT CHART & BEST PRODUCTS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Sales/Revenue Overview Chart Card */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="admin-card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>
              {isSuper ? 'Revenue Overview' : 'Sales Overview'}
            </h3>
            <select className="admin-select" style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: '0.75rem', height: 28 }} defaultValue="7">
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
          <div className="admin-card-body" style={{ padding: '20px 20px 14px' }}>
            {isSuper && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Revenue</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--admin-text)' }}>{formatCurrency(dbStats.totalRevenue ? dbStats.totalRevenue * 15 : 2485680)}</div>
              </div>
            )}
            <AreaChart 
              points={isSuper ? chartPointsSuper : chartPointsAdmin} 
              dates={chartDates} 
              color="#c5a85c" 
            />
          </div>
        </div>

        {/* Categories Distribution Donut Chart Card */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>
              {isSuper ? 'Revenue by Category' : 'Top Categories'}
            </h3>
          </div>
          <div className="admin-card-body" style={{ padding: '20px' }}>
            <DonutChart 
              data={isSuper ? donutCategoriesSuper : donutCategoriesAdmin} 
              totalValueText={isSuper ? formatCurrency(dbStats.totalRevenue ? dbStats.totalRevenue * 15 : 2485680) : formatCurrency(dbStats.totalRevenue || 145680)} 
            />
          </div>
        </div>

        {/* Best Selling Products Card */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>
              {isSuper ? 'Top Selling Products' : 'Best Selling Products'}
            </h3>
            <button className="admin-btn-view-all" onClick={() => navigate('/admin/products')}>
              View All
            </button>
          </div>
          <div className="admin-card-body" style={{ padding: '12px 20px' }}>
            {(isSuper ? superBestSelling : adminBestSelling).map((p, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '10px 0',
                borderBottom: idx === (isSuper ? 4 : 3) ? 'none' : '1px solid var(--admin-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={p.img} alt={p.name} style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', background: '#f5f5f5' }} loading="lazy" decoding="async" />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{formatCurrency(p.price)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                  {p.sold} <span style={{ fontWeight: 400, color: 'var(--admin-text-dim)', fontSize: '0.75rem' }}>Sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM ROW: RECENT ORDERS & CUSTOMERS/PERFORMANCE ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20 }}>
        {/* Recent Orders Grid Card */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Recent Orders</h3>
            <button className="admin-btn-view-all" onClick={() => navigate('/admin/orders')}>
              View All
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ padding: '10px 16px', fontSize: '0.68rem' }}>Order ID</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.68rem' }}>Customer</th>
                  {isSuper && <th style={{ padding: '10px 16px', fontSize: '0.68rem' }}>Store</th>}
                  <th style={{ padding: '10px 16px', fontSize: '0.68rem' }}>Amount</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.68rem' }}>Status</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.68rem' }}>Payment</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.68rem' }}>Date</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.68rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(isSuper ? recentOrdersSuper : recentOrdersAdmin).map((o, idx) => (
                  <tr key={idx} style={{ hover: { background: 'rgba(0,0,0,0.01)' } }}>
                    <td className="primary-cell" style={{ padding: '10px 16px', fontSize: '0.8rem', color: 'var(--admin-text)' }}>{o.id}</td>
                    <td style={{ padding: '10px 16px', fontSize: '0.8rem' }}>{o.customer}</td>
                    {isSuper && <td style={{ padding: '10px 16px', fontSize: '0.8rem', fontWeight: 500 }}>{o.store}</td>}
                    <td className="primary-cell" style={{ padding: '10px 16px', fontSize: '0.8rem' }}>{formatCurrency(o.amount)}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className={`admin-badge admin-badge-${
                        o.status === 'delivered' ? 'green' : 
                        o.status === 'processing' ? 'orange' : 
                        o.status === 'shipped' ? 'blue' : 'red'
                      }`} style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '0.8rem' }}>{o.payment}</td>
                    <td style={{ padding: '10px 16px', fontSize: '0.8rem' }}>{o.date}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <button className="admin-btn-icon" onClick={() => navigate('/admin/orders')} style={{ padding: 4 }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store Performance OR Recent Customers */}
        {isSuper ? (
          /* Store Performance (Super Admin) */
          <div className="admin-card">
            <div className="admin-card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Store Performance</h3>
              <button className="admin-btn-view-all" onClick={() => {}}>
                View All
              </button>
            </div>
            <div className="admin-card-body" style={{ padding: '14px 20px' }}>
              {storePerformance.map((st, idx) => (
                <div key={idx} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text-muted)' }}>{st.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{formatCurrency(st.sales)}</span>
                  </div>
                  <div className="admin-progress-container">
                    <div className="admin-progress-bar-bg">
                      <div className="admin-progress-bar-fill" style={{ width: `${st.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Recent Customers (Admin) */
          <div className="admin-card">
            <div className="admin-card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Recent Customers</h3>
              <button className="admin-btn-view-all" onClick={() => navigate('/admin/users')}>
                View All
              </button>
            </div>
            <div className="admin-card-body" style={{ padding: '12px 20px' }}>
              {recentCustomers.map((c, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '10px 0',
                  borderBottom: idx === 3 ? 'none' : '1px solid var(--admin-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={c.img} alt={c.name} style={{ width: 34, height: 34, borderRadius: 50, objectFit: 'cover' }} loading="lazy" decoding="async" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--admin-text-dim)', fontWeight: 500 }}>
                    {c.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
