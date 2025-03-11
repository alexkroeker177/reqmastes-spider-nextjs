"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { DatePickerWithRange } from "@/components/ui/datepickerwithrange"
import { FancyMultiSelect } from "@/components/ui/multiselect"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MonthYearPicker } from "@/components/ui/month-year-picker"
import { FileText, Download } from "lucide-react"
import { startOfMonth, endOfMonth, format } from 'date-fns'

interface Project {
  value: string;
  label: string;
}

export default function Berichte() {
  const [selectedReport, setSelectedReport] = React.useState<string>("monatsbericht")
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const today = new Date();
    return startOfMonth(today);
  })
  const [selectedProjects, setSelectedProjects] = React.useState<Project[]>([])
  const [selectedProject, setSelectedProject] = React.useState<string>("")
  const [loading, setLoading] = React.useState<boolean>(false)
  const [exportFormat, setExportFormat] = React.useState<string>('pdf');
  const [availableProjects, setAvailableProjects] = React.useState<Project[]>([]);

  // Fetch projects when component mounts
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/personio/projects');
        const data = await response.json();
        const formattedProjects = data
          .filter((project: any) => project.name.startsWith('_ext') && !project.name.includes('RDA'))
          .map((project: any) => ({
            value: project.name,
            label: project.name.substring(5) // Remove "_ext_" prefix
          }));
        setAvailableProjects(formattedProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleReportChange = (value: string) => {
    setSelectedReport(value);
    setSelectedProject(""); // Reset selected project when changing report type
    setSelectedProjects([]); // Reset selected projects when changing report type
  };

  const handleGenerateReport = async () => {
    if (!selectedReport || !selectedDate) return;
    
    setLoading(true);
    try {
      if (selectedReport === "projekterfassung") {
        // Format dates to YYYY-MM-DD using date-fns
        const formatDate = (date: Date) => {
          return format(date, 'yyyy-MM-dd');
        };

        // Get first and last day of the selected month
        const monthStartDate = startOfMonth(selectedDate);
        const monthEndDate = endOfMonth(selectedDate);

        console.log('Sending project report request:', {
          startDate: formatDate(monthStartDate),
          endDate: formatDate(monthEndDate),
          projects: selectedProjects
        });

        const response = await fetch('/api/reports/project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: formatDate(monthStartDate),
            endDate: formatDate(monthEndDate),
            project: selectedProjects.length > 0 ? selectedProjects.map(p => p.label) : undefined
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to generate report: ${errorText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `projekterfassung-${formatDate(monthStartDate)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      } else if (selectedReport === "individualbericht") {
        if (!selectedProject) {
          throw new Error('Please select a project');
        }

        const monthStartDate = startOfMonth(selectedDate);
        const monthEndDate = endOfMonth(selectedDate);

        // Format dates to YYYY-MM-DD using date-fns
        const formatDate = (date: Date) => {
          return format(date, 'yyyy-MM-dd');
        };

        // Find the project label (without _ext_ prefix) for display
        const projectLabel = availableProjects.find(p => p.value === selectedProject)?.label || selectedProject;

        console.log('Sending individual report request:', {
          projectId: selectedProject,
          startDate: formatDate(monthStartDate),
          endDate: formatDate(monthEndDate),
          format: exportFormat
        });

        const response = await fetch('/api/reports/individual', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: selectedProject,
            startDate: formatDate(monthStartDate),
            endDate: formatDate(monthEndDate),
            format: exportFormat
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to generate report: ${errorText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `individualbericht_${projectLabel}_${formatDate(monthStartDate)}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      } else if (selectedReport === "monatsbericht") {
        const monthStartDate = startOfMonth(selectedDate);
        console.log("Generating monatsbericht for:", monthStartDate);
        const response = await fetch('/api/reports/monthly', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: format(monthStartDate, 'yyyy-MM-dd')
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to generate report: ${errorText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monatsbericht-${format(monthStartDate, 'yyyy-MM')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Berichte</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Selection Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Berichtstyp</CardTitle>
              <CardDescription>Wählen Sie die Art des Berichts aus</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => handleReportChange(value)} defaultValue="monatsbericht">
                <SelectTrigger>
                  <SelectValue placeholder="Berichtstyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monatsbericht">Monatsbericht</SelectItem>
                  <SelectItem value="projekterfassung">Projekterfassung</SelectItem>
                  <SelectItem value="individualbericht">Individualbericht</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Report Configuration Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Berichtskonfiguration</CardTitle>
              <CardDescription>
                {selectedReport === "monatsbericht" && "Konfigurieren Sie den Monatsbericht"}
                {selectedReport === "projekterfassung" && "Konfigurieren Sie die Projekterfassung"}
                {selectedReport === "individualbericht" && "Konfigurieren Sie den Individualbericht"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Monatsbericht Configuration */}
              {selectedReport === "monatsbericht" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Monat auswählen</h3>
                    <MonthYearPicker 
                      value={selectedDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateReport} 
                    disabled={!selectedDate || loading}
                    className="w-full"
                  >
                    {loading ? 'Wird generiert...' : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Bericht generieren
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Projekterfassung Configuration */}
              {selectedReport === "projekterfassung" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Monat auswählen</h3>
                    <MonthYearPicker 
                      value={selectedDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Projekte auswählen</h3>
                    <FancyMultiSelect 
                      {...{
                        value: selectedProjects,
                        onChange: setSelectedProjects
                      } as any}
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={!selectedDate || loading}
                    className="w-full"
                  >
                    {loading ? 'Wird generiert...' : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Bericht generieren
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Individualbericht Configuration */}
              {selectedReport === "individualbericht" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Monat auswählen</h3>
                    <MonthYearPicker 
                      value={selectedDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Projekt auswählen</h3>
                    <Select 
                      onValueChange={setSelectedProject}
                      value={selectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Projekt auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProjects.map((project) => (
                          <SelectItem key={project.value} value={project.value}>
                            {project.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Exportformat</h3>
                    <Select 
                      onValueChange={(value) => setExportFormat(value)}
                      defaultValue="pdf"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Format auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={!selectedDate || !selectedProject || loading}
                    className="w-full"
                  >
                    {loading ? 'Wird generiert...' : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Bericht generieren
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Berichtsinformationen
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedReport === "monatsbericht" && (
                <div className="prose">
                  <p className="text-muted-foreground">
                    Der Monatsbericht gibt einen Überblick über alle Aktivitäten eines Monats. 
                    Er zeigt an, in welchen aktiven Projekten gearbeitet wurde und wie viele Stunden dafür geleistet wurden.
                  </p>
                  <p className="text-sm mt-4">
                    <span className="font-medium">Vorgehensweise:</span> Monat/Jahr auswählen → Bericht generieren
                  </p>
                </div>
              )}
              
              {selectedReport === "projekterfassung" && (
                <div className="prose">
                  <p className="text-muted-foreground">
                    Die Projekterfassung ermöglicht einen spezifischen Bericht über ausgewählte Projekte in einem bestimmten Zeitraum zu erstellen.
                  </p>
                  <p className="text-sm mt-4">
                    <span className="font-medium">Vorgehensweise:</span> Monat/Jahr auswählen → Projekte auswählen → Bericht generieren
                  </p>
                </div>
              )}
              
              {selectedReport === "individualbericht" && (
                <div className="prose">
                  <p className="text-muted-foreground">
                    Der Individualbericht erstellt einen detaillierten Bericht für ein bestimmtes Projekt, 
                    in welchem die geleistete Arbeit mitsamt Personio Kommentare aufgelistet wird.
                  </p>
                  <p className="text-sm mt-4">
                    Nach Absprache mit IT kann für einzelne Projekte auch ein Template hinterlegt werden, 
                    auf dessen Basis der Bericht generiert werden soll.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}