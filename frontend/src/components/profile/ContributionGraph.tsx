import React, { useMemo } from 'react';
import { format, subDays, getDay, isSameDay, startOfYear, endOfYear, eachDayOfInterval, isAfter } from 'date-fns';

interface ContributionGraphProps {
  activities: any[];
  year: number;
  availableYears: number[];
  onYearSelect: (year: number) => void;
}

export default function ContributionGraph({ activities, year, availableYears, onYearSelect }: ContributionGraphProps) {
  const isCurrentYear = year === new Date().getFullYear();

  // Determine date range for the grid
  const { startDate, endDate, days } = useMemo(() => {
    let end = new Date();
    let start = new Date();
    
    if (isCurrentYear) {
      end = new Date(); // Today
      start = subDays(end, 364); // Last 365 days
    } else {
      start = startOfYear(new Date(year, 0, 1));
      end = endOfYear(new Date(year, 0, 1));
      // For past years, we might want to make it exactly 52 weeks or just plot the exact days
      // Let's stick to full year
    }

    const allDays = eachDayOfInterval({ start, end });
    return { startDate: start, endDate: end, days: allDays };
  }, [year, isCurrentYear]);

  // Map activities by date
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach(act => {
      const dateStr = format(new Date(act.timestamp), 'yyyy-MM-dd');
      map.set(dateStr, (map.get(dateStr) || 0) + 1);
    });
    return map;
  }, [activities]);

  const totalContributions = activities.length;

  // Build the grid (7 rows: Sun to Sat)
  // We need to pad the first week so it aligns with Sunday
  const startDayOfWeek = getDay(startDate); // 0 = Sunday
  
  const grid: (Date | null)[][] = Array(7).fill(null).map(() => []);
  
  // Pad the beginning
  for (let i = 0; i < startDayOfWeek; i++) {
    grid[i].push(null);
  }

  // Distribute days into the 7 rows
  let currentColumnIndex = 0;
  days.forEach((day) => {
    const dayOfWeek = getDay(day);
    grid[dayOfWeek].push(day);
  });

  // Calculate month labels positions
  const monthLabels: { month: string, index: number }[] = [];
  let currentMonth = -1;
  grid[0].forEach((day, index) => {
    if (day) {
      const month = day.getMonth();
      if (month !== currentMonth) {
        monthLabels.push({ month: format(day, 'MMM'), index });
        currentMonth = month;
      }
    }
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-[#161b22]'; // Empty
    if (count === 1) return 'bg-[#0e4429]'; // Low
    if (count <= 3) return 'bg-[#006d32]'; // Med
    if (count <= 5) return 'bg-[#26a641]'; // High
    return 'bg-[#39d353]'; // Very High
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-6">
      <div className="flex-1 min-w-0">
        <h2 className="text-sm text-white mb-2">{totalContributions} contributions in {isCurrentYear ? 'the last year' : year}</h2>
        <div className="border border-[#30363d] bg-[#0d1117] rounded-xl p-5 overflow-hidden">
          
          <div className="overflow-x-auto pb-4 no-scrollbar">
            <div className="relative min-w-max">
              {/* Month Labels */}
              <div className="flex text-xs text-[#8b949e] mb-2" style={{ height: '15px' }}>
                <div className="w-[30px] shrink-0"></div> {/* Spacer for days text */}
                <div className="flex-1 relative">
                  {monthLabels.map((lbl, i) => (
                    <span key={i} className="absolute" style={{ left: `${lbl.index * 15}px` }}>
                      {lbl.month}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid Area */}
              <div className="flex gap-2">
                {/* Day Labels (Mon, Wed, Fri) */}
                <div className="flex flex-col gap-[3px] text-[10px] text-[#8b949e] w-[30px] pt-[2px]">
                  <span className="h-[12px]"></span> {/* Sun */}
                  <span className="h-[12px] leading-[12px]">Mon</span> {/* Mon */}
                  <span className="h-[12px]"></span> {/* Tue */}
                  <span className="h-[12px] leading-[12px]">Wed</span> {/* Wed */}
                  <span className="h-[12px]"></span> {/* Thu */}
                  <span className="h-[12px] leading-[12px]">Fri</span> {/* Fri */}
                  <span className="h-[12px]"></span> {/* Sat */}
                </div>

                {/* The actual cells */}
                <div className="flex flex-col gap-[3px]">
                  {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-[3px]">
                      {row.map((day, colIndex) => {
                        if (!day) return <div key={`${rowIndex}-${colIndex}`} className="w-[12px] h-[12px] rounded-sm bg-transparent" />;
                        
                        const count = activityMap.get(format(day, 'yyyy-MM-dd')) || 0;
                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-[12px] h-[12px] rounded-sm ${getIntensityClass(count)} outline outline-1 outline-offset-[-1px] outline-white/5 hover:outline-white/40 transition-all cursor-pointer`}
                            title={`${count} contributions on ${format(day, 'MMM d, yyyy')}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <a href="#" className="text-xs text-[#8b949e] hover:text-[#58a6ff]">Learn how we count contributions</a>
            <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <span>Less</span>
              <div className="flex gap-[3px]">
                <div className="w-[12px] h-[12px] rounded-sm bg-[#161b22] outline outline-1 outline-offset-[-1px] outline-white/5" />
                <div className="w-[12px] h-[12px] rounded-sm bg-[#0e4429] outline outline-1 outline-offset-[-1px] outline-white/5" />
                <div className="w-[12px] h-[12px] rounded-sm bg-[#006d32] outline outline-1 outline-offset-[-1px] outline-white/5" />
                <div className="w-[12px] h-[12px] rounded-sm bg-[#26a641] outline outline-1 outline-offset-[-1px] outline-white/5" />
                <div className="w-[12px] h-[12px] rounded-sm bg-[#39d353] outline outline-1 outline-offset-[-1px] outline-white/5" />
              </div>
              <span>More</span>
            </div>
          </div>

        </div>
      </div>

      {/* Year Selector (Right sidebar on desktop, bottom on mobile) */}
      <div className="w-full md:w-[150px] shrink-0 pt-[28px] flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar">
        {availableYears.map(y => (
          <button
            key={y}
            onClick={() => onYearSelect(y)}
            className={`px-4 py-2 text-sm rounded-md text-left whitespace-nowrap transition-colors ${
              year === y ? 'bg-[#1f6feb] text-white font-semibold' : 'text-[#8b949e] hover:bg-[#161b22]'
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
