import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";

// Register Times New Roman font
Font.register({
  family: "Times-Roman",
  src: "https://fonts.gstatic.com/s/timesnewroman/v1/TimesNewRoman.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Times-Roman",
  },
  headerWrapper: {
    textAlign: 'center',
    marginBottom: 8, // was 20
  },
  headerText: {
    fontSize: 10,
    marginBottom: 0, // was 6
    fontWeight: 'bold',
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6, // was 14
    textAlign: 'center',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: 'black',
    marginTop: 2, // or 0 if you want it tighter
    marginBottom: 12, // adjust as needed
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  field: {
    flexGrow: 1,
    minWidth: '30%',
    marginBottom: 8,
  },
  fieldLast: {
    flexGrow: 1,
    minWidth: '30%',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 4,
  },
  value: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    minHeight: 18,
    paddingBottom: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 11,
    marginRight: 12,
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  signatureLine: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'black',
    textAlign: 'center',
    paddingTop: 4,
    width: '50%',
  },

  checkboxGroupWithSpacing: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 20, // ✅ Adjust this to increase or decrease space
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // decrease this as needed or remove it
    marginBottom: 8, // optional
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 10,
    textAlign: 'right',
  },
  
});


const Field = ({ label, value, width }) => (
  <View style={[styles.field, { flex: width || 1 }]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || ' '}</Text>
  </View>
);

