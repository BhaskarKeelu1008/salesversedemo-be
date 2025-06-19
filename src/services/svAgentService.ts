import { v4 as uuidv4 } from 'uuid';
import { PaginatedResponse, PaginationParams } from '../types';
import { paginateData } from './paginationUtils';

export interface SVAgent {
  id: string;
  channelId: string;
  channelName: string;
  designationId: string;
  designationName: string;
  agentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  reportingManagerId: string;
  province: string;
  city: string;
  tinNumber: string;
  accountStatus: 'active' | 'inactive';
  bankAccountNumber: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for provinces and cities
export const provinces = [
  'Metro Manila',
  'Cebu',
  'Davao',
  'Pampanga',
  'Batangas',
  'Laguna',
  'Cavite',
  'Rizal',
  'Bulacan',
  'Nueva Ecija',
];

export const citiesByProvince: Record<string, string[]> = {
  'Metro Manila': [
    'Makati',
    'Manila',
    'Quezon City',
    'Pasig',
    'Taguig',
    'Mandaluyong',
    'San Juan',
    'Caloocan',
    'Marikina',
    'Parañaque',
  ],
  Cebu: [
    'Cebu City',
    'Mandaue',
    'Lapu-Lapu',
    'Talisay',
    'Danao',
    'Carcar',
    'Toledo',
    'Naga',
    'Bogo',
    'Minglanilla',
  ],
  Davao: [
    'Davao City',
    'Tagum',
    'Digos',
    'Panabo',
    'Mati',
    'Samal',
    'Malita',
    'Nabunturan',
    'Montevista',
    'Pantukan',
  ],
  Pampanga: [
    'San Fernando',
    'Angeles',
    'Mabalacat',
    'Mexico',
    'Apalit',
    'Bacolor',
    'Guagua',
    'Lubao',
    'Porac',
    'Santa Rita',
  ],
  Batangas: [
    'Batangas City',
    'Lipa',
    'Tanauan',
    'Santo Tomas',
    'Nasugbu',
    'Bauan',
    'Lemery',
    'Rosario',
    'San Jose',
    'Balayan',
  ],
  Laguna: [
    'Santa Rosa',
    'Calamba',
    'San Pablo',
    'Biñan',
    'Cabuyao',
    'Los Baños',
    'San Pedro',
    'Alaminos',
    'Bay',
    'Calauan',
  ],
  Cavite: [
    'Bacoor',
    'Imus',
    'Dasmariñas',
    'Cavite City',
    'Tagaytay',
    'General Trias',
    'Trece Martires',
    'Carmona',
    'Silang',
    'Tanza',
  ],
  Rizal: [
    'Antipolo',
    'Cainta',
    'Taytay',
    'Angono',
    'Binangonan',
    'Rodriguez',
    'San Mateo',
    'Tanay',
    'Teresa',
    'Morong',
  ],
  Bulacan: [
    'Malolos',
    'Meycauayan',
    'San Jose del Monte',
    'Marilao',
    'Obando',
    'Plaridel',
    'Pulilan',
    'Santa Maria',
    'Balagtas',
    'Bocaue',
  ],
  'Nueva Ecija': [
    'Cabanatuan',
    'San Jose',
    'Gapan',
    'Palayan',
    'Science City of Muñoz',
    'Talavera',
    'Guimba',
    'Santa Rosa',
    'Aliaga',
    'Zaragoza',
  ],
};

// Generate 20 sample agents
const generateSampleAgents = (): SVAgent[] => {
  const sampleAgents: SVAgent[] = [];
  const channels = ['1', '2']; // Sample channel IDs
  const designations = ['1', '2']; // Sample designation IDs
  const channelNames = ['Direct Sales', 'Partner Network'];
  const designationNames = ['Sales Manager', 'Sales Representative'];
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive'];

  for (let i = 1; i <= 20; i++) {
    const channelIndex = Math.floor(Math.random() * channels.length);
    const designationIndex = Math.floor(Math.random() * designations.length);
    const provinceIndex = Math.floor(Math.random() * provinces.length);
    const province = provinces[provinceIndex];
    const cities = citiesByProvince[province];
    const cityIndex = Math.floor(Math.random() * cities.length);

    sampleAgents.push({
      id: uuidv4(),
      channelId: channels[channelIndex],
      channelName: channelNames[channelIndex],
      designationId: designations[designationIndex],
      designationName: designationNames[designationIndex],
      agentCode: String(10000 + i).padStart(5, '0'),
      firstName: `Agent${i}`,
      lastName: `Test${i}`,
      email: `agent${i}@salesverse.com`,
      mobile: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      reportingManagerId: `MGR${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      province: province,
      city: cities[cityIndex],
      tinNumber: String(Math.floor(Math.random() * 900000000) + 100000000),
      accountStatus: statuses[Math.floor(Math.random() * statuses.length)],
      bankAccountNumber: String(
        Math.floor(Math.random() * 9000000000) + 1000000000
      ),
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - Math.floor(Math.random() * 1000000000)
      ).toISOString(),
    });
  }

  return sampleAgents;
};

// Initialize mock agents with sample data
const mockAgents: SVAgent[] = generateSampleAgents();

// Helper function to validate agent code
export const validateAgentCode = async (code: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

  // Check if code matches the required format and length
  if (!/^\d{5,8}$/.test(code)) {
    throw new Error('Agent code must be a number between 5 and 8 digits');
  }

  // Check if code is unique
  const exists = mockAgents.some(agent => agent.agentCode === code);
  if (exists) {
    throw new Error('Agent code already exists');
  }

  return true;
};

// Mock API functions
export const getAgents = async (
  filters?: {
    channelId?: string;
    designationId?: string;
    searchQuery?: string;
    status?: 'active' | 'inactive';
  },
  pagination?: PaginationParams
): Promise<PaginatedResponse<SVAgent>> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  let filteredAgents = [...mockAgents];

  if (filters) {
    if (filters.channelId) {
      filteredAgents = filteredAgents.filter(
        a => a.channelId === filters.channelId
      );
    }
    if (filters.designationId) {
      filteredAgents = filteredAgents.filter(
        a => a.designationId === filters.designationId
      );
    }
    if (filters.status) {
      filteredAgents = filteredAgents.filter(
        a => a.accountStatus === filters.status
      );
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredAgents = filteredAgents.filter(
        a =>
          a.firstName.toLowerCase().includes(query) ||
          a.lastName.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query) ||
          a.agentCode.includes(query)
      );
    }
  }

  // Sort by creation date, newest first
  filteredAgents.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (pagination) {
    return paginateData(filteredAgents, pagination);
  }

  return {
    data: filteredAgents,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: filteredAgents.length,
      itemsPerPage: filteredAgents.length,
      showingFrom: 1,
      showingTo: filteredAgents.length,
    },
  };
};

export const createAgent = async (
  data: Omit<SVAgent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SVAgent> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

  // Validate agent code
  await validateAgentCode(data.agentCode);

  const newAgent: SVAgent = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockAgents.push(newAgent);
  return newAgent;
};

export const updateAgentStatus = async (
  id: string,
  status: 'active' | 'inactive'
): Promise<SVAgent> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

  const agentIndex = mockAgents.findIndex(a => a.id === id);
  if (agentIndex === -1) throw new Error('Agent not found');

  const updatedAgent = {
    ...mockAgents[agentIndex],
    accountStatus: status,
    updatedAt: new Date().toISOString(),
  };

  mockAgents[agentIndex] = updatedAgent;
  return updatedAgent;
};

// Function to get agent statistics
export const getAgentStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
}> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

  return {
    total: mockAgents.length,
    active: mockAgents.filter(a => a.accountStatus === 'active').length,
    inactive: mockAgents.filter(a => a.accountStatus === 'inactive').length,
  };
};
