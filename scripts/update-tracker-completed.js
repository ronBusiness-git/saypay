import xlsx from 'xlsx';
import path from 'path';

const filePath = path.resolve('SayPay_MVP_Task_Tracker.xlsx');
const wb = xlsx.readFile(filePath);

const trackerSheet = wb.Sheets['MVP Task Tracker'];
if (!trackerSheet) {
  console.error("Sheet 'MVP Task Tracker' not found!");
  process.exit(1);
}

const rows = xlsx.utils.sheet_to_json(trackerSheet, { header: 1 });
const headers = rows[0];

const taskNoIdx = headers.indexOf('Task No');
const assignedToIdx = headers.indexOf('Assigned To');
const statusIdx = headers.indexOf('Status');

// Newly completed tasks
const newCompletedTasks = [
  'TN-44', 'TN-45', 'TN-46', 'TN-47', 'TN-48', 'TN-50',
  'TN-63', 'TN-64', 'TN-65'
];

let updatedCount = 0;

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row || !row[taskNoIdx]) continue;
  const taskNo = String(row[taskNoIdx]).trim();

  if (newCompletedTasks.includes(taskNo)) {
    row[statusIdx] = 'Completed';
    row[assignedToIdx] = 'Ronald';
    console.log(`Updated ${taskNo}: AssignedTo=Ronald, Status=Completed`);
    updatedCount++;
  }
}

// Re-write to sheet
wb.Sheets['MVP Task Tracker'] = xlsx.utils.aoa_to_sheet(rows);

// Update Progress Summary sheet if present
const summarySheet = wb.Sheets['Progress Summary'];
if (summarySheet) {
  const summaryRows = xlsx.utils.sheet_to_json(summarySheet, { header: 1 });

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
console.log(`✅ Successfully updated ${updatedCount} additional tasks in ${filePath}`);
