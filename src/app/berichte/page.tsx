"use client";
import * as React from "react";
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
import { Separator } from "@/components/ui/separator"
import { MonthYearPicker } from "@/components/ui/month-year-picker"
import { DateRange } from "react-day-picker"


export default function Berichte() {
  const [selectedReport, setSelectedReport] = React.useState<string>("")
  const [selectedDate, setSelectedDate] = React.useState<Date>()
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([])

  const handleGenerateReport = async () => {
    console.log("generate report..")
    if (selectedReport === "projekterfassung" && dateRange?.from && dateRange?.to) {
      // Format dates to YYYY-MM-DD
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      console.log("Project values being sent:", selectedProjects); // Debug log

      const payload = {
        startDate: formatDate(dateRange.from),
        endDate: formatDate(dateRange.to),
        project: selectedProjects // Send all selected projects
      };

      console.log("Request payload:", payload);
      
      try {
        const response = await fetch('https://api.spider.asapp-it.de/getprojectreport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
        
        const errorText = await response.text();
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
        }

        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projekterfassung.pdf';
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error generating report:', error);
        // Add error handling here (e.g., show error message to user)
      }
    }
  }

  return (
    <main className="container mx-auto py-8 mt-16">
      <h2 className="text-2xl font-bold mb-4">Berichte</h2>
      <div className="flex gap-8">
        <div className="w-1/2">
          <Select onValueChange={(value) => setSelectedReport(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Berichtstyp" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="monatsbericht">Monatsbericht</SelectItem>
              <SelectItem value="projekterfassung">Projekterfassung</SelectItem>
              <SelectItem value="individualbericht">Individualbericht</SelectItem>
            </SelectContent>
          </Select>
          
          {(selectedReport === "projekterfassung") && (
            <div className="mt-4">
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Select Date Range</h3>
                <DatePickerWithRange 
                  {...{
                    date: dateRange,
                    setDate: setDateRange
                  } as any}
                />
              </div>
              <FancyMultiSelect 
                {...{
                  value: selectedProjects,
                  onChange: setSelectedProjects
                } as any}
              />
              <Button className="mt-4" onClick={handleGenerateReport}>Generate Report</Button>
            </div>
            
          )}

          {(selectedReport === "individualbericht") && (
            <div className="mt-4">
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Select Date Range</h3>
                <DatePickerWithRange 
                  {...{
                    date: dateRange,
                    setDate: setDateRange
                  } as any}
                />
              </div>
              <FancyMultiSelect />
              <Button className="mt-4">Generate Report</Button>
            </div>
            
          )}

          {selectedReport === "monatsbericht" && (
            <div className="mt-4">
              <MonthYearPicker 
                value={selectedDate}
                onChange={(date: Date | undefined) => setSelectedDate(date)}
              />
              <Button className="mt-4">Generate Report</Button>
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-auto" />

        <div className="w-1/2">
          <div className="prose">
            {selectedReport === "" && (
              <p>Please select a report type to see more information.</p>
            )}
            {selectedReport === "projekterfassung" && (
              <div>
                <h1 className="font-semibold mb-4">Projekterfassung</h1>
                <p>Die Projekterfassung lässt einen spezifischen Bericht über ausgewählte Projekte erstellen in einem bestimmten Zeitraum:</p>
                <p>Zeitraum auswählen &rarr; Projekte auswählen &rarr; Generate Report Button</p>
              </div>
            )}
            {selectedReport === "monatsbericht" && (
              <div>
                <h1 className="font-semibold mb-4">Monatsbericht</h1>
                <p>Der Monatsbericht gibt einen Überblick über alle Aktivitäten eines Monats:</p>
                <p>Zeigt an in welchen aktiven Projekten gearbeitet wurde und wie viele Stunden dafür geleistet wurden.</p>
                <br></br>
                <p>Monat/Jahr auswählen &rarr; Generate Report Button</p>
              </div>
            )}
            {selectedReport === "individualbericht" && (
              <div>
                <h1 className="font-semibold mb-4">Individualbericht</h1>
                <p>Der Individualbericht erstellt einen Bericht für ein bestimmtes Projekt, in welchem die geleistete Arbeit mitsamt Personio Kommentare aufgelistet wird:</p>
                <br></br>
                <p>Nach Absprache mit IT, kann für einzelne Projekte auch ein Template hinterlegt werden, auf dessen Basis der Bericht generiert werden soll.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}