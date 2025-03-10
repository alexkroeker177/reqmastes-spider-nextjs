interface Credentials {
  clientId: string;
  clientSecret: string;
}

interface TokenInfo {
  token: string;
  expiresAt: number;
}

interface Employee {
  ID: number;
  FirstName: string;
  LastName: string;
}

interface Project {
  ID: number;
  Name: string;
  Active: boolean;
  CreatedAt: number;
  UpdatedAt: number;
}

interface Attendance {
  Employee: number;
  Project: number;
  Date: string;
  StartTime: string;
  EndTime: string;
  DurationNet: number;
  Break: number;
  Comment: string;
}

interface PersonioResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: Record<string, any>;
}

export class PersonioClient {
  private credentials: Credentials;
  private tokenInfo: TokenInfo | null;
  private static tokenCache: Map<string, TokenInfo> = new Map();
  // Token will be refreshed 5 minutes before expiration
  private static TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
  // Token expires in 24 hours
  private static TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(credentials: Credentials) {
    this.credentials = credentials;
    this.tokenInfo = null;
    
    // Try to get cached token for these credentials
    const cacheKey = this.getCacheKey();
    const cachedToken = PersonioClient.tokenCache.get(cacheKey);
    if (cachedToken && this.isTokenValid(cachedToken)) {
      this.tokenInfo = cachedToken;
    }
  }

  private getCacheKey(): string {
    return `${this.credentials.clientId}:${this.credentials.clientSecret}`;
  }

