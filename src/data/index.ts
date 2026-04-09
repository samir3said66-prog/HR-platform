// Mock data for development and testing
export const MOCK_EMPLOYEES = [
  {
    id: 'EMP001',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@company.com',
    department: 'Engineering',
    region: 'Middle East',
    role: 'Senior Software Engineer',
    status: 'active' as const,
    performanceScore: 92,
    hireDate: '2020-03-15',
    salary: 120000,
  },
  {
    id: 'EMP002',
    name: 'Fatima Al-Mansouri',
    email: 'fatima.mansouri@company.com',
    department: 'Sales',
    region: 'Middle East',
    role: 'Sales Manager',
    status: 'active' as const,
    performanceScore: 85,
    hireDate: '2019-06-20',
    salary: 95000,
  },
  {
    id: 'EMP003',
    name: 'Mohammed Al-Zahra',
    email: 'mohammed.zahra@company.com',
    department: 'HR',
    region: 'Middle East',
    role: 'HR Specialist',
    status: 'active' as const,
    performanceScore: 78,
    hireDate: '2021-01-10',
    salary: 65000,
  },
  {
    id: 'EMP004',
    name: 'Layla Al-Rashid',
    email: 'layla.rashid@company.com',
    department: 'Marketing',
    region: 'Europe',
    role: 'Marketing Director',
    status: 'active' as const,
    performanceScore: 88,
    hireDate: '2018-09-05',
    salary: 110000,
  },
  {
    id: 'EMP005',
    name: 'Omar Al-Kaabi',
    email: 'omar.kaabi@company.com',
    department: 'Finance',
    region: 'Middle East',
    role: 'Financial Analyst',
    status: 'on_leave' as const,
    performanceScore: 82,
    hireDate: '2020-11-12',
    salary: 75000,
  },
];

export const MOCK_DASHBOARD_METRICS = {
  totalHeadcount: 12000,
  activeEmployees: 11850,
  onLeave: 150,
  newHires: 45,
  departures: 28,
  averagePerformance: 79,
  highPerformers: 805,
  needsImprovement: 165,
  reviewsCompleted: 94,
  turnoverRate: 2.3,
  averageTenure: 5.2,
  highRiskRoles: 12,
  lastUpdated: new Date().toISOString(),
};

export const MOCK_PERFORMANCE_METRICS = {
  distribution: [
    { range: '90-100', count: 805, percentage: 6.7 },
    { range: '80-89', count: 3200, percentage: 26.7 },
    { range: '70-79', count: 5400, percentage: 45 },
    { range: '60-69', count: 2400, percentage: 20 },
    { range: 'Below 60', count: 195, percentage: 1.6 },
  ],
  byDepartment: [
    { department: 'Engineering', score: 85, count: 450 },
    { department: 'Sales', score: 76, count: 320 },
    { department: 'Marketing', score: 81, count: 180 },
    { department: 'HR', score: 78, count: 95 },
    { department: 'Finance', score: 82, count: 210 },
    { department: 'Operations', score: 77, count: 280 },
  ],
};

export const MOCK_WORKFORCE_METRICS = {
  byRegion: [
    { region: 'Middle East', headcount: 7200, active: 7100, onLeave: 100 },
    { region: 'Europe', headcount: 4800, active: 4750, onLeave: 50 },
  ],
  byDepartment: [
    { department: 'Engineering', headcount: 3500, active: 3450, onLeave: 50 },
    { department: 'Sales', headcount: 2000, active: 1950, onLeave: 50 },
    { department: 'Marketing', headcount: 1200, active: 1180, onLeave: 20 },
    { department: 'HR', headcount: 600, active: 590, onLeave: 10 },
    { department: 'Finance', headcount: 1300, active: 1280, onLeave: 20 },
    { department: 'Operations', headcount: 2400, active: 2400, onLeave: 0 },
  ],
};

export const MOCK_TURNOVER_METRICS = {
  currentRate: 2.3,
  departuresThisMonth: 28,
  averageTenure: 5.2,
  highRiskRoles: 12,
  byDepartment: [
    { department: 'Engineering', rate: 1.8, departures: 8 },
    { department: 'Sales', rate: 3.2, departures: 10 },
    { department: 'Marketing', rate: 2.1, departures: 3 },
    { department: 'HR', rate: 1.5, departures: 1 },
    { department: 'Finance', rate: 2.0, departures: 3 },
    { department: 'Operations', rate: 2.5, departures: 3 },
  ],
};

export const MOCK_HIRING_FORECAST = {
  totalPredictedHires: 275,
  averageMonthlyHires: 23,
  criticalRolesAtRisk: 12,
  averageConfidence: 89,
  byDepartment: [
    { department: 'Engineering', predicted: 120, confidence: 94 },
    { department: 'Sales', predicted: 65, confidence: 82 },
    { department: 'Marketing', predicted: 25, confidence: 88 },
    { department: 'HR', predicted: 12, confidence: 91 },
    { department: 'Finance', predicted: 28, confidence: 85 },
    { department: 'Operations', predicted: 25, confidence: 87 },
  ],
};
