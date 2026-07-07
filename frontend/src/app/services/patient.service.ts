import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface PatientRecord {
  id: string;
  date: string;
  name: string;
  phone: string;
  od: string;
  os: string;
  totalBill: number;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly API_URL = 'http://localhost:5000/api/patients';
  
  private patientsSource = new BehaviorSubject<PatientRecord[]>([]);
  patients$ = this.patientsSource.asObservable();

  constructor(private http: HttpClient) { 
    this.fetchPatients();
  }

  fetchPatients() {
    this.http.get<any[]>(this.API_URL).subscribe({
      next: (data) => {
        const mapped: PatientRecord[] = data.map(p => ({
          id: p._id,
          date: p.date || new Date(p.createdAt).toLocaleDateString(),
          name: p.patientDetails?.fullName || 'N/A',
          phone: p.patientDetails?.phoneNumber || 'N/A',
          od: p.visionPrescription?.od?.va || 'N/A',
          os: p.visionPrescription?.os?.va || 'N/A',
          totalBill: p.billing?.totalAmount || 0,
          balance: (p.billing?.totalAmount || 0) - (p.billing?.amountPaid || 0)
        }));
        this.patientsSource.next(mapped);
      },
      error: (err) => console.error('Error fetching patients:', err)
    });
  }

  addPatient(patientData: any) {
    return this.http.post(this.API_URL, patientData).pipe(
      tap(() => {
        // Refresh the list after successfully adding
        this.fetchPatients();
      })
    );
  }

  updatePatient(updatedPatient: PatientRecord) {
    // Map the flattened record back to the nested backend schema
    const payload = {
      patientDetails: { 
        fullName: updatedPatient.name, 
        phoneNumber: updatedPatient.phone 
      },
      visionPrescription: { 
        od: { va: updatedPatient.od }, 
        os: { va: updatedPatient.os } 
      },
      billing: { 
        totalAmount: updatedPatient.totalBill, 
        amountPaid: updatedPatient.totalBill - updatedPatient.balance 
      },
      date: updatedPatient.date
    };

    this.http.put(`${this.API_URL}/${updatedPatient.id}`, payload).subscribe({
      next: () => this.fetchPatients(),
      error: (err) => console.error('Error updating patient:', err)
    });
  }

  deletePatient(id: string) {
    this.http.delete(`${this.API_URL}/${id}`).subscribe({
      next: () => this.fetchPatients(),
      error: (err) => console.error('Error deleting patient:', err)
    });
  }
}
