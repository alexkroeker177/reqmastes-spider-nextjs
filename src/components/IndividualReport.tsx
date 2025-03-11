import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { de } from 'date-fns/locale';

interface DayData {
  date: string;
  hours: number;
  comments: string[];
}

interface IndividualReportProps {
  projectName: string;
  month: string;
  days: DayData[];
  totalHours: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    width: 150,
    marginLeft: 'auto',
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  projectInfo: {
    marginBottom: 10,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
    paddingVertical: 4,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
  },
  dateCell: {
    width: '20%',
  },
  hoursCell: {
    width: '15%',
  },
  commentCell: {
    width: '65%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingRight: 5,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 10,
    textAlign: 'center',
  },
});

const IndividualReport: React.FC<IndividualReportProps> = ({ 
  projectName, 
  month, 
  days, 
  totalHours 
}) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>Individualbericht</Text>
        <View style={styles.projectInfo}>
          <Text>Projekt: {projectName}</Text>
          <Text>Monat: {month}</Text>
        </View>
      </View>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image 
        style={styles.logo}
        src="https://i.postimg.cc/DwGcwTyn/Logo-complete-light-background.png"
      />
    </View>

    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.dateCell]}>Datum</Text>
        <Text style={[styles.tableCell, styles.hoursCell]}>Stunden</Text>
        <Text style={[styles.tableCell, styles.commentCell]}>Kommentare</Text>
      </View>

      {days.map((day, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.dateCell]}>{day.date}</Text>
          <Text style={[styles.tableCell, styles.hoursCell]}>{day.hours.toFixed(2)}</Text>
          <Text style={[styles.tableCell, styles.commentCell]}>
            {day.comments.filter(c => c).join(', ')}
          </Text>
        </View>
      ))}
    </View>

    <View style={styles.totalRow}>
      <Text>Summe Stunden: {totalHours.toFixed(2)}</Text>
    </View>

    <View style={styles.footer}>
      <View style={styles.signature}>
        <Text>Unterschrift Projektleiter*in</Text>
      </View>
      <View style={styles.signature}>
        <Text>Unterschrift Dienstleister</Text>
      </View>
    </View>
  </Page>
);

export default IndividualReport; 