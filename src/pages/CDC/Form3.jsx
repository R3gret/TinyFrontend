import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import Form3PDF from '../../forms/Form3PDF';

const Form3 = () => {
  const navigate = useNavigate();

  const blankData = {
    routineCheckupLocation: '',
    hospitalName: '',
    hospitalAddress: '',
    hospitalPhone: '',
    lastCheckup: '',
    lastCheckupDate: '',
    lastCheckupHospital: '',
    allergiesYes: false,
    allergiesNo: false,
    allergiesComment: '',
    asthmaYes: false,
    asthmaNo: false,
    asthmaComment: '',
    bleedingYes: false,
    bleedingNo: false,
    bleedingComment: '',
    bowelsYes: false,
    bowelsNo: false,
    bowelsComment: '',
    coughingYes: false,
    coughingNo: false,
    coughingComment: '',
    diabetesYes: false,
    diabetesNo: false,
    diabetesComment: '',
    earsYes: false,
    earsNo: false,
    earsComment: '',
    eyesYes: false,
    eyesNo: false,
    eyesComment: '',
    otherYes: false,
    otherNo: false,
    otherComment: '',
    medicationYes: false,
    medicationNames: '',
    specialTreatmentYes: false,
    specialTreatmentType: '',
    accidentYes: false,
    accidentNo: false,
    accidentDescription: '',
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
          <Form3PDF data={blankData} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default Form3;

