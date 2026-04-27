# ==========================================
# Roo Code / Gemini Agent Setup Script
# ==========================================

# 0. Admin Promotion
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Requesting Administrator privileges..." -ForegroundColor Yellow
    $args = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$PSCommandPath")
    Start-Process powershell.exe -ArgumentList $args -Verb RunAs -WorkingDirectory $PSScriptRoot
    exit
}

# Fix Current Directory
Set-Location -Path $PSScriptRoot
$CUR = $PSScriptRoot
$COM = "C:\AI\mcp_manager\shared_configs"
$AGT = ".agent"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Roo Code / Gemini Agent Setup Script" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "INFO: Target Directory: $CUR"

# 1. Directory
if (-not (Test-Path -Path $AGT)) {
    New-Item -ItemType Directory -Path $AGT -Force | Out-Null
    Write-Host "OK: Created directory: $AGT" -ForegroundColor Green
}

# Function: mklink wrapper
function Create-Link {
    param ( [string]$LinkName, [string]$Target )
    $Full = Join-Path $CUR $LinkName
    if (Test-Path $Full) {
        $item = Get-Item $Full
        if ($item.Attributes.ToString().Contains("ReparsePoint")) {
             Write-Host "SKIP: Link already exists: $LinkName" -ForegroundColor Gray
             return
        } else {
             Write-Host "WARN: File/Directory exists (Not a link): $LinkName" -ForegroundColor Yellow
             return
        }
    }
    if (-not (Test-Path $Target)) {
        Write-Host "ERROR: Target not found: $Target" -ForegroundColor Red
        return
    }
    Write-Host "EXEC: Creating link for $LinkName..."
    $isDir = (Get-Item $Target).PSIsContainer
    if ($isDir) {
        cmd /c mklink /d "$Full" "$Target"
    } else {
        cmd /c mklink "$Full" "$Target"
    }
}

# 2. Linking
Write-Host "
INFO: Linking common configuration files..."
Create-Link -LinkName ".agent\common_gemini.md" -Target "$COM\.agent\common_gemini.md"
Create-Link -LinkName ".agent\common_rule.md"   -Target "$COM\.agent\common_rule.md"
Create-Link -LinkName ".agent\common_skill_context.md" -Target "$COM\.agent\common_skill_context.md"
Create-Link -LinkName ".agent\templates"       -Target "$COM\.agent\templates"
Create-Link -LinkName ".clinerules"             -Target "$COM\.clinerules"

# 3. Context Template
$ProjectContextPath = Join-Path $CUR ".agent\project_context.md"
if (-not (Test-Path $ProjectContextPath)) {
    Write-Host "
INFO: Creating template for project_context.md..."
    $ctx = "# Project Context`n`n## 1. Overview`n- Describe the project's purpose here."
    $ctx | Out-File -FilePath $ProjectContextPath -Encoding utf8
    Write-Host "OK: Created template for project_context.md" -ForegroundColor Green
}

# 4. Rule Template
$ProjectRulePath = Join-Path $CUR ".agent\project_rule.md"
if (-not (Test-Path $ProjectRulePath)) {
    Write-Host "
INFO: Creating template for project_rule.md..."
    $rul = "# Project Specific Rules`n`n> [!IMPORTANT]`n> Use this file for project-specific rules."
    $rul | Out-File -FilePath $ProjectRulePath -Encoding utf8
    Write-Host "OK: Created template for project_rule.md" -ForegroundColor Green
}

# 5. session_start.txt
$SessionStartPath = Join-Path $CUR ".agent\session_start.txt"
if (-not (Test-Path $SessionStartPath)) {
    $ss = "Start session. Read .clinerules first."
    $ss | Out-File -FilePath $SessionStartPath -Encoding utf8
    Write-Host "OK: Created session_start.txt" -ForegroundColor Green
}

Write-Host "
========================================================" -ForegroundColor Cyan
Write-Host "SUCCESS: Setup completed." -ForegroundColor Green
Write-Host "
Press Enter to close." -ForegroundColor Cyan
Read-Host
