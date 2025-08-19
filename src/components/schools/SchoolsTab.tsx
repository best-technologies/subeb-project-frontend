'use client';
import React, { useState, useMemo } from 'react';
import { useAdminDashboard } from '@/services';
import { formatEducationalText } from '@/utils/formatters';

interface SchoolStats {
  name: string;
  lga: string;
  totalStudents: number;
  averageScore: number;
  topPerformer: string;
  topScore: number;
  classDistribution: Record<string, number>;
  genderDistribution: { male: number; female: number };
  subjectAverages: Record<string, number>;
}

const SchoolsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedSchool, setSelectedSchool] = useState<SchoolStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch real data from API
  const { data: dashboardData, loading, error } = useAdminDashboard();

  const schoolStats = useMemo(() => {
    const schools = dashboardData?.data?.schools || dashboardData?.schools || [];
    if (schools.length === 0) return [];

    const stats: SchoolStats[] = schools.map(school => {
      // For now, we'll use the school data directly since we don't have student data per school
      // In a real implementation, you'd want to fetch students per school
      return {
        name: school.name,
        lga: school.lga || 'Unknown',
        totalStudents: school.totalStudents,
        averageScore: 0, // Would need to calculate from student data
        topPerformer: 'N/A',
        topScore: 0,
        classDistribution: {},
        genderDistribution: { male: 0, female: 0 },
        subjectAverages: {}
      };
    });

    return stats;
  }, [dashboardData]);

  const filteredAndSortedSchools = useMemo(() => {
    const filtered = schoolStats.filter(school => {
      const search = searchTerm.trim().toLowerCase();
      const schoolName = school.name.trim().toLowerCase();
      const lga = school.lga.trim().toLowerCase();
      // Search term matches school name or LGA
      const matchesSearch =
        schoolName.includes(search) || lga.includes(search);
      // LGA filter is case-insensitive and trimmed
      const matchesLGA = !selectedLGA || lga === selectedLGA.trim().toLowerCase();
      return matchesSearch && matchesLGA;
    });

    // Sort schools
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof SchoolStats];
      const bValue = b[sortBy as keyof SchoolStats];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [schoolStats, searchTerm, selectedLGA, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'bg-amber-500/10 border-amber-500/20';
    if (score >= 60) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const totalStudents = schoolStats.reduce((sum, school) => sum + school.totalStudents, 0);
  const overallAverage = Math.round(
    schoolStats.reduce((sum, school) => sum + school.averageScore, 0) / schoolStats.length
  );
  const topSchools = schoolStats
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading schools data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">Error Loading Schools</h2>
          <p className="text-gray-300 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Schools Management</h1>
            <p className="text-gray-300 text-lg">Comprehensive school analytics and performance insights</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{filteredAndSortedSchools.length}</div>
              <div className="text-sm text-gray-400">Total Schools</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(overallAverage)}`}>{overallAverage}%</div>
              <div className="text-sm text-gray-400">Overall Average</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Top Performing Schools */}
      {topSchools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topSchools.map((school, index) => (
            <div key={school.name} className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                  index === 1 ? 'bg-gray-500/20 text-gray-300' :
                  'bg-orange-500/20 text-orange-300'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Top Performer
                </span>
              </div>
                                <h3 className="text-lg font-semibold text-white mb-1">{formatEducationalText(school.name)}</h3>
              <p className="text-gray-400 text-sm mb-3">{school.lga}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xl font-bold ${getScoreColor(school.averageScore)}`}>
                    {school.averageScore}%
                  </div>
                  <div className="text-xs text-gray-400">Average Score</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {school.totalStudents}
                  </div>
                  <div className="text-xs text-gray-400">Students</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

       {/* Enhanced Search and Filters */}
       <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Search Schools</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by school name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Filter by LGA</label>
            <select
              value={selectedLGA}
              onChange={(e) => setSelectedLGA(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All LGAs</option>
              {(dashboardData?.data?.lgas || dashboardData?.lgas || []).map(lga => (
                <option key={lga.id} value={lga.name}>{lga.name}</option>
              )) || (
                <>
                  <option value="Awka North">Awka North</option>
                  <option value="Awka South">Awka South</option>
                  <option value="Anambra East">Anambra East</option>
                  <option value="Anambra West">Anambra West</option>
                  <option value="Anaocha">Anaocha</option>
                  <option value="Ayamelum">Ayamelum</option>
                  <option value="Dunukofia">Dunukofia</option>
                  <option value="Ekwusigo">Ekwusigo</option>
                  <option value="Idemili North">Idemili North</option>
                  <option value="Idemili South">Idemili South</option>
                  <option value="Ihiala">Ihiala</option>
                  <option value="Njikoka">Njikoka</option>
                  <option value="Nnewi North">Nnewi North</option>
                  <option value="Nnewi South">Nnewi South</option>
                  <option value="Ogbaru">Ogbaru</option>
                  <option value="Onitsha North">Onitsha North</option>
                  <option value="Onitsha South">Onitsha South</option>
                  <option value="Orumba North">Orumba North</option>
                  <option value="Orumba South">Orumba South</option>
                  <option value="Oyi">Oyi</option>
                </>
              )}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLGA('');
                setSortBy('name');
                setSortOrder('asc');
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏫</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-300">Total Schools</p>
              <p className="text-3xl font-bold text-blue-400">{schoolStats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-300">Total Students</p>
              <p className="text-3xl font-bold text-green-400">{totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-300">Overall Average</p>
              <p className={`text-3xl font-bold ${getScoreColor(overallAverage)}`}>{overallAverage}%</p>
            </div>
          </div>
        </div>
      </div>

     

      {/* Enhanced Schools Table */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-black/40 to-black/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    <span>🏫 School</span>
                    {sortBy === 'name' && (
                      <span className="text-green-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('lga')}>
                  <div className="flex items-center gap-2">
                    <span>📍 LGA</span>
                    {sortBy === 'lga' && (
                      <span className="text-green-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('totalStudents')}>
                  <div className="flex items-center gap-2">
                    <span>👥 Students</span>
                    {sortBy === 'totalStudents' && (
                      <span className="text-green-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('averageScore')}>
                  <div className="flex items-center gap-2">
                    <span>📈 Average</span>
                    {sortBy === 'averageScore' && (
                      <span className="text-green-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('topScore')}>
                  <div className="flex items-center gap-2">
                    <span>🏆 Top Score</span>
                    {sortBy === 'topScore' && (
                      <span className="text-green-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedSchools.map((school) => (
                <tr key={school.name} className="hover:bg-white/5 transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-sm font-bold text-green-300">
                        🏫
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-green-300 transition-colors duration-200">{formatEducationalText(school.name)}</div>
                        <div className="text-sm text-gray-400">{school.lga}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {school.lga}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-blue-400">
                      {school.totalStudents}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBgColor(school.averageScore)}`}>
                      <span className={`${getScoreColor(school.averageScore)}`}>{school.averageScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-semibold ${getScoreColor(school.topScore)}`}>
                        {school.topScore}
                      </div>
                      <div className="text-xs text-gray-400">{school.topPerformer}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedSchool(school);
                        setShowDetails(true);
                      }}
                      className="text-green-400 hover:text-green-300 transition-colors duration-200 font-medium hover:underline"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced School Details Modal */}
      {showDetails && selectedSchool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl p-6 border-b border-white/10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-lg text-green-300">
                    🏫
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{formatEducationalText(selectedSchool.name)}</h3>
                    <p className="text-gray-400">{selectedSchool.lga}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">👥</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">
                    {selectedSchool.totalStudents}
                  </div>
                  <div className="text-sm text-gray-400">Total Students</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">📈</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(selectedSchool.averageScore)}`}>
                    {selectedSchool.averageScore}%
                  </div>
                  <div className="text-sm text-gray-400">Average Score</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(selectedSchool.topScore)}`}>
                    {selectedSchool.topScore}
                  </div>
                  <div className="text-sm text-gray-400">Top Score</div>
                </div>
              </div>

              {/* School Info and Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🏫</span>
                    School Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">School Name</span>
                      <span className="text-white font-medium text-right">{formatEducationalText(selectedSchool.name)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">LGA</span>
                      <span className="text-white font-medium">{selectedSchool.lga}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Total Students</span>
                      <span className="text-white font-medium">{selectedSchool.totalStudents}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Performance Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">Average Score</span>
                      <span className={`text-white font-medium ${getScoreColor(selectedSchool.averageScore)}`}>
                        {selectedSchool.averageScore}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">Top Performer</span>
                      <span className="text-white font-medium">{selectedSchool.topPerformer}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Top Score</span>
                      <span className={`text-white font-medium ${getScoreColor(selectedSchool.topScore)}`}>
                        {selectedSchool.topScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Distribution */}
              <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <span className="mr-2">📚</span>
                  Class Distribution
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(selectedSchool.classDistribution).map(([className, count]) => (
                    <div key={className} className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20 hover:scale-105 transition-all duration-200">
                      <div className="text-sm text-gray-300 mb-2">{className}</div>
                      <div className="text-2xl font-bold text-blue-400">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <span className="mr-2">👥</span>
                  Gender Distribution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-6 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👨</span>
                      </div>
                      <span className="text-sm text-gray-400">Male Students</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">{selectedSchool.genderDistribution.male}</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-lg p-6 border border-pink-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👩</span>
                      </div>
                      <span className="text-sm text-gray-400">Female Students</span>
                    </div>
                    <div className="text-3xl font-bold text-pink-400">{selectedSchool.genderDistribution.female}</div>
                  </div>
                </div>
              </div>

              {/* Subject Averages */}
              <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <span className="mr-2">📊</span>
                  Subject Averages
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(selectedSchool.subjectAverages).map(([subject, average]) => (
                    <div key={subject} className={`rounded-lg p-4 border transition-all duration-200 hover:scale-105 ${getScoreBgColor(average)}`}>
                      <div className="text-sm text-gray-300 mb-2 capitalize">{subject.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className={`text-2xl font-bold ${getScoreColor(average)}`}>
                        {average}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolsTab; 