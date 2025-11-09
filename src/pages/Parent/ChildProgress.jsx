import React, { useState, useEffect } from 'react';
import Navbar from "../../components/all/Navbar";
import ParentSidebar from "../../components/Parent/ParentSidebar";
import { 
  TextField, 
  InputAdornment, 
  MenuItem, 
  Box, 
  Paper,
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { apiRequest } from "../../utils/api";

// Complete raw score to scaled score conversion tables for all age ranges
const SCORE_TABLES = {
  '3.1-4.0': {
    'Gross Motor': [
      { min: 0, max: 3, score: 1 }, { min: 4, max: 4, score: 2 },
      { min: 5, max: 5, score: 3 }, { min: 6, max: 6, score: 5 },
      { min: 7, max: 7, score: 6 }, { min: 8, max: 8, score: 7 },
      { min: 9, max: 9, score: 8 }, { min: 10, max: 10, score: 10 },
      { min: 11, max: 11, score: 11 }, { min: 12, max: 12, score: 12 },
      { min: 13, max: 13, score: 14 }
    ],
    'Fine Motor': [
      { min: 0, max: 3, score: 2 },
      { min: 4, max: 4, score: 4 }, { min: 5, max: 5, score: 5 },
      { min: 6, max: 6, score: 7 }, { min: 7, max: 7, score: 9 },
      { min: 8, max: 8, score: 10 }, { min: 9, max: 9, score: 12 },
      { min: 10, max: 10, score: 14 }, { min: 11, max: 11, score: 15 }
    ],
    'Self-Help': [
      { min: 0, max: 9, score: 1 }, { min: 10, max: 10, score: 2 },
      { min: 11, max: 11, score: 3 }, { min: 12, max: 12, score: 4 },
      { min: 13, max: 14, score: 5 }, { min: 15, max: 15, score: 6 },
      { min: 16, max: 16, score: 7 }, { min: 17, max: 17, score: 8 },
      { min: 18, max: 19, score: 9 }, { min: 20, max: 20, score: 10 },
      { min: 21, max: 21, score: 11 }, { min: 22, max: 22, score: 12 },
      { min: 23, max: 24, score: 13 }, { min: 25, max: 25, score: 14 },
      { min: 26, max: 26, score: 15 }, { min: 27, max: 27, score: 16 }
    ],
    'Receptive Language': [
      { min: 0, max: 1, score: 3 }, { min: 2, max: 2, score: 5 },
      { min: 3, max: 3, score: 7 }, { min: 4, max: 4, score: 10 },
      { min: 5, max: 5, score: 12 }
    ],
    'Expressive Language': [
      { min: 0, max: 2, score: 1 }, { min: 3, max: 3, score: 3 },
      { min: 4, max: 4, score: 4 }, { min: 5, max: 5, score: 6 },
      { min: 6, max: 6, score: 8 }, { min: 7, max: 7, score: 10 },
      { min: 8, max: 8, score: 12 }
    ],
    'Cognitive': [
      { min: 0, max: 0, score: 3 }, { min: 1, max: 1, score: 4 },
      { min: 2, max: 3, score: 5 }, { min: 4, max: 4, score: 6 },
      { min: 5, max: 5, score: 7 }, { min: 6, max: 6, score: 8 },
      { min: 7, max: 7, score: 9 }, { min: 8, max: 9, score: 10 },
      { min: 10, max: 10, score: 11 }, { min: 11, max: 11, score: 12 },
      { min: 12, max: 12, score: 13 }, { min: 13, max: 14, score: 14 },
      { min: 15, max: 15, score: 15 }, { min: 16, max: 16, score: 16 },
      { min: 17, max: 17, score: 17 }, { min: 18, max: 18, score: 18 },
      { min: 19, max: 21, score: 19 }
    ],
    'Social Emotional': [
      { min: 0, max: 9, score: 1 }, { min: 10, max: 11, score: 2 },
      { min: 12, max: 12, score: 3 }, { min: 13, max: 13, score: 4 },
      { min: 14, max: 14, score: 5 }, { min: 15, max: 15, score: 6 },
      { min: 16, max: 16, score: 7 }, { min: 17, max: 18, score: 8 },
      { min: 19, max: 19, score: 9 }, { min: 20, max: 20, score: 10 },
      { min: 21, max: 21, score: 11 }, { min: 22, max: 22, score: 12 },
      { min: 23, max: 23, score: 13 }, { min: 24, max: 24, score: 14 }
    ]
  },
  '4.1-5.0': {
    'Gross Motor': [
      { min: 0, max: 5, score: 1 }, { min: 6, max: 6, score: 2 },
      { min: 7, max: 7, score: 4 }, { min: 8, max: 8, score: 5 },
      { min: 9, max: 9, score: 7 }, { min: 10, max: 10, score: 8 }, 
      { min: 11, max: 11, score: 10 },{ min: 12, max: 12, score: 11 },
      { min: 13, max: 13, score: 13 }
    ],
    'Fine Motor': [
      { min: 0, max: 3, score: 1 }, { min: 4, max: 4, score: 2 },
      { min: 5, max: 5, score: 4 }, { min: 6, max: 6, score: 5 },
      { min: 7, max: 7, score: 7 }, { min: 8, max: 8, score: 9 },
      { min: 9, max: 9, score: 10 }, { min: 10, max: 10, score: 12 },
      { min: 11, max: 11, score: 14 }
    ],
    'Self-Help': [
      { min: 0, max: 15, score: 1 }, { min: 16, max: 16, score: 2 },
      { min: 17, max: 17, score: 3 }, { min: 18, max: 18, score: 4 },
      { min: 19, max: 19, score: 5 }, { min: 20, max: 20, score: 6 },
      { min: 21, max: 21, score: 8 },
      { min: 22, max: 22, score: 9 }, { min: 23, max: 23, score: 10 },
      { min: 24, max: 24, score: 11 }, { min: 25, max: 25, score: 12 },
      { min: 26, max: 26, score: 13 }, { min: 27, max: 27, score: 14 }
    ],
    'Receptive Language': [
      { min: 0, max: 1, score: 1 }, { min: 2, max: 2, score: 3 },
      { min: 3, max: 3, score: 6 }, { min: 4, max: 4, score: 9 },
      { min: 5, max: 5, score: 11 }
    ],
    'Expressive Language': [
      { min: 0, max: 5, score: 2 }, { min: 6, max: 6, score: 5 },
      { min: 7, max: 7, score: 8 }, { min: 8, max: 8, score: 11 }
    ],
    'Cognitive': [
      { min: 0, max: 0, score: 1 }, { min: 1, max: 1, score: 2 },
      { min: 2, max: 3, score: 3 }, { min: 4, max: 4, score: 4 },
      { min: 5, max: 5, score: 5 }, { min: 6, max: 7, score: 6 },
      { min: 8, max: 8, score: 7 }, { min: 9, max: 10, score: 8 },
      { min: 11, max: 11, score: 9 }, { min: 12, max: 12, score: 10 },
      { min: 13, max: 14, score: 11 }, { min: 15, max: 15, score: 12 },
      { min: 16, max: 17, score: 13 }, { min: 18, max: 18, score: 14 },
      { min: 19, max: 20, score: 15 }, { min: 21, max: 21, score: 16 }
    ],
    'Social Emotional': [
      { min: 0, max: 13, score: 1 }, { min: 14, max: 14, score: 2 },
      { min: 15, max: 15, score: 3 }, { min: 16, max: 16, score: 4 },
      { min: 17, max: 17, score: 5 }, { min: 18, max: 18, score: 7 },
      { min: 19, max: 19, score: 8 }, { min: 20, max: 20, score: 9 },
      { min: 21, max: 21, score: 10 }, { min: 22, max: 22, score: 11 },
      { min: 23, max: 23, score: 12 }, { min: 24, max: 24, score: 13 }
    ]
  },
  '5.1-5.11': {
    'Gross Motor': [
      { min: 0, max: 10, score: 1 }, { min: 11, max: 11, score: 4 }, 
      { min: 12, max: 12, score: 7 }, { min: 13, max: 13, score: 11 }
    ],
    'Fine Motor': [
      { min: 0, max: 5, score: 1 }, { min: 6, max: 6, score: 3 },
      { min: 7, max: 7, score: 5 }, { min: 8, max: 8, score: 7 },
      { min: 8, max: 8, score: 9 }, { min: 10, max: 10, score: 10 },
      { min: 11, max: 11, score: 12 }
    ],
    'Self-Help': [
      { min: 0, max: 19, score: 2 },
      { min: 20, max: 20, score: 3 }, { min: 21, max: 21, score: 4 },
      { min: 22, max: 22, score: 6 }, { min: 23, max: 23, score: 7 },
      { min: 24, max: 24, score: 9 }, { min: 25, max: 25, score: 10 },
      { min: 26, max: 26, score: 12 }, { min: 27, max: 27, score: 13 }
    ],
    'Receptive Language': [
      { min: 0, max: 2, score: 1 }, { min: 3, max: 3, score: 4 },
      { min: 4, max: 4, score: 8 }, { min: 5, max: 5, score: 11 }
    ],
    'Expressive Language': [
      { min: 0, max: 7, score: 5 }, { min: 8, max: 8, score: 11 }
    ],
    'Cognitive': [
      { min: 0, max: 0, score: 1 }, { min: 10, max: 10, score: 2 },
      { min: 11, max: 11, score: 3 }, { min: 12, max: 12, score: 4 },
      { min: 13, max: 13, score: 5 }, { min: 14, max: 14, score: 6 },
      { min: 15, max: 15, score: 7 }, { min: 16, max: 16, score: 8 },
      { min: 17, max: 17, score: 9 }, { min: 18, max: 18, score: 10 },
      { min: 19, max: 19, score: 11 }, { min: 20, max: 20, score: 12 },
      { min: 21, max: 21, score: 13 }
    ],
    'Social Emotional': [
      { min: 0, max: 15, score: 1 }, { min: 16, max: 16, score: 2 },
      { min: 17, max: 17, score: 3 }, 
      { min: 18, max: 18, score: 5 }, { min: 19, max: 19, score: 6 },
      { min: 20, max: 20, score: 7 }, { min: 21, max: 21, score: 9 },
      { min: 22, max: 22, score: 10 }, { min: 23, max: 23, score: 11 },
      { min: 24, max: 24, score: 13 }
    ]
  }
};

const STANDARD_SCORE_TABLE = [
  { sum: 29, score: 37 }, { sum: 30, score: 38 }, { sum: 31, score: 40 },
  { sum: 32, score: 41 }, { sum: 33, score: 43 }, { sum: 34, score: 44 },
  { sum: 35, score: 45 }, { sum: 36, score: 47 }, { sum: 37, score: 48 },
  { sum: 38, score: 50 }, { sum: 39, score: 51 }, { sum: 40, score: 53 },
  { sum: 41, score: 54 }, { sum: 42, score: 56 }, { sum: 43, score: 57 },
  { sum: 44, score: 59 }, { sum: 45, score: 60 }, { sum: 46, score: 62 },
  { sum: 47, score: 63 }, { sum: 48, score: 65 }, { sum: 49, score: 66 },
  { sum: 50, score: 67 }, { sum: 51, score: 69 }, { sum: 52, score: 70 },
  { sum: 53, score: 72 }, { sum: 54, score: 73 }, { sum: 55, score: 75 },
  { sum: 56, score: 76 }, { sum: 57, score: 78 }, { sum: 58, score: 79 },
  { sum: 59, score: 81 }, { sum: 60, score: 82 }, { sum: 61, score: 84 },
  { sum: 62, score: 85 }, { sum: 63, score: 86 }, { sum: 64, score: 88 },
  { sum: 65, score: 89 }, { sum: 66, score: 91 }, { sum: 67, score: 92 },
  { sum: 68, score: 94 }, { sum: 69, score: 95 }, { sum: 70, score: 97 },
  { sum: 71, score: 98 }, { sum: 72, score: 100 }, { sum: 73, score: 101 },
  { sum: 74, score: 103 }, { sum: 75, score: 104 }, { sum: 76, score: 105 },
  { sum: 77, score: 107 }, { sum: 78, score: 108 }, { sum: 79, score: 110 },
  { sum: 80, score: 111 }, { sum: 81, score: 113 }, { sum: 82, score: 114 },
  { sum: 83, score: 116 }, { sum: 84, score: 117 }, { sum: 85, score: 119 },
  { sum: 86, score: 120 }, { sum: 87, score: 122 }, { sum: 88, score: 123 },
  { sum: 89, score: 124 }, { sum: 90, score: 126 }, { sum: 91, score: 127 },
  { sum: 92, score: 129 }, { sum: 93, score: 130 }, { sum: 94, score: 132 },
  { sum: 95, score: 133 }, { sum: 96, score: 135 }, { sum: 97, score: 136 },
  { sum: 98, score: 138 }
];

const TableComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [childOptions, setChildOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [domains, setDomains] = useState([]);
  const [domainScores, setDomainScores] = useState({});
  const [evaluationDates, setEvaluationDates] = useState({
    first: null,
    second: null,
    third: null
  });

  // Age range calculation
  const getAgeRange = (years, months) => {
    if (years === 'N/A' || months === 'N/A') return null;
    const ageDecimal = years + (months / 12);
    if (ageDecimal >= 3.1 && ageDecimal <= 4.0) return '3.1-4.0';
    if (ageDecimal >= 4.1 && ageDecimal <= 5.0) return '4.1-5.0';
    if (ageDecimal >= 5.1 && ageDecimal <= 5.11) return '5.1-5.11';
    return null;
  };

  // Normalize domain names
  const normalizeDomainName = (domain) => {
    const baseName = domain.split('/')[0].trim();
    if (baseName.includes('Social')) return 'Social Emotional';
    if (baseName.includes('Self-Help')) return 'Self-Help';
    return baseName;
  };

  // Score calculation functions
  const getScaledScore = (domain, rawScore, ageRange) => {
    if (!ageRange || !SCORE_TABLES[ageRange]) return '-';
    const normalizedDomain = normalizeDomainName(domain);
    if (!SCORE_TABLES[ageRange][normalizedDomain]) return '-';
    if (rawScore === '-' || rawScore === undefined || rawScore === null) return '-';
    
    const entry = SCORE_TABLES[ageRange][normalizedDomain].find(
      item => rawScore >= item.min && rawScore <= item.max
    );
    return entry ? entry.score : '-';
  };

  const calculateTotalScaledScore = (period) => {
    let total = 0;
    domains.forEach(domainCategory => {
      const scores = domainScores[domainCategory.category] || {
        first: { yes: 0 },
        second: { yes: 0 },
        third: { yes: 0 }
      };
      const age = calculateAgeAtEvaluation(selectedChild?.birthdate, evaluationDates[period]);
      const ageRange = getAgeRange(age.years, age.months);
      const rawScore = scores[period]?.yes || 0;
      
      if (rawScore > 0) {
        const scaledScore = getScaledScore(domainCategory.category, rawScore, ageRange);
        if (scaledScore !== '-') total += parseInt(scaledScore);
      }
    });
    return total > 0 ? total : '-';
  };

  const calculateStandardScore = (period) => {
    const sumOfScaledScores = calculateTotalScaledScore(period);
    if (sumOfScaledScores === '-') return '-';
    
    const entry = STANDARD_SCORE_TABLE.find(item => sumOfScaledScores <= item.sum);
    if (!entry) {
      if (sumOfScaledScores < 29) return 37;
      if (sumOfScaledScores > 98) return 138;
      return '-';
    }
    return entry.score;
  };

  const getInterpretation = (standardScore) => {
    if (standardScore === '-') return '-';
    if (standardScore < 70) return 'Below Average';
    if (standardScore < 90) return 'Low Average';
    if (standardScore < 110) return 'Average';
    if (standardScore < 130) return 'High Average';
    return 'Above Average';
  };

//Fetching of data
  useEffect(() => {
    const fetchChildData = async () => {
      console.log("Attempting to fetch child data...");
      try {
        setLoading(true);
        setError(null);

        // 1. Get the student_id for the logged-in parent
        const idResponse = await apiRequest('/api/parent/student');
        console.log("Parent's child ID Response:", idResponse);

        if (idResponse && idResponse.student_id) {
          const targetStudentId = idResponse.student_id;

          // 2. Fetch the list of all students
          const allStudentsResponse = await apiRequest('/api/dom/att');
          console.log("All Students Response:", allStudentsResponse);

          if (allStudentsResponse && allStudentsResponse.students) {
            // 3. Find the specific student in the list
            const foundStudent = allStudentsResponse.students.find(
              (student) => student.student_id === targetStudentId
            );

            if (foundStudent) {
              console.log("Found matching student:", foundStudent);
              const childData = {
                id: foundStudent.student_id,
                name: `${foundStudent.first_name || ''} ${foundStudent.last_name || ''}`.trim(),
                birthdate: foundStudent.birthdate,
                gender: (foundStudent.gender || '').toLowerCase(),
                age: calculateAgeWithMonths(foundStudent.birthdate),
              };
              setSelectedChild(childData);
            } else {
              setError('Your child was not found in the list.');
              console.error('Child with ID', targetStudentId, 'not found in the list from /api/dom/att');
            }
          } else {
            setError('Failed to fetch the list of all students.');
            console.error('Failed to fetch student list from /api/dom/att');
          }
        } else {
          setError('Failed to get your child\'s ID from the server.');
          console.error('Failed to get child ID from /api/parent/student');
        }
      } catch (err) {
        console.error('An error occurred while fetching child data:', err);
        setError('An error occurred while fetching data. Please check the console.');
      } finally {
        setLoading(false);
        console.log("Finished fetching child data process.");
      }
    };

    fetchChildData();
  }, []);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/domains/structure');
        if (data.success) {
          const normalizedData = {};
          Object.keys(data.data).forEach(category => {
            const normalizedCategory = normalizeDomainName(category);
            if (!normalizedData[normalizedCategory]) {
              normalizedData[normalizedCategory] = [];
            }
            normalizedData[normalizedCategory].push(...data.data[category]);
          });
          setDomains(
            Object.keys(normalizedData).map(category => ({
              category,
              items: normalizedData[category]
            }))
          );
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch domain structure');
      } finally {
        setLoading(false);
      }
    };
    fetchDomains();
  }, []);

  useEffect(() => {
    if (!selectedChild?.id) return;

    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        
        // Fetch scores
        const scoresData = await apiRequest(`/api/domains/evaluations/scores/${selectedChild.id}`);
        if (scoresData.success) {
          const normalizedScores = {};
          Object.keys(scoresData.data).forEach(category => {
            const normalizedCategory = normalizeDomainName(category);
            if (!normalizedScores[normalizedCategory]) {
              normalizedScores[normalizedCategory] = {
                first: { yes: 0 },
                second: { yes: 0 },
                third: { yes: 0 }
              };
            }
            ['first', 'second', 'third'].forEach(period => {
              normalizedScores[normalizedCategory][period].yes += 
                scoresData.data[category][period]?.yes || 0;
            });
          });
          setDomainScores(normalizedScores);
        }

        // Fetch dates
        const datesData = await apiRequest(`/api/domains/evaluations/dates/${selectedChild.id}`);
        if (datesData.success) {
          setEvaluationDates({
            first: datesData.data.firstEvaluation?.evaluation_date || null,
            second: datesData.data.secondEvaluation?.evaluation_date || null,
            third: datesData.data.thirdEvaluation?.evaluation_date || null
          });
        }
      } catch (err) {
        console.error('Error fetching evaluation data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluationData();
  }, [selectedChild]);

  // Helper functions
  const calculateAgeWithMonths = (birthdate) => {
    if (!birthdate) return { years: 'N/A', months: 'N/A' };
    try {
      const birthDate = new Date(birthdate);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      if (today.getDate() < birthDate.getDate()) {
        months--;
        if (months < 0) months += 12;
      }
      return { years, months };
    } catch (e) {
      return { years: 'N/A', months: 'N/A' };
    }
  };

  const calculateAgeAtEvaluation = (birthdate, evaluationDate) => {
    if (!birthdate || !evaluationDate) return { years: 'N/A', months: 'N/A' };
    try {
      const birthDate = new Date(birthdate);
      const evalDate = new Date(evaluationDate);
      let years = evalDate.getFullYear() - birthDate.getFullYear();
      let months = evalDate.getMonth() - birthDate.getMonth();
      
      if (months < 0 || (months === 0 && evalDate.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      if (evalDate.getDate() < birthDate.getDate()) {
        months--;
        if (months < 0) months += 12;
      }
      return { years, months };
    } catch (e) {
      return { years: 'N/A', months: 'N/A' };
    }
  };

  const formatAgeDisplay = (age) => {
    if (!age || age.years === 'N/A') return 'N/A';
    return `${age.years} taon, ${age.months} buwan`;
  };

  const formatEvaluationDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString)
        .toLocaleDateString('en-PH', { day: 'numeric', month: 'numeric', year: 'numeric' })
        .replace(/\//g, ' - ');
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="flex h-screen">
      <ParentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-4 ml-64 mt-16">
          <div className="max-w-6xl mx-auto">
            {/* Search Section */}
            <Box component={Paper} elevation={3} sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Child's Name"
                value={selectedChild ? selectedChild.name : ''}
                InputProps={{ readOnly: true }}
                sx={{ minWidth: 250 }}
              />

              <TextField
                label="Current Age"
                value={selectedChild ? formatAgeDisplay(selectedChild.age) : ''}
                InputProps={{ readOnly: true }}
                sx={{ minWidth: 150 }}
              />

              <TextField
                label="ID"
                value={selectedChild?.id || ''}
                InputProps={{ readOnly: true }}
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Gender"
                value={selectedChild?.gender ? selectedChild.gender.charAt(0).toUpperCase() + selectedChild.gender.slice(1) : ''}
                InputProps={{ readOnly: true }}
                sx={{ minWidth: 120 }}
              />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {loading && !selectedChild && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}

            {selectedChild && (
              <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr>
                    <th colSpan="7" className="border-b p-2 bg-gray-100 font-bold text-center">
                      EDAD
                    </th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th rowSpan="2" className="border p-2">DOMEYN</th>
                    <th colSpan="2" className="border p-2 text-center">
                      <div className="font-semibold">Unang Petsa ng Ebalwasyon</div>
                      <div>{formatEvaluationDate(evaluationDates.first)}</div>
                      <div className="text-sm">Edad ng Bata: {formatAgeDisplay(calculateAgeAtEvaluation(selectedChild?.birthdate, evaluationDates.first))}</div>
                    </th>
                    <th colSpan="2" className="border p-2 text-center">
                      <div className="font-semibold">Ikalawang Petsa ng Ebalwasyon</div>
                      <div>{formatEvaluationDate(evaluationDates.second)}</div>
                      <div className="text-sm">Edad ng Bata: {formatAgeDisplay(calculateAgeAtEvaluation(selectedChild?.birthdate, evaluationDates.second))}</div>
                    </th>
                    <th colSpan="2" className="border p-2 text-center">
                      <div className="font-semibold">Ikatlong Petsa ng Ebalwasyon</div>
                      <div>{formatEvaluationDate(evaluationDates.third)}</div>
                      <div className="text-sm">Edad ng Bata: {formatAgeDisplay(calculateAgeAtEvaluation(selectedChild?.birthdate, evaluationDates.third))}</div>
                    </th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Raw Score</th>
                    <th className="border p-2">Scaled Score</th>
                    <th className="border p-2">Raw Score</th>
                    <th className="border p-2">Scaled Score</th>
                    <th className="border p-2">Raw Score</th>
                    <th className="border p-2">Scaled Score</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((domainCategory, index) => {
                    const scores = domainScores[domainCategory.category] || {
                      first: { yes: 0 },
                      second: { yes: 0 },
                      third: { yes: 0 }
                    };

                    const ageFirst = calculateAgeAtEvaluation(selectedChild?.birthdate, evaluationDates.first);
                    const ageRangeFirst = getAgeRange(ageFirst.years, ageFirst.months);
                    const ageSecond = calculateAgeAtEvaluation(selectedChild?.birthdate, evaluationDates.second);
                    const ageRangeSecond = getAgeRange(ageSecond.years, ageSecond.months);
                    const ageThird = calculateAgeAtEvaluation(selectedChild?.birthdate, evaluationDates.third);
                    const ageRangeThird = getAgeRange(ageThird.years, ageThird.months);

                    const scaledFirst = scores.first.yes > 0 ? 
                      getScaledScore(domainCategory.category, scores.first.yes, ageRangeFirst) : '-';
                    const scaledSecond = scores.second.yes > 0 ? 
                      getScaledScore(domainCategory.category, scores.second.yes, ageRangeSecond) : '-';
                    const scaledThird = scores.third.yes > 0 ? 
                      getScaledScore(domainCategory.category, scores.third.yes, ageRangeThird) : '-';

                    return (
                      <tr key={domainCategory.category} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="border p-2">{domainCategory.category}</td>
                        <td className="border p-2 text-center">
                          {scores.first.yes > 0 ? scores.first.yes : '-'}
                        </td>
                        <td className="border p-2 text-center">{scaledFirst}</td>
                        <td className="border p-2 text-center">
                          {scores.second.yes > 0 ? scores.second.yes : '-'}
                        </td>
                        <td className="border p-2 text-center">{scaledSecond}</td>
                        <td className="border p-2 text-center">
                          {scores.third.yes > 0 ? scores.third.yes : '-'}
                        </td>
                        <td className="border p-2 text-center">{scaledThird}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2">Kabuoan ng Scaled Score</td>
                    <td colSpan="2" className="border p-2 text-center">
                      {calculateTotalScaledScore('first')}
                    </td>
                    <td colSpan="2" className="border p-2 text-center">
                      {calculateTotalScaledScore('second')}
                    </td>
                    <td colSpan="2" className="border p-2 text-center">
                      {calculateTotalScaledScore('third')}
                    </td>
                  </tr>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2">Standard Score</td>
                    <td colSpan="2" className="border p-2 text-center">
                      {calculateStandardScore('first')}
                    </td>
                    <td colSpan="2" className="border p-2 text-center">
                      {calculateStandardScore('second')}
                    </td>
                    <td colSpan="2" className="border p-2 text-center">
                      {calculateStandardScore('third')}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-2">Interpretasyon</td>
                    <td colSpan="2" className="border p-2 text-center">
                      {getInterpretation(calculateStandardScore('first'))}
                    </td>
                    <td colSpan="2" className="border p-2 text-center">
                      {getInterpretation(calculateStandardScore('second'))}
                    </td>
                    <td colSpan="2" className="border p-2 text-center">
                      {getInterpretation(calculateStandardScore('third'))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
