import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";

// Register Times New Roman font
Font.register({
  family: "Times-Roman",
  src: "https://fonts.gstatic.com/s/timesnewroman/v1/TimesNewRoman.ttf",
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 25,
    paddingHorizontal: 35,
    paddingBottom: 40,
    fontSize: 11,
    fontFamily: "Times-Roman",
  },
  formHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 6,
    position: 'relative',
  },
  formHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  formNumber: {
    position: 'absolute',
    left: 0,
    top: 0,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  borderBox: {
    border: '1.8pt solid black',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
  topLine: {
    borderTop: '2pt solid black',
    marginVertical: 6,
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  field: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  colon: {
    marginRight: 4,
    fontWeight: 'bold',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  valueWrapper: {
    flex: 1,
    borderBottom: '1pt solid black',
    minHeight: 16,
    paddingBottom: 2,
  },
  valueText: {
    minHeight: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxBox: {
    width: 11,
    height: 11,
    border: '1pt solid black',
    marginHorizontal: 6,
    textAlign: 'center',
    fontSize: 9,
  },
  assessmentTable: {
    marginTop: 8,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid black',
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  conditionColumn: {
    flex: 2,
    paddingRight: 8,
  },
  yesColumn: {
    flex: 0.5,
    alignItems: 'center',
  },
  noColumn: {
    flex: 0.5,
    alignItems: 'center',
  },
  commentsColumn: {
    flex: 2,
    borderBottom: '1pt solid black',
    minHeight: 16,
    paddingBottom: 2,
    marginLeft: 8,
  },
  conditionText: {
    fontSize: 10,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  signatureLine: {
    flex: 1,
    borderTop: '1pt solid black',
    paddingTop: 4,
    marginRight: 12,
    minHeight: 28,
  },
  bottomNote: {
    textAlign: 'left',
    fontSize: 9,
    marginTop: 2,
  },
  attestationBox: {
    marginTop: 12,
    marginBottom: 12,
    padding: 8,
    border: '1pt solid black',
  },
  attestationText: {
    fontSize: 10,
    textTransform: 'uppercase',
    lineHeight: 1.5,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionText: {
    flex: 1,
    marginRight: 8,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
});

const LineField = ({ label, value, flex = 1 }) => (
  <View style={[styles.field, { flex }]}>
    <View style={styles.fieldRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.colon}>:</Text>
      <View style={styles.valueWrapper}>
        <Text style={styles.valueText}>{value || ' '}</Text>
      </View>
    </View>
  </View>
);

const CheckBox = ({ label, checked }) => (
  <View style={styles.checkboxRow}>
    <Text style={styles.checkboxBox}>{checked ? '✔' : ''}</Text>
    <Text>{label}</Text>
  </View>
);

const AssessmentRow = ({ condition, yes, no, comment }) => (
  <View style={styles.tableRow}>
    <View style={styles.conditionColumn}>
      <Text style={styles.conditionText}>{condition}</Text>
    </View>
    <View style={styles.yesColumn}>
      <Text style={styles.checkboxBox}>{yes ? '✔' : ''}</Text>
    </View>
    <View style={styles.noColumn}>
      <Text style={styles.checkboxBox}>{no ? '✔' : ''}</Text>
    </View>
    <View style={styles.commentsColumn}>
      <Text style={styles.valueText}>{comment || ' '}</Text>
    </View>
  </View>
);

export default function Form3PDF({ data }) {
  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        <View style={styles.formHeader}>
          <Text style={styles.formHeaderText}>FORM 3 PHYSICAL HEALTH ASSESSMENT</Text>
          <Text style={styles.instructionText}>To be completed by parent or guardian</Text>
        </View>
        <View style={styles.topLine} />

        <Text style={styles.sectionLabel}>ROUTINE CHECK-UP INFORMATION</Text>
        <View style={styles.borderBox}>
          <View style={styles.row}>
            <LineField label="Where do you usually take your child for routine check-up?" value={data.routineCheckupLocation} flex={3} />
          </View>
          <View style={styles.row}>
            <LineField label="Name of Hospital/Center" value={data.hospitalName} flex={2} />
          </View>
          <View style={styles.row}>
            <LineField label="Address" value={data.hospitalAddress} flex={1} />
            <LineField label="Phone No." value={data.hospitalPhone} flex={1} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>When was the last time your child had a routine check-up? (mo/day/yr) & Where?</Text>
          </View>
          <View style={styles.row}>
            <LineField label="Date" value={data.lastCheckupDate} />
            <LineField label="Name of Hospital/Center" value={data.lastCheckupHospital} flex={2} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>ASSESSMENT OF CHILD'S HEALTH</Text>
        <Text style={{ fontSize: 9, marginBottom: 6 }}>
          To the best of your knowledge has your child had any problem with the following? Check (✓) Yes or No and provide a comment for any YES answer
        </Text>
        <View style={styles.assessmentTable}>
          <View style={styles.tableHeader}>
            <View style={styles.conditionColumn}>
              <Text style={styles.tableHeaderText}> </Text>
            </View>
            <View style={styles.yesColumn}>
              <Text style={styles.tableHeaderText}>YES</Text>
            </View>
            <View style={styles.noColumn}>
              <Text style={styles.tableHeaderText}>NO</Text>
            </View>
            <View style={styles.commentsColumn}>
              <Text style={styles.tableHeaderText}>Comments (required for any YES answer)</Text>
            </View>
          </View>
          <AssessmentRow 
            condition="Allergies (Food, Insects, Medicine, etc.)" 
            yes={data.allergiesYes} 
            no={data.allergiesNo} 
            comment={data.allergiesComment} 
          />
          <AssessmentRow 
            condition="Asthma" 
            yes={data.asthmaYes} 
            no={data.asthmaNo} 
            comment={data.asthmaComment} 
          />
          <AssessmentRow 
            condition="Bleeding" 
            yes={data.bleedingYes} 
            no={data.bleedingNo} 
            comment={data.bleedingComment} 
          />
          <AssessmentRow 
            condition="Bowels" 
            yes={data.bowelsYes} 
            no={data.bowelsNo} 
            comment={data.bowelsComment} 
          />
          <AssessmentRow 
            condition="Coughing" 
            yes={data.coughingYes} 
            no={data.coughingNo} 
            comment={data.coughingComment} 
          />
          <AssessmentRow 
            condition="Diabetes" 
            yes={data.diabetesYes} 
            no={data.diabetesNo} 
            comment={data.diabetesComment} 
          />
          <AssessmentRow 
            condition="Ears or Deafness" 
            yes={data.earsYes} 
            no={data.earsNo} 
            comment={data.earsComment} 
          />
          <AssessmentRow 
            condition="Eyes or Vision" 
            yes={data.eyesYes} 
            no={data.eyesNo} 
            comment={data.eyesComment} 
          />
          <AssessmentRow 
            condition="Other (please indicate)" 
            yes={data.otherYes} 
            no={data.otherNo} 
            comment={data.otherComment} 
          />
        </View>

        <Text style={styles.sectionLabel}>MEDICATION AND SPECIAL TREATMENT</Text>
        <View style={styles.questionRow}>
          <Text style={styles.questionText}>Does your child take medication (prescription or non-prescription) at any time?</Text>
          <CheckBox label="Yes" checked={data.medicationYes} />
          <Text style={{ marginLeft: 8, marginRight: 8 }}>name(s) of medication(s):</Text>
          <View style={[styles.valueWrapper, { flex: 2 }]}>
            <Text style={styles.valueText}>{data.medicationNames || ' '}</Text>
          </View>
        </View>
        <View style={styles.questionRow}>
          <Text style={styles.questionText}>Does your child receive special treatment? (nebulizer, etc.)</Text>
          <CheckBox label="Yes" checked={data.specialTreatmentYes} />
          <Text style={{ marginLeft: 8, marginRight: 8 }}>type of treatment:</Text>
          <View style={[styles.valueWrapper, { flex: 2 }]}>
            <Text style={styles.valueText}>{data.specialTreatmentType || ' '}</Text>
          </View>
        </View>

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>Does your child ever have a serious accident?</Text>
          <CheckBox label="Yes" checked={data.accidentYes} />
          <CheckBox label="No" checked={data.accidentNo} />
          <Text style={{ marginLeft: 8, marginRight: 8 }}>If yes describe briefly:</Text>
          <View style={[styles.valueWrapper, { flex: 2 }]}>
            <Text style={styles.valueText}>{data.accidentDescription || ' '}</Text>
          </View>
        </View>

        <View style={styles.attestationBox}>
          <Text style={styles.attestationText}>
            I ATTEST THAT ALL INFORMATION PROVIDED ON THIS FORM IS TRUE AND ACCURATE TO THE BEST OF MY KNOWLEDGE AND BELIEF. I UNDERSTAND IT IS FOR CONFIDENTIAL USE IN MEETING MY CHILD'S HEALTH NEEDS IN CDC.
          </Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureLine}>
            <Text>Signature of Parent/Guardian</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>Date</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

