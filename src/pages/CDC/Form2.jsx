import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import Form2PDF from '../../forms/Form2PDF';

const Form2 = () => {
  const navigate = useNavigate();

  const blankData = {
    childLastName: '',
    childFirstName: '',
    childMiddleName: '',
    birthDate: '',
    sex: '',
    address: '',
    parentGuardianName: '',
    relationship: '',
    phoneWork: '',
    phoneHome: '',
    phoneNumbers: '',
    mobileNumbers: '',
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#f1f1f1' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <PDFViewer width="100%" height="100%">
          <Form2PDF data={blankData} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default Form2;

