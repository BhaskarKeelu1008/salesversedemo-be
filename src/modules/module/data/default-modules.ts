export const defaultModules = [
  {
    name: 'Leads',
    code: 'LEADS',
    description: 'Lead management module',
    defaultConfig: {},
    isCore: true,
    version: '1.0.0',
    permissions: ['leads.view', 'leads.create', 'leads.edit', 'leads.delete'],
  },
  {
    name: 'Calendar',
    code: 'CALENDAR',
    description: 'Calendar and event management module',
    defaultConfig: {},
    isCore: true,
    version: '1.0.0',
    permissions: [
      'calendar.view',
      'calendar.create',
      'calendar.edit',
      'calendar.delete',
    ],
  },
  {
    name: 'Todo',
    code: 'TODO',
    description: 'Task and todo management module',
    defaultConfig: {},
    isCore: true,
    version: '1.0.0',
    permissions: ['todo.view', 'todo.create', 'todo.edit', 'todo.delete'],
  },
  {
    name: 'DailyBusiness',
    code: 'DAILY_BUSINESS',
    description: 'Daily business operations module',
    defaultConfig: {},
    isCore: true,
    version: '1.0.0',
    permissions: [
      'dailyBusiness.view',
      'dailyBusiness.create',
      'dailyBusiness.edit',
      'dailyBusiness.delete',
    ],
  },
  {
    name: 'Product',
    code: 'PRODUCT',
    description: 'Product management module',
    defaultConfig: {},
    isCore: true,
    version: '1.0.0',
    permissions: [
      'product.view',
      'product.create',
      'product.edit',
      'product.delete',
    ],
  },
  {
    name: 'ResourceCenter',
    code: 'RESOURCE_CENTER',
    description: 'Resource and document management module',
    defaultConfig: {},
    isCore: true,
    version: '1.0.0',
    permissions: [
      'resourceCenter.view',
      'resourceCenter.create',
      'resourceCenter.edit',
      'resourceCenter.delete',
    ],
  },
];
