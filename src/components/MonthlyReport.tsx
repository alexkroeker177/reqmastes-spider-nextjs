import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Define types
interface Project {
  name: string;
  hours: number[];
  totalHours: number;
}

interface MonthlyReportProps {
  projects: Project[];
  month: Date;
  totalHoursPerDay: number[];
  totalMonthHours: number;
  daysInMonth: number;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 'auto',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableCell: {
    padding: 4,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  weekendCell: {
    backgroundColor: '#ee8805',
  },
  totalCell: {
    backgroundColor: '#1a3051',
    color: 'white',
  },
  signature: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: 200,
    textAlign: 'center',
    paddingTop: 5,
  },
});

const MonthlyReport: React.FC<MonthlyReportProps> = ({ projects, month, totalHoursPerDay, totalMonthHours, daysInMonth }) => {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const isWeekend = (day: number) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  // Format hours to show decimals only when needed
  const formatHours = (hours: number) => {
    return hours === 0 ? "0" : hours.toFixed(2);
  };

  // Calculate column weights based on content
  const calculateColumnWeights = () => {
    const weights = Array(daysInMonth).fill(1); // Base weight
    
    // Analyze each day's data
    for (let day = 0; day < daysInMonth; day++) {
      let hasNonZero = totalHoursPerDay[day] > 0;
      
      if (!hasNonZero) {
        // Check project hours
        for (const project of projects) {
          if (project.hours[day] > 0) {
            hasNonZero = true;
            break;
          }
        }
      }
      
      // Assign weights based on content
      if (hasNonZero) {
        weights[day] = 1.5; // 50% wider for columns with actual hours
      }
    }
    
    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Convert weights to percentages
    return weights.map(weight => `${(weight * 77 / totalWeight)}%`);
  };

  // Calculate cell widths
  const descriptionWidth = '15%';
  const monthWidth = '8%';
  const dayWidths = calculateColumnWeights();

  return (
    <Document>
      <Page size="A2" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Monatsbericht</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image 
            style={styles.logo}
            src="https://i.postimg.cc/DwGcwTyn/Logo-complete-light-background.png"
          />
        </View>

        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: descriptionWidth }]}>
              <Text>Kunde</Text>
            </View>
            <View style={[styles.tableCell, { width: monthWidth, textAlign: 'center' }]}>
              <Text>{format(month, 'MMMM yyyy', { locale: de })}</Text>
            </View>
            {days.map((day, index) => (
              <View 
                key={day} 
                style={[
                  styles.tableCell, 
                  { width: dayWidths[index] },
                  isWeekend(day) ? styles.weekendCell : {}
                ]}
              >
                <Text>{format(new Date(month.getFullYear(), month.getMonth(), day), 'EE', { locale: de })}</Text>
              </View>
            ))}
          </View>

          {/* Days Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: descriptionWidth }]}>
              <Text>Projekt</Text>
            </View>
            <View style={[styles.tableCell, { width: monthWidth }]} />
            {days.map((day, index) => (
              <View 
                key={day} 
                style={[
                  styles.tableCell, 
                  { width: dayWidths[index] },
                  isWeekend(day) ? styles.weekendCell : {}
                ]}
              >
                <Text>{String(day).padStart(2, '0')}</Text>
              </View>
            ))}
          </View>

          {/* Total Hours Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: descriptionWidth }]}>
              <Text>Beschreibung</Text>
            </View>
            <View style={[styles.tableCell, styles.totalCell, { width: monthWidth }]}>
              <Text>{formatHours(totalMonthHours)}</Text>
            </View>
            {totalHoursPerDay.map((hours, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableCell, 
                  { width: dayWidths[index] },
                  isWeekend(index + 1) ? styles.weekendCell : {}
                ]}
              >
                <Text>{formatHours(hours)}</Text>
              </View>
            ))}
          </View>

          {/* Project Rows */}
          {projects.map((project, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCell, { width: descriptionWidth }]}>
                <Text>{project.name}</Text>
              </View>
              <View style={[styles.tableCell, styles.totalCell, { width: monthWidth }]}>
                <Text>{formatHours(project.totalHours)}</Text>
              </View>
              {project.hours.map((hours, dayIndex) => (
                <View 
                  key={dayIndex} 
                  style={[
                    styles.tableCell, 
                    { width: dayWidths[dayIndex] },
                    isWeekend(dayIndex + 1) ? styles.weekendCell : {}
                  ]}
                >
                  <Text>{formatHours(hours)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

      </Page>
    </Document>
  );
};

export default MonthlyReport; 