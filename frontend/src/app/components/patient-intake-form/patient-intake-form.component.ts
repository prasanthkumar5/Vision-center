import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService, PatientRecord } from '../../services/patient.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-intake-form',
  templateUrl: './patient-intake-form.component.html',
  styleUrl: './patient-intake-form.component.css'
})
export class PatientIntakeFormComponent implements OnInit, OnDestroy {
  intakeForm: FormGroup;
  private readonly DRAFT_STORAGE_KEY = 'vision_center_intake_draft';
  private formSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.intakeForm = this.fb.group({
      patientDetails: this.fb.group({
        fullName: [''],
        age: [''],
        gender: [''],
        phoneNumber: ['']
      }),
      billing: this.fb.group({
        totalAmount: ['0.00'],
        amountPaid: ['0.00']
      }),
      visionPrescription: this.fb.group({
        od: this.fb.group({
          sph: ['-0.00'],
          cyl: ['-0.00'],
          axis: ['0'],
          add: ['+0.00'],
          va: ['20/20']
        }),
        os: this.fb.group({
          sph: ['-0.00'],
          cyl: ['-0.00'],
          axis: ['0'],
          add: ['+0.00'],
          va: ['20/20']
        })
      }),
      clinicalNotes: ['']
    });
  }

  ngOnInit() {
    // Load draft from local storage
    const savedDraft = localStorage.getItem(this.DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft) {
          this.intakeForm.patchValue(parsedDraft);
        }
      } catch (e) {
        console.error('Error parsing saved draft', e);
      }
    }

    // Save draft to local storage on changes
    this.formSubscription = this.intakeForm.valueChanges.subscribe(value => {
      localStorage.setItem(this.DRAFT_STORAGE_KEY, JSON.stringify(value));
    });
  }

  ngOnDestroy() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  get balanceDue(): number {
    const total = parseFloat(this.intakeForm.get('billing.totalAmount')?.value) || 0;
    const paid = parseFloat(this.intakeForm.get('billing.amountPaid')?.value) || 0;
    return total - paid;
  }

  savePatientRecord() {
    const formValue = this.intakeForm.value;
    
    this.patientService.addPatient(formValue).subscribe({
      next: () => {
        this.toastService.showToast('Patient record saved successfully!', 'success');
        localStorage.removeItem(this.DRAFT_STORAGE_KEY);
        this.router.navigate(['/patients']);
      },
      error: (err) => {
        console.error('Error saving patient:', err);
        this.toastService.showToast('Failed to save patient record', 'error');
      }
    });
  }
}
