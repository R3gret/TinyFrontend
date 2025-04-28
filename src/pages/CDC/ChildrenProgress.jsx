  import Navbar from "../../components/all/Navbar";
  import Sidebar from "../../components/CDC/Sidebar";
  import { useState, useEffect } from "react";
  import bgImage from "../../assets/bg1.jpg";
  import { useNavigate } from 'react-router-dom';
  import { Button } from "@mui/material";
  import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Paper, 
    TableContainer, 
    Box,
    TextField,
    Autocomplete,
    Snackbar,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox
  } from "@mui/material";

  export default function AssessmentTable() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedChild, setSelectedChild] = useState(null);
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [childOptions, setChildOptions] = useState([]);
    const [filteredChildren, setFilteredChildren] = useState([]);
    const [domains, setDomains] = useState([]);
    const [evaluationPeriod, setEvaluationPeriod] = useState("1st");
    const [evaluationData, setEvaluationData] = useState({});
    const [generalNotes, setGeneralNotes] = useState("");
    const [evaluatorId, setEvaluatorId] = useState(1);
    const [existingEvaluation, setExistingEvaluation] = useState(false);
    const [checkingEvaluation, setCheckingEvaluation] = useState(false);
    

    // Fetch initial student and domain data
    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          setLoading(true);
          
          const [studentsResponse, domainsResponse] = await Promise.all([
            fetch('http://localhost:3001/api/students'),
            fetch('http://localhost:3001/api/domains')
          ]);

          if (!studentsResponse.ok) throw new Error('Failed to fetch students');
          if (!domainsResponse.ok) throw new Error('Failed to fetch domains');

          const studentsData = await studentsResponse.json();
          const domainsData = await domainsResponse.json();
          
          const formattedStudents = studentsData.students.map(student => ({
            id: student.student_id,
            name: `${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`,
            age: calculateAge(student.birthdate),
            gender: student.gender,
            profilePic: student.profile_pic
          }));
          
          setChildOptions(formattedStudents);
          setFilteredChildren(formattedStudents);
          setDomains(domainsData.data);
          
        } catch (err) {
          console.error('Error fetching data:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();
    }, []);

    // Check for existing evaluation when student or period changes
    useEffect(() => {
      const checkExistingEvaluation = async () => {
        if (!selectedChild || !evaluationPeriod) {
          setExistingEvaluation(false);
          return;
        }
        
        try {
          setCheckingEvaluation(true);
      
          const response = await fetch(
            `/api/domains/evaluations/check?student_id=${selectedChild.id}&period=${evaluationPeriod}`
          );
      
          if (!response.ok) throw new Error('Failed to check evaluation');
      
          const data = await response.json();
      
          if (data.success) {
            setExistingEvaluation(data.exists);
      
            if (data.exists) {
              // You can even use data.data if you need the evaluation_id, for example
              // console.log('Existing evaluation ID:', data.data?.evaluation_id);
              await fetchEvaluationData();
            }
          } else {
            console.error('Evaluation check failed:', data.message);
            setError(data.message || 'Unknown error occurred');
            setExistingEvaluation(false);
          }
      
        } catch (error) {
          console.error('Evaluation check error:', error);
          setError(error.message);
          setExistingEvaluation(false);
        } finally {
          setCheckingEvaluation(false);
        }
      };
      
      checkExistingEvaluation();
      
    }, [selectedChild, evaluationPeriod]);
    
    // Fetch evaluation data if it exists
    const fetchEvaluationData = async () => {
      if (!selectedChild || !evaluationPeriod) return;
      
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/domains?student_id=${selectedChild.id}&period=${evaluationPeriod}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch evaluation data');
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const evalData = {};
          
          Object.values(data.data).forEach(category => {
            category.forEach(item => {
              if (item.evaluation) {
                evalData[item.id] = {
                  value: item.evaluation.value,
                  notes: item.evaluation.notes
                };
              }
            });
          });
          
          setEvaluationData(evalData);
          
          if (data.data.meta && data.data.meta.general_notes) {
            setGeneralNotes(data.data.meta.general_notes);
          }
        }
      } catch (err) {
        console.error('Error fetching evaluation data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to calculate age from birthdate
    function calculateAge(birthdate) {
      const birthDate = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }

    // Filter students based on search term
    useEffect(() => {
      if (searchTerm === "") {
        setFilteredChildren(childOptions);
      } else {
        const filtered = childOptions.filter(child =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredChildren(filtered);
      }
    }, [searchTerm, childOptions]);

    // Handle child selection
    const handleChildSelect = (event, value) => {
      setSelectedChild(value);
      if (value) {
        setGender(value.gender);
        setAge(value.age);
      } else {
        setGender("");
        setAge("");
        setEvaluationData({});
      }
    };

    // Handle evaluation checkbox changes
    const handleEvaluationChange = (domainId, value) => {
      setEvaluationData(prev => {
        // If value is false and no notes exist, remove the entry entirely
        if (value === 0 && (!prev[domainId] || !prev[domainId].notes)) {
          const newData = {...prev};
          delete newData[domainId];
          return newData;
        }
        
        return {
          ...prev,
          [domainId]: {
            ...prev[domainId],
            value: value
          }
        };
      });
    };

    // Handle notes changes
    const handleNotesChange = (domainId, notes) => {
      setEvaluationData(prev => ({
        ...prev,
        [domainId]: {
          ...prev[domainId],
          notes: notes
        }
      }));
    };

    // Save evaluation
    const handleSaveEvaluation = async () => {
      if (!selectedChild) {
        setError("Please select a child first");
        return;
      }
    
      try {
        setLoading(true);
        
        // Prepare evaluation items - properly handle the domains object structure
        const items = Object.values(domains)
          .flat() // Flatten the array of domain items
          .filter(item => evaluationData[item.id]?.value !== undefined)
          .map(item => ({
            domain_id: parseInt(item.id),
            evaluation_value: evaluationData[item.id].value ? 1 : 0,
            notes: evaluationData[item.id].notes || ""
          }));
    
        // Debug log to verify items being sent
        console.log('Items to be saved:', items);
    
        const evaluationDataToSend = {
          student_id: selectedChild.id,
          evaluation_period: evaluationPeriod,
          evaluator_id: evaluatorId,
          notes: generalNotes,
          items: items
        };
    
        const response = await fetch('http://localhost:3001/api/domains/evaluations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(evaluationDataToSend)
        });
    
        const result = await response.json();
    
        if (!response.ok) {
          if (result.message && result.message.includes('already exists')) {
            setError(result.message);
            setExistingEvaluation(true);
          } else {
            throw new Error(result.message || 'Failed to save evaluation');
          }
          return;
        }
    
        setSuccess(`Evaluation for ${evaluationPeriod} period saved successfully!`);
        setExistingEvaluation(true);
        fetchEvaluationData();
        
      } catch (err) {
        console.error('Error saving evaluation:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Render assessment table
    const createAssessmentTable = () => {
      if (loading && !selectedChild) return <div className="text-center py-8 text-gray-500">Loading data...</div>;

      return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
            {/* Search and Info Section */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Autocomplete
                sx={{ minWidth: 300 }}
                options={filteredChildren}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Search Child" 
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                )}
                value={selectedChild}
                onChange={handleChildSelect}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No children found"
                loading={loading}
              />

              <TextField
                label="Gender"
                value={gender}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{ minWidth: 150 }}
              />

              <TextField
                label="Age"
                value={age}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{ minWidth: 100 }}
              />

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={evaluationPeriod}
                  label="Period"
                  onChange={(e) => setEvaluationPeriod(e.target.value)}
                >
                  <MenuItem value="1st">1st</MenuItem>
                  <MenuItem value="2nd">2nd</MenuItem>
                  <MenuItem value="3rd">3rd</MenuItem>
                </Select>
              </FormControl>

              {console.log('Button state:', {
  selectedChild: !!selectedChild,
  loading,
  checkingEvaluation,
  existingEvaluation,
  disabled: !selectedChild || loading || checkingEvaluation || (existingEvaluation ?? false)
})}


<Button 
  variant="contained" 
  color={existingEvaluation ? "secondary" : "success"}
  onClick={handleSaveEvaluation}
  disabled={!selectedChild || loading || checkingEvaluation || existingEvaluation}
  sx={{ minWidth: 150 }}
>
  {loading ? "Saving..." : 
   checkingEvaluation ? "Checking..." : 
   existingEvaluation ? "Evaluation Exists" : "Save Evaluation"}
</Button>
            </Box>

            {/* General Notes */}
            <Box sx={{ mb: 3 }}>
  <TextField
    label="General Notes"
    multiline
    rows={2}  // Keep this as is or reduce to 1 if you want fewer lines
    fullWidth
    value={generalNotes}
    onChange={(e) => setGeneralNotes(e.target.value)}
    variant="outlined"
    sx={{
      '& .MuiOutlinedInput-root': {
        padding: '8px',  // Reduce internal padding
      },
      '& .MuiInputLabel-outlined': {
        transform: 'translate(14px, 14px) scale(1)',  // Adjust label position
      },
      '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
        transform: 'translate(14px, -6px) scale(0.75)',  // Adjust shrunk label position
      },
    }}
    InputProps={{
      style: {
        fontSize: '0.875rem',  // Slightly smaller font
        minHeight: '60px',  // Set a minimum height
      }
    }}
  />
</Box>

            {/* Assessment Table */}
            <TableContainer sx={{ maxHeight: '800px', position: 'relative' }}>
              <Table stickyHeader aria-label="assessment table" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                  <TableCell 
  rowSpan={2} 
  sx={{ 
    width: '40%',
    position: 'sticky',
    left: 0,
    zIndex: 12,
    backgroundColor: '#4caf50',
    color: 'white',
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    fontWeight: 'bold',
    fontSize: '1rem',
    height: '20px', // Add fixed height
    padding: '8px 16px' // Adjust padding to make it more compact
  }}
>
  Domain / Skills
</TableCell>
<TableCell 
  colSpan={3}
  align="center"
  sx={{
    position: 'sticky',
    top: 0,
    zIndex: 11,
    backgroundColor: '#4caf50',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    height: '20px', // Add fixed height
    padding: '8px 16px' // Adjust padding
  }}
>
  Present
</TableCell>
<TableCell 
  rowSpan={2}
  sx={{ 
    width: '30%',
    position: 'sticky',
    right: 0,
    zIndex: 12,
    backgroundColor: '#4caf50',
    color: 'white',
    borderLeft: '1px solid rgba(224, 224, 224, 1)',
    fontWeight: 'bold',
    fontSize: '1rem',
    height: '20px', // Add fixed height
    padding: '8px 16px' // Adjust padding
  }}
>
  Mga Komento
</TableCell>
                  </TableRow>
                  
                  <TableRow sx={{ 
  position: 'sticky', 
  top: 40, // Adjust this to match the first row's height
  zIndex: 11, 
  backgroundColor: '#4caf50',
  height: '20px' // Add fixed height
}}>
  <TableCell 
    align="center"
    sx={{
      position: 'sticky',
      top: 40, // Adjust this to match the first row's height
      zIndex: 11,
      backgroundColor: '#4caf50',
      color: 'white',
      fontWeight: 'bold',
      height: '20px', // Add fixed height
      padding: '8px 16px' // Adjust padding
    }}
  >
    1st
  </TableCell>
  <TableCell 
    align="center"
    sx={{
      position: 'sticky',
      top: 40, // Adjust this to match the first row's height
      zIndex: 11,
      backgroundColor: '#4caf50',
      color: 'white',
      fontWeight: 'bold',
      height: '20px', // Add fixed height
      padding: '8px 16px' // Adjust padding
    }}
  >
    2nd
  </TableCell>
  <TableCell 
    align="center"
    sx={{
      position: 'sticky',
      top: 40, // Adjust this to match the first row's height
      zIndex: 11,
      backgroundColor: '#4caf50',
      color: 'white',
      fontWeight: 'bold',
      height: '20px', // Add fixed height
      padding: '8px 16px' // Adjust padding
    }}
  >
    3rd
  </TableCell>
</TableRow>
                </TableHead>

                <TableBody>
                  {Object.entries(domains).map(([category, items]) => (
                    <>
                      <TableRow key={category}>
  <TableCell 
    colSpan={5} 
    sx={{ 
      fontWeight: 'bold',
      backgroundColor: '#81c784',
      position: 'sticky',
      left: 0,
      zIndex: 10,
      color: 'white',
      fontSize: '1rem',
      height: '36px', // Add fixed height
      padding: '8px 16px' // Adjust padding
    }}
  >
    {category}
  </TableCell>
</TableRow>
                      
                      {items.map((item) => (
                        <TableRow
                          key={item.id}
                          sx={{
                            "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                            "&:hover": { backgroundColor: "#e0f7fa" },
                          }}
                        >
                          <TableCell 
                            sx={{ 
                              paddingLeft: '40px',
                              position: 'sticky',
                              left: 0,
                              zIndex: 9,
                              backgroundColor: '#f9f9f9',
                              borderRight: '1px solid rgba(224, 224, 224, 1)'
                            }}
                          >
                            {item.skill}
                          </TableCell>
                          {['1st', '2nd', '3rd'].map((period) => (
                            <TableCell 
                              key={period} 
                              align="center"
                              sx={{ 
                                backgroundColor: evaluationPeriod === period ? '#e8f5e9' : 'inherit'
                              }}
                            >
                              {evaluationPeriod === period && (
                                <Checkbox
                                  checked={evaluationData[item.id]?.value === 1}
                                  onChange={(e) => handleEvaluationChange(
                                    item.id, 
                                    e.target.checked ? 1 : 0
                                  )}
                                  sx={{
                                    padding: '8px',
                                    '& .MuiSvgIcon-root': {
                                      fontSize: '1.5rem'
                                    }
                                  }}
                                  disabled={existingEvaluation}
                                />
                              )}
                            </TableCell>
                          ))}
                          <TableCell
                            sx={{
                              position: 'sticky',
                              right: 0,
                              zIndex: 9,
                              backgroundColor: '#f9f9f9',
                              borderLeft: '1px solid rgba(224, 224, 224, 1)'
                            }}
                          >
                            <textarea 
                              rows={1} 
                              style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
                              placeholder="Enter comments..."
                              value={evaluationData[item.id]?.notes || ""}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              disabled={existingEvaluation}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      );
    };

    return (
      <div className="w-screen h-screen flex overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}></div>
        <Sidebar />
        <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
          <Navbar />
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Child Assessment</h2>
            </div>
            {createAssessmentTable()}
          </div>
        </div>

        <Snackbar
          open={!!success || !!error}
          autoHideDuration={6000}
          onClose={() => {
            setSuccess(null);
            setError(null);
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ 
            top: '24px !important',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <Alert 
            onClose={() => {
              setSuccess(null);
              setError(null);
            }} 
            severity={success ? "success" : "error"} 
            sx={{ width: '100%' }}
          >
            {success || error}
          </Alert>
        </Snackbar>
      </div>
    );
  }