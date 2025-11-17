// Export functions for different formats

export function exportToJSON(result) {
  return JSON.stringify(result, null, 2)
}

export function exportToCSV(result) {
  let csv = 'Category,Item,Details,Confidence\n'
  
  // Patient Info
  if (result.patient) {
    const patient = result.patient
    csv += `Patient,Name,"${patient.firstName || ''} ${patient.lastName || ''}",${patient.confidence || 0.8}\n`
    csv += `Patient,DOB,${patient.dateOfBirth || ''},${patient.confidence || 0.8}\n`
    csv += `Patient,Gender,${patient.gender || ''},${patient.confidence || 0.8}\n`
    csv += `Patient,MRN,${patient.mrn || ''},${patient.confidence || 0.8}\n`
  }
  
  // Medications
  if (result.medications && Array.isArray(result.medications)) {
    result.medications.forEach(med => {
      const details = `${med.dosage || ''} ${med.unit || ''} ${med.frequency || ''}`
      csv += `Medication,"${med.name || ''}","${details}",${med.confidence || 0.8}\n`
    })
  }
  
  // Diagnoses
  if (result.diagnoses && Array.isArray(result.diagnoses)) {
    result.diagnoses.forEach(diag => {
      csv += `Diagnosis,"${diag.name || ''}","ICD: ${diag.icd10 || 'N/A'}, Severity: ${diag.severity || 'N/A'}",${diag.confidence || 0.8}\n`
    })
  }
  
  // Lab Results
  if (result.labTests && Array.isArray(result.labTests)) {
    result.labTests.forEach(lab => {
      csv += `Lab Test,"${lab.name || ''}","Value: ${lab.value || ''} ${lab.unit || ''}, Range: ${lab.referenceRange || ''}",${lab.confidence || 0.8}\n`
    })
  }
  
  // Vital Signs
  if (result.vitals && typeof result.vitals === 'object') {
    Object.entries(result.vitals).forEach(([key, value]) => {
      if (key !== 'confidence') {
        csv += `Vital Signs,${key},${value},${result.vitals.confidence || 0.8}\n`
      }
    })
  }
  
  return csv
}

export async function exportToPDF(result) {
  // Simplified PDF export - in real app, use a PDF library like pdfkit
  let pdf = `MEDICAL DOCUMENT EXTRACTION REPORT\n`
  pdf += `${'='.repeat(60)}\n\n`
  pdf += `Document ID: ${result.documentId}\n`
  pdf += `Document Type: ${result.documentType || 'Unknown'}\n`
  pdf += `Extracted: ${result.extractedAt || new Date().toISOString()}\n`
  pdf += `Confidence: ${(result.confidence * 100).toFixed(1)}%\n\n`
  
  if (result.patient) {
    pdf += `PATIENT INFORMATION\n`
    pdf += `${'-'.repeat(60)}\n`
    pdf += `Name: ${result.patient.firstName || ''} ${result.patient.lastName || ''}\n`
    pdf += `DOB: ${result.patient.dateOfBirth || 'N/A'}\n`
    pdf += `Age: ${result.patient.age || 'N/A'}\n`
    pdf += `Gender: ${result.patient.gender || 'N/A'}\n`
    pdf += `MRN: ${result.patient.mrn || 'N/A'}\n\n`
  }
  
  if (result.medications && result.medications.length > 0) {
    pdf += `MEDICATIONS\n`
    pdf += `${'-'.repeat(60)}\n`
    result.medications.forEach((med, i) => {
      pdf += `${i + 1}. ${med.name || 'N/A'}\n`
      pdf += `   Dosage: ${med.dosage || 'N/A'} ${med.unit || ''}\n`
      pdf += `   Frequency: ${med.frequency || 'N/A'}\n`
      pdf += `   Route: ${med.route || 'N/A'}\n`
      pdf += `   Indication: ${med.indication || 'N/A'}\n`
      pdf += `   Confidence: ${(med.confidence * 100).toFixed(1)}%\n\n`
    })
  }
  
  if (result.diagnoses && result.diagnoses.length > 0) {
    pdf += `DIAGNOSES\n`
    pdf += `${'-'.repeat(60)}\n`
    result.diagnoses.forEach((diag, i) => {
      pdf += `${i + 1}. ${diag.name || 'N/A'}\n`
      pdf += `   ICD-10: ${diag.icd10 || 'N/A'}\n`
      pdf += `   Severity: ${diag.severity || 'N/A'}\n`
      pdf += `   Confidence: ${(diag.confidence * 100).toFixed(1)}%\n\n`
    })
  }

  if (result.labTests && result.labTests.length > 0) {
    pdf += `LABORATORY RESULTS\n`
    pdf += `${'-'.repeat(60)}\n`
    result.labTests.forEach((lab, i) => {
      pdf += `${i + 1}. ${lab.name || 'N/A'}\n`
      pdf += `   Value: ${lab.value || 'N/A'} ${lab.unit || ''}\n`
      pdf += `   Reference Range: ${lab.referenceRange || 'N/A'}\n`
      pdf += `   Status: ${lab.status || 'N/A'}\n`
      pdf += `   Confidence: ${(lab.confidence * 100).toFixed(1)}%\n\n`
    })
  }

  if (result.vitals && typeof result.vitals === 'object' && Object.keys(result.vitals).length > 0) {
    pdf += `VITAL SIGNS\n`
    pdf += `${'-'.repeat(60)}\n`
    Object.entries(result.vitals).forEach(([key, value]) => {
      if (key !== 'confidence') {
        pdf += `${key}: ${value}\n`
      }
    })
    pdf += `\n`
  }
  
  pdf += `\n${'-'.repeat(60)}\n`
  pdf += `Generated: ${new Date().toISOString()}\n`
  pdf += `Note: This is a text-based report. For production, use a proper PDF library.\n`
  
  return pdf
}

