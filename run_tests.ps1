Set-Location "c:\Users\USER\Desktop\Hackathon\saypay"
$proc = Start-Process -FilePath "node" -ArgumentList "node_modules/next/dist/bin/next start -p 3005" -PassThru
try {
    Start-Sleep -Seconds 4
    npx playwright test tests/e2e-backend.spec.js tests/new-check-e2e.spec.js
} finally {
    if ($proc -and -not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force
    }
}
