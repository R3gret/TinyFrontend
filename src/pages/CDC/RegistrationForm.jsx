import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import RegistrationPDF from '../../forms/RegistrationPDF';

const RegistrationForm = () => {
  const navigate = useNavigate();

  const blankData = {
    childLastName: '',
    childFirstName: '',
    childMiddleName: '',
    childGender: '',
    childAddress: '',
    childBirthday: '',
    guardianName: '',
    guardianRelationship: '',
    childRegistered: false,
    childAge: '',
    childFirstLanguage: '',
    childSecondLanguage: '',
    childBirthplace: '',
    childFourPsId: '',
    childDisability: '',
    childHeightCm: '',
    childWeightKg: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianAddress: '',
    motherName: '',
    motherOccupation: '',
    motherAddress: '',
    motherContactHome: '',
    motherContactWork: '',
    fatherName: '',
    fatherOccupation: '',
    fatherAddress: '',
    fatherContactHome: '',
    fatherContactWork: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyContactHome: '',
    emergencyContactWork: '',
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
          <RegistrationPDF data={blankData} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default RegistrationForm;
