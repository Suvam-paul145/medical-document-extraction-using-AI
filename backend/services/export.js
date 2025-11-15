// Export functions for different formats

export function exportToJSON(result) {
  return JSON.stringify(result, null, 2)
}

export function exportToCSV(result) {
  let csv = 'Category,Field,Value,Confidence\n'
  
  // Patient Info
  if (result.patientInfo) {
    csv += `Patient,Name,${result.patientInfo.name || ''},${result.patientInfo.confidence}\n`
    csv += `Patient,DOB,${result.patientInfo.dateOfBirth || ''},${result.patientInfo.confidence}\n`
    csv += `Patient,ID,${result.patientInfo.patientId || ''},${result.patientInfo.confidence}\n`
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
  
  // Vital Signs
  result.vitalSigns.forEach(vital => {
    csv += `Vital,${vital.type},"${vital.value} ${vital.unit}",${vital.confidence}\n`
  })
  
  return csv
}

export async function exportToPDF(result) {
  // Simplified PDF export - in real app, use a PDF library like pdfkit
  let pdf = `MEDICAL DOCUMENT EXTRACTION REPORT\n`
  pdf += `${'='.repeat(50)}\n\n`
  pdf += `Document ID: ${result.documentId}\n`
  pdf += `Extracted: ${result.extractedAt}\n`
  pdf += `Processing Time: ${result.processingTime}ms\n\n`
  
  if (result.patientInfo) {
    pdf += `PATIENT INFORMATION\n`
    pdf += `${'-'.repeat(50)}\n`
    pdf += `Name: ${result.patientInfo.name || 'N/A'}\n`
    pdf += `DOB: ${result.patientInfo.dateOfBirth || 'N/A'}\n`
    pdf += `Patient ID: ${result.patientInfo.patientId || 'N/A'}\n\n`
  }
  
  if (result.medications.length > 0) {
    pdf += `MEDICATIONS\n`
    pdf += `${'-'.repeat(50)}\n`
    result.medications.forEach((med, i) => {
      pdf += `${i + 1}. ${med.drugName} - ${med.dosage} ${med.frequency}\n`
    })
    pdf += `\n`
  }
  
  if (result.diagnoses.length > 0) {
    pdf += `DIAGNOSES\n`
    pdf += `${'-'.repeat(50)}\n`
    result.diagnoses.forEach((diag, i) => {
      pdf += `${i + 1}. ${diag.condition} (${diag.icdCode || 'N/A'})\n`
    })
    pdf += `\n`
  }
  
  pdf += `\nNote: This is a text-based PDF. For production, use a proper PDF library.\n`
  
  return pdf
}
