"use client";

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { GitCommitHorizontal, BookOpen } from 'lucide-react';

interface ActivityTimelineProps {
  activities: any[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  // Group activities by month
  const groupedByMonth = useMemo(() => {
    const groups: { [monthStr: string]: any[] } = {};
    activities.forEach(act => {
      const monthStr = format(new Date(act.timestamp), 'MMMM yyyy');
      if (!groups[monthStr]) groups[monthStr] = [];
      groups[monthStr].push(act);
    });
    return groups;
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div className="mt-8 text-center text-[#8b949e] py-10 border border-[#30363d] rounded-xl border-dashed">
        <p>No activity found for this period.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {Object.entries(groupedByMonth).map(([monthStr, monthActivities]) => {
        // Sub-group by type
        const commits = monthActivities.filter(a => a.type === 'COMMIT');
        const reposCreated = monthActivities.filter(a => a.type === 'CREATE_REPO');

        // Group commits by repository
        const commitsByRepo: { [repoName: string]: number } = {};
        commits.forEach(c => {
          commitsByRepo[c.repoName] = (commitsByRepo[c.repoName] || 0) + 1;
        });

        const repoCount = Object.keys(commitsByRepo).length;

        return (
          <div key={monthStr} className="mb-8">
            <h3 className="text-xs font-semibold text-white mb-4 flex items-center">
              {monthStr}
              <div className="ml-4 h-[1px] bg-[#30363d] flex-1"></div>
            </h3>

            <div className="relative border-l border-[#30363d] ml-3 space-y-6 pb-4">
              
              {/* Commits Section */}
              {commits.length > 0 && (
                <div className="relative pl-6">
                  <div className="absolute left-[-13px] top-0 bg-[#0d1117] p-1">
                    <div className="w-4 h-4 bg-[#21262d] rounded-full flex items-center justify-center ring-1 ring-[#30363d]">
                      <GitCommitHorizontal className="w-3 h-3 text-[#8b949e]" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-[#c9d1d9] mb-2">
                    Created {commits.length} commit{commits.length > 1 ? 's' : ''} in {repoCount} repositor{repoCount > 1 ? 'ies' : 'y'}
                  </h4>
                  <ul className="space-y-2">
                    {Object.entries(commitsByRepo).map(([repoName, count]) => (
                      <li key={repoName} className="flex justify-between items-center text-sm">
                        <a href={`#`} className="text-indigo-500 hover:underline font-semibold">{repoName}</a>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#8b949e]">{count} commit{count > 1 ? 's' : ''}</span>
                          <div className="w-[100px] h-2 bg-[#21262d] rounded-full overflow-hidden flex">
                            <div className="bg-[#238636] h-full" style={{ width: `${Math.min((count / commits.length) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Repositories Created Section */}
              {reposCreated.length > 0 && (
                <div className="relative pl-6">
                  <div className="absolute left-[-13px] top-0 bg-[#0d1117] p-1">
                    <div className="w-4 h-4 bg-[#21262d] rounded-full flex items-center justify-center ring-1 ring-[#30363d]">
                      <BookOpen className="w-3 h-3 text-[#8b949e]" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-[#c9d1d9] mb-2">
                    Created {reposCreated.length} repositor{reposCreated.length > 1 ? 'ies' : 'y'}
                  </h4>
                  <ul className="space-y-2">
                    {reposCreated.map(repo => (
                      <li key={repo.repoId} className="flex justify-between items-center text-sm">
                        <a href={`#`} className="text-indigo-500 hover:underline font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#8b949e]" /> {repo.repoName}
                        </a>
                        <span className="text-xs text-[#8b949e]">{format(new Date(repo.timestamp), 'MMM d')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
            
            <div className="mt-4">
              <button className="w-full py-2 bg-[#120f0e] border border-[#2d2623] rounded-md text-sm text-indigo-500 font-semibold hover:bg-[#1e1917] transition-colors cursor-pointer">
                Show more activity
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
