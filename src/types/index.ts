/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum StudentStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late'
}

export interface Student {
  id?: number;
  fullName: string;
  photo?: string; // Base64
  fatherName: string;
  motherName: string;
  mobileNumber: string;
  guardianNumber: string;
  schoolCollegeName: string;
  className: string;
  group: string;
  rollNumber: string;
  registrationNumber: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: string;
  address: string;
  admissionDate: string;
  monthlyTuitionFee: number;
  status: StudentStatus;
  notes: string;
  createdAt: number;
}

export interface Attendance {
  id?: number;
  studentId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface TuitionFee {
  id?: number;
  studentId: number;
  month: string; // YYYY-MM
  amount: number;
  paymentDate: string;
  status: 'Paid' | 'Unpaid';
  transactionId?: string;
}

export interface Exam {
  id?: number;
  title: string;
  date: string;
  totalMarks: number;
}

export interface ExamResult {
  id?: number;
  examId: number;
  studentId: number;
  marksObtained: number;
  grade: string;
  gpa: number;
  rank?: number;
  remarks?: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  todayAttendance: number;
  dueFees: number;
  totalIncome: number;
  monthlyIncome: number;
}
