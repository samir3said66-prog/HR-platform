/**
 * Employee Model
 * Feature-specific employee model with extended properties
 */

import { Employee } from '../../../core/models/employee.model';

export interface EmployeeDetail extends Employee {
  // Extended employee properties
  bio?: string;
  skills?: string[];
  certifications?: Certification[];
  performanceRating?: number;
  lastReviewDate?: Date;
  reportingManager?: string;
  directReports?: string[];
  salary?: number;
  currency?: string;
  benefits?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface EmployeeFormData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  manager?: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
}
