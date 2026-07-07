import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService, PatientRecord } from '../../services/patient.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

declare var google: any;

@Component({
  selector: 'app-patient-records',
  templateUrl: './patient-records.component.html',
  styleUrl: './patient-records.component.css'
})
export class PatientRecordsComponent implements OnInit, OnDestroy {
  patients: PatientRecord[] = [];
  filteredPatients: PatientRecord[] = [];
  private subscription: Subscription = new Subscription();

  // Pagination state
  currentPage = 1;
  itemsPerPage = 5;

  isEditModalOpen = false;
  editForm: FormGroup;
  filterForm: FormGroup;
  currentEditingPatientId: string | null = null;

  isViewModalOpen = false;
  selectedPatientHistory: PatientRecord[] = [];
  reportSummary = {
    name: '',
    phone: '',
    totalVisits: 0,
    totalBilled: 0,
    totalBalance: 0,
    firstVisit: ''
  };

  constructor(
    private patientService: PatientService, 
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.editForm = this.fb.group({
      date: ['', Validators.required],
      name: ['', Validators.required],
      phone: ['', Validators.required],
      od: ['', Validators.required],
      os: ['', Validators.required],
      totalBill: [0, Validators.required],
      balance: [0, Validators.required]
    });

    this.filterForm = this.fb.group({
      searchQuery: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.patientService.patients$.subscribe(data => {
        this.patients = data;
        this.applyFilter();
      })
    );

    this.subscription.add(
      this.filterForm.valueChanges.subscribe(() => {
        this.applyFilter();
      })
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  applyFilter() {
    const { searchQuery, startDate, endDate } = this.filterForm.value;
    let filtered = this.patients;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    if (startDate) {
      // input type="date" gives YYYY-MM-DD
      const [year, month, day] = startDate.split('-').map(Number);
      const start = new Date(year, month - 1, day).getTime();
      filtered = filtered.filter(p => new Date(p.date).getTime() >= start);
    }

    if (endDate) {
      const [year, month, day] = endDate.split('-').map(Number);
      const end = new Date(year, month - 1, day).getTime();
      filtered = filtered.filter(p => new Date(p.date).getTime() <= end);
    }

    this.filteredPatients = filtered;
    this.currentPage = 1; // Reset to first page when filter is applied
  }

  // Pagination Getters & Methods
  get paginatedPatients(): PatientRecord[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPatients.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPatients.length / this.itemsPerPage) || 1;
  }

  get showingStartIndex(): number {
    return this.filteredPatients.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get showingEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredPatients.length);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  }

  resetFilter() {
    this.filterForm.reset({
      searchQuery: '',
      startDate: '',
      endDate: ''
    });
    this.filteredPatients = [...this.patients];
    this.currentPage = 1; // Reset to first page on reset filter
  }

  downloadCSV() {
    if (this.filteredPatients.length === 0) {
      this.toastService.showToast('No records to export!', 'error');
      return;
    }

    const headers = ['Date', 'Patient Name', 'Phone', 'Right Eye (OD)', 'Left Eye (OS)', 'Total Bill', 'Balance'];
    
    // Map patient data to CSV format
    const csvData = this.filteredPatients.map(p => {
      // Escape strings containing commas with double quotes
      const escape = (str: string | number) => {
        const val = String(str);
        return val.includes(',') ? `"${val}"` : val;
      };
      return [
        escape(p.date),
        escape(p.name),
        escape(p.phone),
        escape(p.od),
        escape(p.os),
        escape(p.totalBill),
        escape(p.balance)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    
    // Generate a file name with the current date
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `patient_records_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.toastService.showToast('CSV Exported Successfully!', 'success');
  }

  syncToGoogleDrive() {
    if (this.filteredPatients.length === 0) {
      this.toastService.showToast('No records to sync!', 'error');
      return;
    }

    // IMPORTANT: The user must replace this with their actual Client ID
    const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
    
    if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      this.toastService.showToast('Please add your Google Client ID in the code first.', 'error');
      return;
    }

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            this.uploadCsvToDrive(tokenResponse.access_token);
          } else {
            this.toastService.showToast('Failed to authenticate with Google.', 'error');
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch (e) {
      console.error('Google Identity Services not loaded', e);
      this.toastService.showToast('Google services failed to load.', 'error');
    }
  }

  private async uploadCsvToDrive(accessToken: string) {
    this.toastService.showToast('Uploading to Google Drive...', 'success');
    
    // Generate CSV content
    const headers = ['Date', 'Patient Name', 'Phone', 'Right Eye (OD)', 'Left Eye (OS)', 'Total Bill', 'Balance'];
    const csvData = this.filteredPatients.map(p => {
      const escape = (str: string | number) => {
        const val = String(str);
        return val.includes(',') ? `"${val}"` : val;
      };
      return [
        escape(p.date), escape(p.name), escape(p.phone), 
        escape(p.od), escape(p.os), escape(p.totalBill), escape(p.balance)
      ].join(',');
    });
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `VisionCenter_Report_${dateStr}.csv`;

    const metadata = {
      name: fileName,
      mimeType: 'text/csv'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([csvContent], { type: 'text/csv' }));

    try {
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: form
      });

      if (response.ok) {
        this.toastService.showToast('Successfully saved to Google Drive!', 'success');
      } else {
        const err = await response.json();
        console.error('Drive API Error:', err);
        this.toastService.showToast('Error uploading to Drive.', 'error');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      this.toastService.showToast('Network error while uploading.', 'error');
    }
  }

  openViewModal(patient: PatientRecord) {
    // Group by name to simulate patient history
    const history = this.patients
      .filter(p => p.name.toLowerCase() === patient.name.toLowerCase())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    this.selectedPatientHistory = history;
    
    this.reportSummary = {
      name: patient.name,
      phone: patient.phone,
      totalVisits: history.length,
      totalBilled: history.reduce((sum, p) => sum + Number(p.totalBill), 0),
      totalBalance: history.reduce((sum, p) => sum + Number(p.balance), 0),
      firstVisit: history.length > 0 ? history[0].date : 'N/A'
    };
    
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
  }

  openEditModal(patient: PatientRecord) {
    this.currentEditingPatientId = patient.id;
    this.editForm.patchValue({
      date: patient.date,
      name: patient.name,
      phone: patient.phone,
      od: patient.od,
      os: patient.os,
      totalBill: patient.totalBill,
      balance: patient.balance
    });
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.currentEditingPatientId = null;
    this.editForm.reset();
  }

  saveEdit() {
    if (this.editForm.valid && this.currentEditingPatientId) {
      const updatedRecord: PatientRecord = {
        ...this.editForm.value,
        id: this.currentEditingPatientId
      };
      this.patientService.updatePatient(updatedRecord);
      this.toastService.showToast('Patient record updated successfully!', 'success');
      this.closeEditModal();
    }
  }

  deletePatient(patient: PatientRecord) {
    if (confirm(`Are you sure you want to delete ${patient.name}?`)) {
      this.patientService.deletePatient(patient.id);
    }
  }
}
