import xlsx from 'xlsx';
import path from 'path';

const filePath = path.resolve('SayPay_MVP_Task_Tracker.xlsx');
const wb = xlsx.readFile(filePath);

const trackerSheet = wb.Sheets['MVP Task Tracker'];
if (!trackerSheet) {
  console.error("Sheet 'MVP Task Tracker' not found!");
  process.exit(1);
}

// Convert sheet to json array of arrays with header: 1
const rows = xlsx.utils.sheet_to_json(trackerSheet, { header: 1 });
const headers = rows[0];
console.log('Headers:', headers);

const taskNoIdx = headers.indexOf('Task No');
const assignedToIdx = headers.indexOf('Assigned To');
const statusIdx = headers.indexOf('Status');

console.log(`Indices -> Task No: ${taskNoIdx}, Assigned To: ${assignedToIdx}, Status: ${statusIdx}`);

// Tasks to mark completed
const subashTasks = ['TN-28', 'TN-29', 'TN-30', 'TN-31', 'TN-32', 'TN-33', 'TN-34', 'TN-35'];
const safetyTasks = ['TN-36', 'TN-37', 'TN-38', 'TN-39', 'TN-40', 'TN-41', 'TN-42', 'TN-43'];
const paypalBackendTasks = ['TN-48', 'TN-49', 'TN-50', 'TN-51', 'TN-55', 'TN-56', 'TN-58', 'TN-59', 'TN-60', 'TN-61'];

let updatedCount = 0;

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row || !row[taskNoIdx]) continue;
  const taskNo = String(row[taskNoIdx]).trim();

  if (subashTasks.includes(taskNo)) {
    row[statusIdx] = 'Completed';
    row[assignedToIdx] = 'Subash';
    console.log(`Updated ${taskNo}: AssignedTo=Subash, Status=Completed`);
    updatedCount++;
  } else if (safetyTasks.includes(taskNo)) {
    row[statusIdx] = 'Completed';
    row[assignedToIdx] = 'Ronald';
    console.log(`Updated ${taskNo}: AssignedTo=Ronald, Status=Completed`);
    updatedCount++;
  } else if (paypalBackendTasks.includes(taskNo)) {
    row[statusIdx] = 'Completed';
    row[assignedToIdx] = 'Ronald';
    console.log(`Updated ${taskNo}: AssignedTo=Ronald, Status=Completed`);
    updatedCount++;
  }
}

// Re-write to sheet
const newSheet = xlsx.utils.aoa_to_sheet(rows);
wb.Sheets['MVP Task Tracker'] = newSheet;

// Update Progress Summary sheet if present
const summarySheet = wb.Sheets['Progress Summary'];
if (summarySheet) {
  const summaryRows = xlsx.utils.sheet_to_json(summarySheet, { header: 1 });
  console.log('Summary rows before update:', summaryRows.slice(0, 8));

  // Count statuses
  let totalTasks = 0;
  let completedTasks = 0;
  let pendingTasks = 0;
  let inProgressTasks = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[taskNoIdx]) continue;
    totalTasks++;
    const st = String(row[statusIdx] || '').trim().toLowerCase();
    if (st === 'completed') completedTasks++;
    else if (st === 'in progress') inProgressTasks++;
    else pendingTasks++;
  }

  console.log(`Calculated counts: Total=${totalTasks}, Completed=${completedTasks}, InProgress=${inProgressTasks}, Pending=${pendingTasks}`);

  for (const sRow of summaryRows) {
    if (!sRow || !sRow[0]) continue;
    const label = String(sRow[0]).trim().toLowerCase();
    if (label.includes('total tasks')) sRow[1] = totalTasks;
    if (label === 'completed') sRow[1] = completedTasks;
    if (label === 'in progress') sRow[1] = inProgressTasks;
    if (label === 'pending') sRow[1] = pendingTasks;
  }

  wb.Sheets['Progress Summary'] = xlsx.utils.aoa_to_sheet(summaryRows);
}

xlsx.writeFile(wb, filePath);
console.log(`✅ Successfully updated ${updatedCount} tasks in ${filePath}`);
