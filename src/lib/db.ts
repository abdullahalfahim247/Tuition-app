import Dexie, { type Table } from 'dexie';
import { Student, Attendance, TuitionFee, Exam, ExamResult } from '../types';

export class AppDatabase extends Dexie {
  students!: Table<Student>;
  attendance!: Table<Attendance>;
  fees!: Table<TuitionFee>;
  exams!: Table<Exam>;
  results!: Table<ExamResult>;

  constructor() {
    super('TuitionManagementDB');
    this.version(1).stores({
      students: '++id, fullName, className, mobileNumber, status',
      attendance: '++id, studentId, date',
      fees: '++id, studentId, month, status',
      exams: '++id, title, date',
      results: '++id, examId, studentId'
    });
  }
}

export const db = new AppDatabase();
