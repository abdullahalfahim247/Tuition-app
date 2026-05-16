import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateQRValue(student: any) {
  return JSON.stringify({
    id: student.id,
    name: student.fullName,
    roll: student.rollNumber,
    reg: student.registrationNumber
  });
}
