import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Building2,
  DollarSign,
} from 'lucide-react';

const cards = [
  {
    id: 'total-sales',
    title: 'Total Sales',
    value: 'LKR 2.4M',
    sub: '+12.4% vs last month',
    trend: 'up',
    icon: DollarSign,
    accent: 'from-blue-600 to-blue-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'total-orders',
    title: 'Total Orders',
    value: '1,248',
    sub: '+8.1% vs last month',
    trend: 'up',
    icon: ShoppingCart,
    accent: 'from-emerald-600 to-emerald-500',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'low-stock',
    title: 'Low Stock Items',
    value: '36',
    sub: 'Needs immediate attention',
    trend: 'down',
    icon: AlertTriangle,
    accent: 'from-amber-500 to-amber-400',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'active-branches',
    title: 'Active Branches',
    value: '08',
    sub: 'All branches reporting',
    trend: 'neutral',
    icon: Building2,
    accent: 'from-violet-600 to-violet-500',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    id: 'net-revenue',
    title: 'Net Revenue',
    value: 'LKR 1.8M',
    sub: 'After taxes & deductions',
    trend: 'up',
    icon: TrendingUp,
    accent: 'from-sky-600 to-sky-500',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    badgeColor: 'bg-sky-100 text-sky-700',
  },
];

function ReportSummaryCards() {
  return (
    <section aria-label="Report Summary KPI Cards">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Top accent bar */}
              <div
                className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${card.accent}`}
              />

              {/* Icon */}
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}
              >
                <Icon size={20} className={card.iconColor} strokeWidth={2} />
              </div>

              {/* Value */}
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
                {card.value}
              </p>

              {/* Sub / trend */}
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${card.badgeColor}`}
                >
                  {card.trend === 'up' && '↑'}
                  {card.trend === 'down' && '↓'}
                  {card.sub}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ReportSummaryCards;
