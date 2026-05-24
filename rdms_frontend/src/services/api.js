import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

const isVercel = () => {
  return window.location.hostname.includes('vercel');
};

if (isVercel()) {
  const getMockDb = () => {
    let db = localStorage.getItem('mock_db');
    if (!db) {
      const initialDb = {
        households: [
          { id: 1, household_code: "HH-LSE-001", village: 1, family_income_pkr: "15000.00", water_source: "Hand Pump", is_widow_headed: true },
          { id: 2, household_code: "HH-LSE-002", village: 2, family_income_pkr: "22000.00", water_source: "Borehole", is_widow_headed: false },
          { id: 3, household_code: "HH-THA-001", village: 3, family_income_pkr: "12000.00", water_source: "River", is_widow_headed: true },
          { id: 4, household_code: "HH-KHZ-001", village: 4, family_income_pkr: "18000.00", water_source: "Open Well", is_widow_headed: false }
        ],
        beneficiaries: [
          { id: 1, cnic: "42301-1234567-1", first_name: "Farzana", last_name: "Khatoon", gender: "FEMALE", date_of_birth: "1978-04-10", contact_number: "0312-3456789", household: 1, is_head_of_household: true },
          { id: 2, cnic: "54401-7654321-2", first_name: "Muhammad", last_name: "Ibrahim", gender: "MALE", date_of_birth: "1985-06-20", contact_number: "0321-7654321", household: 2, is_head_of_household: true },
          { id: 3, cnic: "43201-2345678-3", first_name: "Sakina", last_name: "Bibi", gender: "FEMALE", date_of_birth: "1972-11-05", contact_number: "0333-1234567", household: 3, is_head_of_household: true },
          { id: 4, cnic: "43101-3456789-4", first_name: "Ahmed", last_name: "Baloch", gender: "MALE", date_of_birth: "1990-03-15", contact_number: "0345-9876543", household: 4, is_head_of_household: true }
        ],
        projects: [
          { id: 1, name: "Lasbela Clean Water Drive", budget_pkr: "200000.00", spent_amount: "45000.00", start_date: "2026-01-01", end_date: "", status: "ACTIVE", villages: [1, 2] },
          { id: 2, name: "Thatta Food Security Program", budget_pkr: "300000.00", spent_amount: "120000.00", start_date: "2026-02-01", end_date: "", status: "ACTIVE", villages: [3] }
        ],
        stock: [
          { id: 1, item_name: "Wheat Flour 10kg", item_type: "FOOD", quantity_available: 195, unit: "Bag", reorder_level: 20 },
          { id: 2, item_name: "Portable Water Filter", item_type: "WATER_EQUIPMENT", quantity_available: 50, unit: "Unit", reorder_level: 5 }
        ],
        donors: [
          { id: 1, name: "HBL Foundation", donor_type: "CORPORATE", email: "hbl@hbl.org.pk", phone: "021-32456789", address: "Karachi" },
          { id: 2, name: "UNDP Pakistan", donor_type: "INTERNATIONAL", email: "undp@undp.org", phone: "051-2044000", address: "Islamabad" }
        ],
        volunteers: [
          { id: 1, first_name: "Ali", last_name: "Hassan", cnic: "54401-1111111-1", contact_number: "0312-1234567", email: "ali.hassan@usf.org.pk", status: "AVAILABLE" }
        ]
      };
      localStorage.setItem('mock_db', JSON.stringify(initialDb));
      db = JSON.stringify(initialDb);
    }
    return JSON.parse(db);
  };

  const saveMockDb = (db) => {
    localStorage.setItem('mock_db', JSON.stringify(db));
  };

  const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

  api.get = async (url) => {
    await delay();
    const db = getMockDb();
    const cleanUrl = url.replace(/^\/|\/$/g, '').split('?')[0];

    if (cleanUrl === 'auth/profile') {
      const userStr = localStorage.getItem('user');
      return { data: userStr ? JSON.parse(userStr) : null };
    }
    if (cleanUrl === 'households') {
      return { data: db.households };
    }
    if (cleanUrl === 'beneficiaries') {
      return { data: db.beneficiaries };
    }
    if (cleanUrl === 'projects') {
      return { data: db.projects };
    }
    if (cleanUrl === 'stock') {
      return { data: db.stock };
    }
    if (cleanUrl === 'donors') {
      return { data: db.donors };
    }
    if (cleanUrl === 'volunteers') {
      return { data: db.volunteers };
    }

    if (cleanUrl.startsWith('reports/')) {
      const reportType = cleanUrl.split('/')[1];
      if (reportType === 'project-utilization') {
        const reportData = db.projects.map(p => {
          const budget = parseFloat(p.budget_pkr) || 0;
          const spent = parseFloat(p.spent_amount) || 0;
          const util = budget > 0 ? Math.round((spent / budget) * 100) : 0;
          return {
            project_name: p.name,
            status: p.status,
            budget_pkr: budget,
            spent_pkr: spent,
            utilization_percentage: util,
            remaining_pkr: budget - spent,
            total_items_distributed: Math.floor(spent / 1000)
          };
        });
        return { data: reportData };
      }
      if (reportType === 'donor-impact') {
        return {
          data: db.donors.map((d, index) => ({
            donor_name: d.name,
            donor_type: d.donor_type,
            total_donated_pkr: index === 0 ? 500000 : 750000,
            total_allocated_pkr: index === 0 ? 200000 : 300000,
            projects_funded_count: 1
          }))
        };
      }
      if (reportType === 'inventory-shortages') {
        const shortage = db.stock
          .filter(s => s.quantity_available < s.reorder_level)
          .map(s => ({
            item_name: s.item_name,
            item_type: s.item_type,
            quantity_available: s.quantity_available,
            unit: s.unit,
            reorder_level: s.reorder_level,
            shortage_deficit: s.reorder_level - s.quantity_available
          }));
        if (shortage.length === 0) {
          shortage.push({
            item_name: "First Aid Kit",
            item_type: "MEDICAL",
            quantity_available: 2,
            unit: "Pack",
            reorder_level: 10,
            shortage_deficit: 8
          });
        }
        return { data: shortage };
      }
      if (reportType === 'poverty-profile') {
        return {
          data: [
            {
              village_name: "Winder",
              district_name: "Lasbela",
              province: "BALOCHISTAN",
              total_households: 120,
              avg_monthly_income_pkr: 14500,
              avg_poverty_score: 68
            },
            {
              village_name: "Jati",
              district_name: "Thatta",
              province: "SINDH",
              total_households: 250,
              avg_monthly_income_pkr: 11200,
              avg_poverty_score: 74
            }
          ]
        };
      }
    }

    throw new Error(`Mock GET URL not found: ${url}`);
  };

  api.post = async (url, body) => {
    await delay();
    const db = getMockDb();
    const cleanUrl = url.replace(/^\/|\/$/g, '').split('?')[0];

    if (cleanUrl === 'auth/login') {
      return {
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token'
        }
      };
    }

    const collectionName = cleanUrl;
    if (db[collectionName]) {
      const newItem = { ...body, id: Date.now() };
      db[collectionName].push(newItem);
      saveMockDb(db);
      return { data: newItem };
    }

    throw new Error(`Mock POST URL not found: ${url}`);
  };

  api.patch = async (url, body) => {
    await delay();
    const db = getMockDb();
    const cleanUrl = url.replace(/^\/|\/$/g, '').split('?')[0];

    const parts = cleanUrl.split('/');
    if (parts.length === 2) {
      const collectionName = parts[0];
      const itemId = parseInt(parts[1]) || parts[1];

      if (db[collectionName]) {
        const index = db[collectionName].findIndex(item => item.id == itemId);
        if (index !== -1) {
          db[collectionName][index] = { ...db[collectionName][index], ...body };
          saveMockDb(db);
          return { data: db[collectionName][index] };
        }
      }
    }

    throw new Error(`Mock PATCH URL not found: ${url}`);
  };

  api.delete = async (url) => {
    await delay();
    const db = getMockDb();
    const cleanUrl = url.replace(/^\/|\/$/g, '').split('?')[0];

    const parts = cleanUrl.split('/');
    if (parts.length === 2) {
      const collectionName = parts[0];
      const itemId = parseInt(parts[1]) || parts[1];

      if (db[collectionName]) {
        db[collectionName] = db[collectionName].filter(item => item.id != itemId);
        saveMockDb(db);
        return { data: { success: true } };
      }
    }

    throw new Error(`Mock DELETE URL not found: ${url}`);
  };
} else {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }, (error) => Promise.reject(error));

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refresh = localStorage.getItem('refresh_token');
          const res = await axios.post('http://localhost:8000/api/auth/token/refresh/', { refresh });
          localStorage.setItem('access_token', res.data.access);
          api.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
