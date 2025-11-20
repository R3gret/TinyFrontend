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
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  formHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  formNumber: {
    position: 'absolute',
    left: 0,
    top: 0,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  centerHeader: {
    textAlign: 'center',
    marginBottom: 6,
  },
  centerHeaderLine: {
    fontSize: 10,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  topLine: {
    borderTop: '2pt solid black',
    marginVertical: 6,
  },
  borderBox: {
    border: '1.8pt solid black',
    paddingVertical: 6,
    paddingHorizontal: 10,
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
  sectionLabel: {
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  indentLabel: {
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
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
  formFooter: {
    textAlign: 'left',
    marginTop: 16,
    fontSize: 10,
    fontWeight: 'bold',
  }
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
        <View style={styles.formHeader}>
          <Text style={styles.formNumber}>FORM 1</Text>
          <Text style={styles.formHeaderText}>LIAN CHILD DEVELOPMENT CENTER</Text>
          <Text style={styles.centerHeaderLine}>Lian, Batangas</Text>
          <Text style={styles.formHeaderText}>REGISTRATION FORM</Text>
        </View>
        <View style={styles.topLine} />

        <View style={styles.borderBox}>
          <View style={styles.row}>
            <LineField label="Name of Child" value={fullName} flex={2} />
            <LineField label="Gender" value={data.childGender} />
          </View>
          <View style={styles.row}>
            <LineField label="Address" value={data.childAddress} flex={2} />
            <LineField label="Birthday" value={data.childBirthday} />
          </View>
          <View style={styles.row}>
            <LineField label="Guardian" value={data.guardianName} flex={2} />
            <LineField label="Relationship" value={data.guardianRelationship} />
          </View>
          <View style={[styles.row, { alignItems: 'center' }]}>
            <Text style={styles.label}>Registered</Text>
            <Text style={styles.colon}>:</Text>
            <CheckBox label="Yes" checked={!!data.childRegistered} />
            <CheckBox label="No" checked={!data.childRegistered} />
            <LineField label="Age" value={data.childAge} />
          </View>
          <View style={styles.row}>
            <LineField label="Child's First Language" value={data.childFirstLanguage} />
            <LineField label="Second Language" value={data.childSecondLanguage} />
          </View>
          <View style={styles.row}>
            <LineField label="E-mail address" value={data.guardianEmail} flex={2} />
          </View>

          <Text style={styles.indentLabel}>Mother:</Text>
          <View style={styles.row}>
            <LineField label="Name" value={data.motherName} />
            <LineField label="Occupation" value={data.motherOccupation} />
          </View>
          <View style={styles.row}>
            <LineField label="Address" value={data.motherAddress} flex={2} />
          </View>
          <View style={styles.row}>
            <LineField label="Home" value={data.motherContactHome} />
            <LineField label="Work" value={data.motherContactWork} />
          </View>

          <Text style={styles.indentLabel}>Father:</Text>
          <View style={styles.row}>
            <LineField label="Name" value={data.fatherName} />
            <LineField label="Occupation" value={data.fatherOccupation} />
          </View>
          <View style={styles.row}>
            <LineField label="Address" value={data.fatherAddress} flex={2} />
          </View>
          <View style={styles.row}>
            <LineField label="Home" value={data.fatherContactHome} />
            <LineField label="Work" value={data.fatherContactWork} />
          </View>

          <Text style={styles.sectionLabel}>In case of emergency, Please contact the following:</Text>
          <View style={styles.row}>
            <LineField label="Name" value={data.emergencyName} />
            <LineField label="Relationship" value={data.emergencyRelationship} />
          </View>
          <View style={styles.row}>
            <LineField label="Home" value={data.emergencyContactHome} />
            <LineField label="Work" value={data.emergencyContactWork} />
          </View>

          <View style={styles.signatureRow}>
            <View style={styles.signatureLine}>
              <Text>Accomplished by :</Text>
              <Text style={styles.bottomNote}>Signature over printed name of parent/guardian</Text>
            </View>
            <View style={styles.signatureLine}>
              <Text>Date</Text>
            </View>
          </View>

          <View style={styles.signatureRow}>
            <View style={styles.signatureLine}>
              <Text>Reviewed by :</Text>
              <Text style={styles.bottomNote}>Signature over printed name of CDW</Text>
            </View>
            <View style={styles.signatureLine}>
              <Text>Date</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}