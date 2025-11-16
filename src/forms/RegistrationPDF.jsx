import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";

// Register Times New Roman font
Font.register({
  family: "Times-Roman",
  src: "https://fonts.gstatic.com/s/timesnewroman/v1/TimesNewRoman.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Times-Roman",
  },
  headerWrapper: {
    textAlign: 'center',
    marginBottom: 7,
  },
  headerText: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: 'bold', 
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  instruction: {
    fontSize: 9,
    marginTop: 4,
    fontStyle: 'italic',
  },
  horizontalLine: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    width: '105%',
    marginVertical: 10,
    alignSelf: 'center',
  },
  borderBox: {
    border: '3pt solid black',
    padding: 10,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  field: {
    flex: 1,
    marginRight: 6,
  },
  fieldLast: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  value: {
    borderBottom: '1pt solid black',
    minHeight: 14,
  },
  signatureSection: {
    marginTop: 20,
  },
  signatureLine: {
    marginTop: 20,
    borderTop: '1pt solid black',
    textAlign: 'center',
    paddingTop: 2,
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
  }
});

const Field = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || ' '}</Text>
  </View>
);

const FieldLast = ({ label, value }) => (
  <View style={styles.fieldLast}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || ' '}</Text>
  </View>
);

export default function RegistrationPDF({ data }) {
  // Combine child name parts, only add comma if last name is present
  let fullName = '';
  if (data.childLastName && data.childFirstName) {
    fullName = `${data.childLastName}, ${data.childFirstName}`;
  } else if (data.childLastName) {
    fullName = data.childLastName;
  } else if (data.childFirstName) {
    fullName = data.childFirstName;
  }
  if (data.childMiddleName) {
    fullName = fullName ? `${fullName} ${data.childMiddleName}` : data.childMiddleName;
  }
  
  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        <View style={styles.headerWrapper}>
          <Text style={styles.headerText}>LIAN Child Development Center</Text>
          <Text style={styles.headerText}>Lian, Batangas</Text>
          <Text style={styles.title}>REGISTRATION FORM</Text>
        </View>

        <View style={styles.borderBox}>
          <Text style={styles.instruction}>
            <Text style={{ fontWeight: 'bold' }}>INSTRUCTION:</Text> This form is to be filled up by the parent/guardian of the child upon enrolment to the Child Development Center.
            This will be kept by the Child Development Teacher in the portfolio of the child.
          </Text>
          <View style={styles.horizontalLine} />

          <View style={styles.section}>
            <View style={styles.row}>
              <Field label="Name of Child" value={fullName} />
              <FieldLast label="Gender" value={data.childGender} />
            </View>
            <View style={styles.row}>
              <Field label="Address" value={data.childAddress} />
              <FieldLast label="Birthday" value={data.childBirthday} />
            </View>
            <View style={styles.row}>
              <Field label="Guardian" value={data.guardianName} />
              <FieldLast label="Relationship" value={data.guardianRelationship} />
            </View>
            <View style={styles.row}>
              <Field label="Registered" value={data.childRegistered ? "Yes" : "No"} />
              <FieldLast label="Age" value={data.childAge} />
            </View>
            <View style={styles.row}>
              <Field label="Child's First Language" value={data.childFirstLanguage} />
              <FieldLast label="Second Language" value={data.childSecondLanguage} />
            </View>
            <View style={styles.row}>
              <Field label="E-mail address" value={data.guardianEmail} />
            </View>
          </View>

          <View style={styles.horizontalLine} />
          <Text style={styles.sectionLabel}>Guardian Information:</Text>

          <Text style={{ fontWeight: 'bold' }}>Mother:</Text>
          <View style={styles.row}>
            <Field label="Name" value={data.motherName} />
            <FieldLast label="Occupation" value={data.motherOccupation} />
          </View>
          <View style={styles.row}>
            <Field label="Address" value={data.motherAddress} />
          </View>
          <View style={styles.row}>
            <Field label="Contact Number (Home)" value={data.motherContactHome} />
            <FieldLast label="Work" value={data.motherContactWork} />
          </View>

          <Text style={{ fontWeight: 'bold' }}>Father:</Text>
          <View style={styles.row}>
            <Field label="Name" value={data.fatherName} />
            <FieldLast label="Occupation" value={data.fatherOccupation} />
          </View>
          <View style={styles.row}>
            <Field label="Address" value={data.fatherAddress} />
          </View>
          <View style={styles.row}>
            <Field label="Contact Number (Home)" value={data.fatherContactHome} />
            <FieldLast label="Work" value={data.fatherContactWork} />
          </View>

          <View style={styles.horizontalLine} />
          <Text style={styles.sectionLabel}>IN CASE OF EMERGENCY, Please contact the following:</Text>
          <View style={styles.row}>
            <Field label="Name" value={data.emergencyName} />
            <FieldLast label="Relationship" value={data.emergencyRelationship} />
          </View>
          <View style={styles.row}>
            <Field label="Contact Number (Home)" value={data.emergencyContactHome} />
            <FieldLast label="Work" value={data.emergencyContactWork} />
          </View>

          <View style={styles.signatureSection}>
            <View style={styles.row}>
              <Field label="Accomplished by (Parent/Guardian)" value={data.guardianName} />
              <FieldLast label="Date" value={new Date().toLocaleDateString()} />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}