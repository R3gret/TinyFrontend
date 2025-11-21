// Domain structure for Instructional Materials
export const DOMAINS = [
  {
    id: 'cognitive',
    name: 'Cognitive / Pangkaisipan',
    path: 'Cognitive_Pangkaisipan'
  },
  {
    id: 'expressive_language',
    name: 'Expressive Language / Pang-wika',
    path: 'Expressive_Language_Pang-wika'
  },
  {
    id: 'fine_motor',
    name: 'Fine Motor / Pangkamay',
    path: 'Fine_Motor_Pangkamay'
  },
  {
    id: 'gross_motor',
    name: 'Gross Motor / Panlahat na Kakayahan',
    path: 'Gross_Motor_Panlahat_na_Kakayahan'
  },
  {
    id: 'receptive_language',
    name: 'Receptive Language / Pang-unawa',
    path: 'Receptive_Language_Pang-unawa'
  },
  {
    id: 'self_help',
    name: 'Self-Help / Pansarili',
    subcategories: [
      { id: 'self_help_clothing', name: 'Self-Help / Pansarili - Pagdadamit', path: 'Self-Help_Pansarili_Pagdadamit' },
      { id: 'self_help_eating', name: 'Self-Help / Pansarili - Pagkain', path: 'Self-Help_Pansarili_Pagkain' },
      { id: 'self_help_bathing', name: 'Self-Help / Pansarili - Pagligo', path: 'Self-Help_Pansarili_Pagligo' },
      { id: 'self_help_toileting', name: 'Self-Help / Pansarili - Toileting', path: 'Self-Help_Pansarili_Toileting' }
    ]
  },
  {
    id: 'social_emotional',
    name: 'Social-Emotional / Panlipunan',
    path: 'Social-Emotional_Panlipunan'
  }
];

export const QUARTERS = [
  { id: 'q1', name: '1st Quarter', path: '1st_Quarter' },
  { id: 'q2', name: '2nd Quarter', path: '2nd_Quarter' },
  { id: 'q3', name: '3rd Quarter', path: '3rd_Quarter' },
  { id: 'q4', name: '4th Quarter', path: '4th_Quarter' }
];

export const MATERIAL_TYPES = [
  { id: 'english', name: 'English', path: 'English' },
  { id: 'filipino', name: 'Filipino', path: 'Filipino' },
  { id: 'supplemental', name: 'Supplemental Materials', path: 'Supplemental_Materials' }
];

// Generate full path for a file location
export function generateFilePath(domainId, quarterId, materialTypeId) {
  let domainPath = null;
  
  // Check if it's a self-help subcategory
  const selfHelpDomain = DOMAINS.find(d => d.id === 'self_help');
  if (selfHelpDomain && selfHelpDomain.subcategories) {
    const subcategory = selfHelpDomain.subcategories.find(s => s.id === domainId);
    if (subcategory) {
      domainPath = subcategory.path;
    }
  }
  
  // If not found in subcategories, check regular domains
  if (!domainPath) {
    const domain = DOMAINS.find(d => d.id === domainId);
    if (domain && domain.path) {
      domainPath = domain.path;
    }
  }
  
  if (!domainPath) return null;

  const quarter = QUARTERS.find(q => q.id === quarterId);
  if (!quarter) return null;

  const materialType = MATERIAL_TYPES.find(m => m.id === materialTypeId);
  if (!materialType) return null;

  return `${domainPath}/${quarter.path}/${materialType.path}`;
}

// Generate category name for display
export function generateCategoryName(domainId, quarterId, materialTypeId) {
  let domainName = null;
  
  // Check if it's a self-help subcategory
  const selfHelpDomain = DOMAINS.find(d => d.id === 'self_help');
  if (selfHelpDomain && selfHelpDomain.subcategories) {
    const subcategory = selfHelpDomain.subcategories.find(s => s.id === domainId);
    if (subcategory) {
      domainName = subcategory.name;
    }
  }
  
  // If not found in subcategories, check regular domains
  if (!domainName) {
    const domain = DOMAINS.find(d => d.id === domainId);
    if (domain) {
      domainName = domain.name;
    }
  }
  
  if (!domainName) return null;

  const quarter = QUARTERS.find(q => q.id === quarterId);
  if (!quarter) return null;

  const materialType = MATERIAL_TYPES.find(m => m.id === materialTypeId);
  if (!materialType) return null;

  return `${domainName} > ${quarter.name} > ${materialType.name}`;
}

// Get all category paths that should exist
export function getAllCategoryPaths() {
  const paths = [];
  
  DOMAINS.forEach(domain => {
    if (domain.id === 'self_help' && domain.subcategories) {
      // Handle self-help subcategories
      domain.subcategories.forEach(subcategory => {
        QUARTERS.forEach(quarter => {
          MATERIAL_TYPES.forEach(materialType => {
            paths.push({
              domainId: subcategory.id,
              domainName: subcategory.name,
              quarterId: quarter.id,
              quarterName: quarter.name,
              materialTypeId: materialType.id,
              materialTypeName: materialType.name,
              path: `${subcategory.path}/${quarter.path}/${materialType.path}`,
              categoryName: `${subcategory.name} > ${quarter.name} > ${materialType.name}`
            });
          });
        });
      });
    } else {
      // Regular domains
      QUARTERS.forEach(quarter => {
        MATERIAL_TYPES.forEach(materialType => {
          paths.push({
            domainId: domain.id,
            domainName: domain.name,
            quarterId: quarter.id,
            quarterName: quarter.name,
            materialTypeId: materialType.id,
            materialTypeName: materialType.name,
            path: `${domain.path}/${quarter.path}/${materialType.path}`,
            categoryName: `${domain.name} > ${quarter.name} > ${materialType.name}`
          });
        });
      });
    }
  });
  
  return paths;
}