const Checkbox = ({ label, checked }) => (
  <View style={styles.checkboxContainer}>
    <View style={styles.checkbox}>
      {checked && <Text>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
);

export default function CDCProfilePDF({ data }) {
  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        <View style={styles.headerWrapper}>
          <Text style={styles.headerText}>Early Childhood Care and Development Council</Text>
          <View style={styles.horizontalLine} />
          <Text style={styles.title}>FORM 7 – CHILD DEVELOPMENT CENTER PROFILE</Text>
        </View>

        <View style={styles.section}>
  <View style={styles.row}>
    <Field label="1. Name of Child Development Center:" value={data.centerName} width={0.6} />
    <Field label="Year Established:" value={data.yearEstablished} width={0.4} />
  </View>
</View>

        <View style={styles.section}>
          <Text style={styles.label}>2. Address:</Text>
          <View style={styles.row}>
            <Field label="(No)" value={data.addressNo} width={0.3} />
            <Field label="(Street)" value={data.addressStreet} width={0.7} />
          </View>
          <View style={styles.row}>
            <Field label="(Barangay)" value={data.addressBarangay} width={0.5} />
            <Field label="(City/Municipality)" value={data.addressCity} width={0.5} />
          </View>
          <View style={styles.row}>
            <Field label="(Province)" value={data.addressProvince} width={0.5} />
            <Field label="(Region)" value={data.addressRegion} width={0.5} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Contact Details:</Text>
          <View style={styles.row}>
            <Field label="Telephone Nos." value={data.telephone} width={0.4} />
            <Field label="Fax No." value={data.fax} width={0.3} />
            <Field label="Email Add." value={data.email} width={0.3} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>3. Status of the Center:</Text>
          <View style={styles.checkboxGroupWithSpacing}>
            <Checkbox label="Accredited" checked={data.status === 'accredited'} />
            <Checkbox label="Not Accredited" checked={data.status === 'not_accredited'} />
            <Checkbox label="Accredited but Expired" checked={data.status === 'expired'} />
          </View>
          <View style={styles.row}>
            <Field label="Date Accredited" value={data.accreditationDate} width={0.5} />
            <Field label="Accreditation No." value={data.accreditationNumber} width={0.5} />
          </View>
          <Text style={styles.label}>Level:</Text>
          <View style={styles.compactRow}>
          <Checkbox label="1" checked={data.level === 1} />
          <Checkbox label="2" checked={data.level === 2} />
          <Checkbox label="3" checked={data.level === 3} />
        </View>
        </View>

        <View style={styles.section}>
  <View style={styles.row}>
    <Field 
      label="4. Number of Child Development Workers in the Center:" 
      value={data.workersCount} 
      width={1} 
    />
  </View>
</View>
        <View style={styles.section}>
          <Text style={styles.label}>5. Services Offered:</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Checkbox label="Supplemental Parental Care" checked={data.services.parentalCare} />
              <Checkbox label="Nutritional Care" checked={data.services.nutritionalCare} />
              <Checkbox label="Early Learning" checked={data.services.earlyLearning} />
            </View>
            <View style={styles.field}>
              <Checkbox label="Guiding Children's Behavior" checked={data.services.behaviorGuidance} />
              <Checkbox label="Supplemental Feeding" checked={data.services.supplementalFeeding} />
              <Checkbox label="Play & Socialization" checked={data.services.playSocialization} />
            </View>
            <View style={styles.fieldLast}>
              <Checkbox label="Health Related Activities" checked={data.services.healthActivities} />
              <Checkbox label="Inculcating Character & Values" checked={data.services.characterValues} />
              <Checkbox label="Child Safety & Protection" checked={data.services.childSafety} />
            </View>
          </View>
          <View style={{ marginBottom: 10 }}>  {/* Add spacing here */}
          <View style={styles.row}>
    <Field 
      label="Others, pls. specify:" value={data.servicesOther}
      width={1} 
    />
  </View>
        </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>6. Available Facilities:</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Checkbox label="CDW Table" checked={data.facilities.cdwTable} />
              <Checkbox label="Toilet" checked={data.facilities.toilet} />
              <Checkbox label="Play Area" checked={data.facilities.playArea} />
            </View>
            <View style={styles.field}>
              <Checkbox label="Nap Area" checked={data.facilities.napArea} />
              <Checkbox label="Classroom" checked={data.facilities.classroom} />
              <Checkbox label="Others" checked={data.facilities.others} />
            </View>
          </View>
        </View>

        <Text style={[styles.footerText, { textAlign: 'right', fontSize: 10, marginTop: 10 }]}>
Page 2 of 2
</Text>
      </Page>

      {/* Page 2 */}
      <Page size="LEGAL" style={styles.page}>
        

        <View style={styles.section}>
          <Text style={styles.label}>7. Utilities/Services Offered:</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Checkbox label="Electricity" checked={data.utilities.electricity} />
              <Checkbox label="Feeding Facilities & Utensils" checked={data.utilities.feedingFacilities} />
              <Checkbox label="First Aid Kit" checked={data.utilities.firstAid} />
            </View>
            <View style={styles.field}>
              <Checkbox label="Running Water" checked={data.utilities.runningWater} />
              <Checkbox label="Playground w/ Equipment" checked={data.utilities.playground} />
              <Checkbox label="Structure for Accessibility - PWD" checked={data.utilities.pwdAccess} />
            </View>
            <View style={styles.fieldLast}>
              <Checkbox label="Potable Water" checked={data.utilities.potableWater} />
              <Checkbox label="Secured Doors & Windows" checked={data.utilities.securedDoors} />
              <Checkbox label="Computer" checked={data.utilities.computer} />
            </View>
          </View>
          <View style={styles.row}>
    <Field 
      label="Others, pls. specify:" value={data.utilitiesOther}
      width={1} 
    />
  </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>8. Available Equipment and Learning Materials:</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Checkbox label="Audio/Video Materials" checked={data.equipment.audioVideo} />
              <Checkbox label="Manipulative Toys" checked={data.equipment.manipulativeToys} />
              <Checkbox label="Reading Materials" checked={data.equipment.readingMaterials} />
            </View>
            <View style={styles.field}>
              <Checkbox label="Musical Instrument" checked={data.equipment.musicalInstruments} />
              <Checkbox label="Children's Books" checked={data.equipment.childrensBooks} />
              <Checkbox label="Coloring Books" checked={data.equipment.coloringBooks} />
            </View>
          </View>
          <View style={styles.row}>
    <Field 
      label="Other CDC Learning Materials, pls. specify:" value={data.equipmentOther}
      width={1} 
    />
  </View>
        </View>

        <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '40%' }}>
            <Text style={styles.value}>{data.namePrinted}</Text>
            <Text style={styles.label}>Name in Print</Text>
          </View>
          <View style={{ width: '40%' }}>
            <Text style={styles.value}> </Text>
            <Text style={styles.label}>Signature</Text>
          </View>
        </View>

        <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '30%' }}>
            <Text style={styles.value}>{data.cot}</Text>
            <Text style={styles.label}>COT</Text>
          </View>
          <View style={{ width: '40%' }}>
            <Text style={styles.value}>{data.dateConducted}</Text>
            <Text style={styles.label}>Date Conducted</Text>
          </View>
        </View>

        <Text style={[styles.footerText, { textAlign: 'right', fontSize: 10, marginTop: 10 }]}>
Page 2 of 2
</Text>
      </Page>
    </Document>
  );
}