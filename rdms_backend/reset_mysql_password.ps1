if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Requesting Administrator privileges..."
    Start-Process PowerShell -Verb RunAs "-NoProfile -ExecutionPolicy Bypass -Command `"cd '$PWD'; & '.\reset_mysql_password.ps1'`""
    exit
}

Write-Host "==============================================="
Write-Host "  RDMS MySQL Password Reset Utility"
Write-Host "==============================================="
Write-Host ""
Write-Host "Stopping MySQL80 Service (this might take a few seconds)..."
Stop-Service -Name "MySQL80" -Force -ErrorAction SilentlyContinue
taskkill /F /IM mysqld.exe /T 2>$null

Write-Host "Creating password reset file..."
$initFile = "C:\mysql-init.txt"
"ALTER USER 'root'@'localhost' IDENTIFIED BY 'AliAhmad786';" | Out-File -FilePath $initFile -Encoding ASCII

Write-Host "Applying new password (AliAhmad786)..."
$mysqld = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
$process = Start-Process -FilePath $mysqld -ArgumentList "--init-file=`"$initFile`"" -PassThru -NoNewWindow
Write-Host "Waiting 15 seconds for MySQL to process the reset..."
Start-Sleep -Seconds 15

Write-Host "Cleaning up temporary processes..."
Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
taskkill /F /IM mysqld.exe /T 2>$null
Remove-Item $initFile -Force -ErrorAction SilentlyContinue

Write-Host "Starting MySQL80 Service normally..."
Start-Service -Name "MySQL80"

Write-Host ""
Write-Host "==============================================="
Write-Host " SUCCESS! Your MySQL root password is now:"
Write-Host " AliAhmad786"
Write-Host "==============================================="
Write-Host "You can close this window now and test it in MySQL Workbench."
Start-Sleep -Seconds 10
