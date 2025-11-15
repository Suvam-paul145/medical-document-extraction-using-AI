import fs from 'fs/promises'
import path from 'path'

// Simulated extraction process
export async function processDocument(document, onProgress, emitItemExtracted = null) {
  const stages = [
    { name: 'ocr', duration: 2000, progress: 20 },
    { name: 'analyzing', duration: 2000, progress: 50 },
    { name: 'extracting', duration: 3000, progress: 80 },
    { name: 'validating', duration: 1000, progress: 100 }
  ]

  const result = {
    documentId: document.id,
    patientInfo: {
      name: 'John Doe',
      dateOfBirth: '1980-05-15',
      patientId: 'P12345',
      age: 44,
      gender: 'Male',
      confidence: 0.95
    },
    medications: [
      {
        drugName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        route: 'Oral',
        confidence: 0.92
      },
      {
        drugName: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '30 days',
        route: 'Oral',
        confidence: 0.88
      }
    ],
    diagnoses: [
      {
        condition: 'Hypertension',
        icdCode: 'I10',
        diagnosedDate: '2024-01-15',
        severity: 'Moderate',
        confidence: 0.90
      },
      {
        condition: 'Type 2 Diabetes',
        icdCode: 'E11',
        diagnosedDate: '2023-06-20',
        severity: 'Controlled',
        confidence: 0.93
      }
    ],
    labResults: [
      {
        testName: 'Blood Glucose',
        value: '110',
        unit: 'mg/dL',
        referenceRange: '70-100',
        status: 'abnormal',
        confidence: 0.96
      },
      {
        testName: 'HbA1c',
        value: '6.5',
        unit: '%',
        referenceRange: '<5.7',
        status: 'abnormal',
        confidence: 0.94
      }
    ],
    vitalSigns: [
      {
        type: 'Blood Pressure',
        value: '130/85',
        unit: 'mmHg',
        confidence: 0.91
      },
      {
        type: 'Heart Rate',
        value: '72',
        unit: 'bpm',
        confidence: 0.95
      }
    ],
    physicianInfo: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Internal Medicine',
      licenseNumber: 'MD12345',
      confidence: 0.89
    },
    extractedAt: new Date().toISOString(),
    processingTime: 0
  }

  const startTime = Date.now()

  // Simulate processing stages
  for (const stage of stages) {
    onProgress({
      documentId: document.id,
      stage: stage.name,
      progress: stage.progress,
      currentActivity: `Processing ${stage.name}...`
    })

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, stage.duration))

    // Emit some extracted items during extraction stage
    if (stage.name === 'extracting') {
      await simulateItemExtraction(document.id, result, emitItemExtracted)
    }
  }

  result.processingTime = Date.now() - startTime

  return result
}

async function simulateItemExtraction(documentId, result, emitItemExtracted) {
  // Simulate gradual extraction of items
  const items = [
    { category: 'medication', item: result.medications[0] },
    { category: 'diagnosis', item: result.diagnoses[0] },
    { category: 'labResult', item: result.labResults[0] },
    { category: 'medication', item: result.medications[1] },
    { category: 'diagnosis', item: result.diagnoses[1] },
    { category: 'labResult', item: result.labResults[1] },
    { category: 'vitalSign', item: result.vitalSigns[0] },
    { category: 'vitalSign', item: result.vitalSigns[1] }
  ]

  for (const extracted of items) {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Emit item extracted event
    if (emitItemExtracted) {
      emitItemExtracted({
        documentId,
        category: extracted.category,
        item: extracted.item
      })
    }
  }
}

// Export functions
export function exportToJSON(result) {
  return JSON.stringify(result, null, 2)
}

export function exportToCSV(result) {
  let csv = 'Category,Field,Value,Confidence\n'
  
  // Patient Info
  if (result.patientInfo) {
    csv += `Patient,Name,${result.patientInfo.name},${result.patientInfo.confidence}\n`
    csv += `Patient,DOB,${result.patientInfo.dateOfBirth},${result.patientInfo.confidence}\n`
    csv += `Patient,ID,${result.patientInfo.patientId},${result.patientInfo.confidence}\n`
  }
  
  // Medications
  result.medications.forEach(med => {
    csv += `Medication,${med.drugName},"${med.dosage} ${med.frequency}",${med.confidence}\n`
  })
  
  // Diagnoses
  result.diagnoses.forEach(diag => {
    csv += `Diagnosis,${diag.condition},${diag.icdCode || ''},${diag.confidence}\n`
  })
  
  // Lab Results
  result.labResults.forEach(lab => {
    csv += `Lab,${lab.testName},"${lab.value} ${lab.unit}",${lab.confidence}\n`
  })
  
  return csv
}

export async function exportToPDF(result) {
  // Simplified PDF export - in real app, use a PDF library
  return `Medical Document Extraction Report\n\nDocument ID: ${result.documentId}\nExtracted: ${result.extractedAt}\n\nThis is a placeholder. Use a PDF library like pdfkit for real PDF generation.`
}
