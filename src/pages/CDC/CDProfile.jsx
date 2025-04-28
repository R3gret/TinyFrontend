import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import CDCProfilePDF from '../../forms/CDProfilePDF'; // Adjust the import path as needed

const CDCProfileForm = () => {
  const navigate = useNavigate();

  const blankData = {
    centerName: '',
    addressNo: '',
    addressStreet: '',
    addressBarangay: '',
    addressCity: '',
    addressProvince: '',
    addressRegion: '',
    telephone: '',
    fax: '',
    email: '',
    status: '',
    accreditationDate: '',
    accreditationNumber: '',
    level: null,
    workersCount: '',
    services: {
      parentalCare: false,
      nutritionalCare: false,
      earlyLearning: false,
      behaviorGuidance: false,
      supplementalFeeding: false,
      playSocialization: false,
      healthActivities: false,
      characterValues: false,
      childSafety: false
    },
    servicesOther: '',
    facilities: {
      cdwTable: false,
      toilet: false,
      playArea: false,
      napArea: false,
      classroom: false,
      others: false
    },
    utilities: {
      electricity: false,
      feedingFacilities: false,
      firstAid: false,
      runningWater: false,
      playground: false,
      pwdAccess: false,
      potableWater: false,
      securedDoors: false,
      computer: false,
      growthMeasurement: false
    },
    utilitiesOther: '',
    equipment: {
      audioVideo: false,
      manipulativeToys: false,
      readingMaterials: false,
      musicalInstruments: false,
      childrensBooks: false,
      coloringBooks: false
    },
    equipmentOther: '',
    namePrinted: '',
    cot: '',
    dateConducted: ''
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '10px', 
        background: '#f1f1f1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
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
        <h2 style={{ margin: 0 }}>Child Development Center Profile</h2>
        <div style={{ width: '80px' }}></div> {/* Spacer for alignment */}
      </div>

      <div style={{ flex: 1 }}>
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
          <CDCProfilePDF data={blankData} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default CDCProfileForm;