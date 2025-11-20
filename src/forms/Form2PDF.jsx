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
    textTransform: 'uppercase',
  },
  topLine: {
    borderTop: '2pt solid black',
    marginVertical: 6,
  },
  borderBox: {
    border: '1.8pt solid black',
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 80,
    marginBottom: 10,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  nameField: {
    flex: 1,
    marginRight: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  phoneField: {
    flex: 1,
    marginRight: 8,
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

export default function Form2PDF({ data }) {
  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        <View style={styles.formHeader}>
          <Text style={styles.formNumber}>FORM 2</Text>
          <Text style={styles.formHeaderText}>PHYSICAL HEALTH INVENTORY FORM</Text>
        </View>
        <View style={styles.topLine} />

        <View style={styles.borderBox}>
          <Text style={{ marginBottom: 8 }}> </Text>
        </View>

        <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>
        <View style={styles.borderBox}>
          <View style={styles.nameRow}>
            <View style={[styles.nameField, { flex: 0.5 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Child's Name</Text>
                <Text style={styles.colon}>:</Text>
              </View>
            </View>
            <View style={[styles.nameField, { flex: 1 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Last</Text>
                <Text style={styles.colon}>:</Text>
                <View style={styles.valueWrapper}>
                  <Text style={styles.valueText}>{data.childLastName || ' '}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.nameField, { flex: 1 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>First</Text>
                <Text style={styles.colon}>:</Text>
                <View style={styles.valueWrapper}>
                  <Text style={styles.valueText}>{data.childFirstName || ' '}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.nameField, { flex: 1 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Middle</Text>
                <Text style={styles.colon}>:</Text>
                <View style={styles.valueWrapper}>
                  <Text style={styles.valueText}>{data.childMiddleName || ' '}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <LineField label="Birth Date" value={data.birthDate} />
            <View style={styles.field}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Sex</Text>
                <Text style={styles.colon}>:</Text>
                <CheckBox label="M" checked={data.sex === 'M'} />
                <CheckBox label="F" checked={data.sex === 'F'} />
              </View>
            </View>
          </View>
          <View style={[styles.row, { marginBottom: 2 }]}>
            <LineField label="Address" value={data.address} flex={3} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>PARENT/GUARDIAN INFORMATION</Text>
        <View style={styles.borderBox}>
          <View style={styles.row}>
            <LineField label="Parent/Guardian Name(s)" value={data.parentGuardianName} flex={2} />
          </View>
          <View style={styles.row}>
            <LineField label="Relationship" value={data.relationship} />
          </View>
          <View style={styles.phoneRow}>
            <View style={[styles.phoneField, { flex: 0.5 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.colon}>:</Text>
              </View>
            </View>
            <View style={[styles.phoneField, { flex: 1 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Work</Text>
                <Text style={styles.colon}>:</Text>
                <View style={styles.valueWrapper}>
                  <Text style={styles.valueText}>{data.phoneWork || ' '}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.phoneField, { flex: 1 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Home</Text>
                <Text style={styles.colon}>:</Text>
                <View style={styles.valueWrapper}>
                  <Text style={styles.valueText}>{data.phoneHome || ' '}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <LineField label="Number(s)" value={data.phoneNumbers} />
          </View>
          <View style={[styles.row, { marginBottom: 2 }]}>
            <LineField label="Mobile Number(s)" value={data.mobileNumbers} />
          </View>
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

        <View style={{ marginTop: 20 }} />

        <View style={styles.signatureRow}>
          <View style={styles.signatureLine}>
            <Text>Reviewed by :</Text>
            <Text style={styles.bottomNote}>Signature over printed name of CDW</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>Date</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

