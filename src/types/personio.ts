export interface PersonioAttribute {
    value: string | number
    label?: string
    type?: string
  }
  
  export interface PersonioEmployee {
    attributes: {
      id: PersonioAttribute
      first_name: PersonioAttribute
      last_name: PersonioAttribute
      [key: string]: PersonioAttribute
    }
  }
  
  export interface Employee {
    id: number
    firstName: string
    lastName: string
  }

  export interface PersonioProject {
    id: string | number
    attributes: {
      name: string
      active?: boolean
      created_at: string
      updated_at: string
    }
  }
  
  export interface Project {
    id: number
    name: string
    active: boolean
    createdAt: number  // Unix timestamp
    updatedAt: number  // Unix timestamp
  }

  export interface AttendanceResponse {
    id: number
    type: string
    attributes: {
      date: string
      duration: number
      break_duration: number
      project_id: number
      employee_id: number
      comment?: string
    }
  }
  
  export interface Attendance {
    id: number
    date: string
    duration: number
    breakDuration: number
    projectId: number
    employeeId: number
    comment?: string
  }