  private isTokenValid(tokenInfo: TokenInfo): boolean {
    const now = Date.now();
    return tokenInfo.expiresAt - now > PersonioClient.TOKEN_REFRESH_THRESHOLD;
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.tokenInfo || !this.isTokenValid(this.tokenInfo)) {
      await this.refreshToken();
    }
  }

  private async makeHTTPRequest<T>(url: string, options: RequestInit): Promise<PersonioResponse<T>> {
    try {
      const response = await fetch(url, options);
      
      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType}`);
      }

      const data = await response.json();
      return data as PersonioResponse<T>;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error making HTTP request: ${message}`);
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const requestBody = JSON.stringify({
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
      });

      const options = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: requestBody,
      };

      const response = await this.makeHTTPRequest<{ token: string }>('https://api.personio.de/v1/auth', options);

      if (!response.success) {
        throw new Error(`[${response.error?.code}] ${response.error?.message}`);
      }

      if (!response.data?.token) {
        throw new Error('No token received in response');
      }

      // Create new token info with expiration
      const newTokenInfo = {
        token: response.data.token,
        expiresAt: Date.now() + PersonioClient.TOKEN_EXPIRATION
      };

      // Update instance token and cache
      this.tokenInfo = newTokenInfo;
      PersonioClient.tokenCache.set(this.getCacheKey(), newTokenInfo);

      console.log('Token refreshed and cached');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error refreshing token: ${message}`);
    }
  }

  private async apiCall<T>(
    method: string,
    call: string,
    params?: Record<string, string>,
    reqStruct?: any,
    respStruct?: any,
    metaStruct?: any
  ): Promise<PersonioResponse<T>> {
    try {
      await this.ensureValidToken();

      const queryParams = params ? new URLSearchParams(params).toString() : '';
      const url = `https://api.personio.de/${call}${queryParams ? `?${queryParams}` : ''}`;

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenInfo?.token}`
      };

      const options = {
        method,
        headers,
        body: reqStruct ? JSON.stringify(reqStruct) : undefined
      };

      const response = await this.makeHTTPRequest<T>(url, options);

      if (!response.success) {
        // If token is invalid, clear it and retry once
        if (response.error?.code === 'INVALID_TOKEN') {
          this.tokenInfo = null;
          PersonioClient.tokenCache.delete(this.getCacheKey());
          await this.ensureValidToken();
          return this.apiCall(method, call, params, reqStruct, respStruct, metaStruct);
        }
        throw new Error(`[${response.error?.code}] ${response.error?.message}`);
      }

      if (respStruct) {
        Object.assign(respStruct, response.data || {});
      }

      if (metaStruct) {
        Object.assign(metaStruct, response.metadata || {});
      }

      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error making API call: ${message}`);
    }
  }

  async getEmployees(): Promise<Employee[]> {
    try {
      let respStruct: any[] = [];
      await this.apiCall('GET', 'v1/company/employees', { limit: '200' }, null, respStruct, null);

      return respStruct.map((respEmployee) => ({
        ID: parseInt(respEmployee.attributes.id.value),
        FirstName: String(respEmployee.attributes.first_name.value),
        LastName: String(respEmployee.attributes.last_name.value),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error getting employees: ${message}`);
    }
  }

  async getProjects(active?: boolean): Promise<Project[]> {
    try {
      let respStruct: any[] = [];
      await this.apiCall('GET', 'v1/company/attendances/projects', undefined, null, respStruct, null);

      return respStruct
        .map((respProject) => {
          const project = {
            ID: respProject.id,
            Name: String(respProject.attributes.name),
            Active: Boolean(respProject.attributes.active),
            CreatedAt: new Date(respProject.attributes.created_at).getTime() / 1000,
            UpdatedAt: new Date(respProject.attributes.updated_at).getTime() / 1000,
          };

          return active && !project.Active ? null : project;
        })
        .filter((project): project is Project => project !== null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error getting projects: ${message}`);
    }
  }

  async getEmployeeNameFromID(id: number, employees: Employee[]): Promise<string> {
    const employee = employees.find(emp => emp.ID === id);
    return employee ? `${employee.FirstName} ${employee.LastName}` : "Employee not found";
  }

  async getProjectIdByName(projectName: string): Promise<number | null> {
    try {
      let respStruct: any[] = [];
      await this.apiCall('GET', 'v1/company/attendances/projects', undefined, null, respStruct, null);

      const project = respStruct.find(project =>
        project.attributes.name.includes(projectName)
      );

      return project ? project.id : null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error getting project ID: ${message}`);
    }
  }

  async getProjectNameById(id: number): Promise<string | null> {
    try {
      let respStruct: any[] = [];
      await this.apiCall('GET', 'v1/company/attendances/projects', undefined, null, respStruct, null);

      const project = respStruct.find(project => project.id === id);
      return project ? project.attributes.name : null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error getting project name: ${message}`);
    }
  }

  async getAttendances(projectID: number, startDate: string, endDate: string, confirmed: boolean): Promise<Attendance[]> {
    try {
      let attendances: Attendance[] = [];
      let page = 0;

      while (true) {
        const params: Record<string, string> = {
          start_date: startDate,
          end_date: endDate,
          offset: `${page * 200}`,
          limit: '200',
        };

        if (!confirmed) {
          params.include_pending = 'true';
        }

        const meta = {
          total_elements: 0,
          current_page: 0,
          total_pages: 0,
        };

        let respStruct: any[] = [];
        await this.apiCall('GET', 'v1/company/attendances', params, null, respStruct, meta);

        if (respStruct.length === 0) {
          break;
        }

        for (const respAttendance of respStruct) {
          const attendance: Attendance = {
            Employee: respAttendance.attributes.employee,
            Project: respAttendance.attributes.project?.id || 0,
            Date: respAttendance.attributes.date || '',
            StartTime: respAttendance.attributes.start_time || '',
            EndTime: respAttendance.attributes.end_time || '',
            DurationNet: 0,
            Break: respAttendance.attributes.break || 0,
            Comment: respAttendance.attributes.comment || '',
          };

          if (respAttendance.attributes.start_time && respAttendance.attributes.end_time) {
            const start = new Date(`1970-01-01T${respAttendance.attributes.start_time}Z`);
            const end = new Date(`1970-01-01T${respAttendance.attributes.end_time}Z`);
            const durationMins = (end.getTime() - start.getTime()) / (1000 * 60);
            attendance.DurationNet = durationMins / 60 - attendance.Break;
          }

          if (projectID !== 0 && attendance.Project !== projectID) {
            continue;
          }
          attendances.push(attendance);
        }

        if (page * 200 >= meta.total_elements) {
          break;
        }

        page++;
      }

      return attendances;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error getting attendances: ${message}`);
    }
  }
}