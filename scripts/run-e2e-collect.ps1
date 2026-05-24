# Run Playwright e2e tests for the client and capture logs to ./test-results/e2e.log
# Usage: run from repo root in PowerShell

param(
  [string]$ClientPath = "client",
  [string]$OutFile = "test-results/e2e.log"
)

if (-not (Test-Path $ClientPath)) {
  Write-Error "Client path '$ClientPath' not found. Run this from repo root."
  exit 2
}

if (-not (Test-Path "$ClientPath/package.json")) {
  Write-Error "$ClientPath/package.json not found. Ensure you are in the project root."
  exit 2
}

New-Item -ItemType Directory -Force -Path (Split-Path $OutFile) | Out-Null

Write-Output "Running Playwright e2e (single worker) and saving output to $OutFile"

# Run the e2e command and capture output and exit code
$cmd = "npm --prefix $ClientPath run test:e2e -- --reporter=list --workers=1"
Write-Output "Command: $cmd"

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "cmd.exe"
$psi.Arguments = "/c $cmd"
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true

$proc = New-Object System.Diagnostics.Process
$proc.StartInfo = $psi
$proc.Start() | Out-Null

$stdOut = $proc.StandardOutput.ReadToEnd()
$stdErr = $proc.StandardError.ReadToEnd()

$proc.WaitForExit()
$code = $proc.ExitCode

Set-Content -Path $OutFile -Value ("=== STDOUT ===`n" + $stdOut + "`n=== STDERR ===`n" + $stdErr)

Write-Output "Playwright exit code: $code"
Write-Output "Logs written to: $OutFile"

if ($code -ne 0) { exit $code }
exit 0
