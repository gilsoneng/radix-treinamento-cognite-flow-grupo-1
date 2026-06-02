#Requires -Version 5.1
<#
.SYNOPSIS
  Creates EPIC + sub-issues for InField Challenge (specs 001-004).

.USAGE
  # 1) Crie PAT em https://github.com/settings/tokens (scope: repo)
  # 2) No PowerShell, na pasta ipaper-checklist-management:
  $env:GH_TOKEN = "ghp_xxxxxxxx"
  ./scripts/create-github-issues.ps1

  Assignees sao omitidos por padrao — atribua no GitHub depois.
  Para assign automatico: $env:ASSIGN_ISSUE_OWNERS = "1"
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Repo = "gilsoneng/radix-treinamento-cognite-flow-grupo-1"
$AppRoot = Split-Path $PSScriptRoot -Parent
$EnvFile = Join-Path $AppRoot ".env"

function Get-TokenFromEnvFile {
  if (-not (Test-Path $EnvFile)) { return $null }
  foreach ($line in Get-Content $EnvFile -ErrorAction SilentlyContinue) {
    if ($line -match '^\s*GH_TOKEN\s*=\s*(.+)\s*$') { return $Matches[1].Trim().Trim('"').Trim("'") }
    if ($line -match '^\s*GITHUB_TOKEN\s*=\s*(.+)\s*$') { return $Matches[1].Trim().Trim('"').Trim("'") }
  }
  return $null
}

$Token = if ($env:GH_TOKEN) { $env:GH_TOKEN } elseif ($env:GITHUB_TOKEN) { $env:GITHUB_TOKEN } else { Get-TokenFromEnvFile }
if (-not $Token) {
  Write-Error @"
GitHub PAT nao encontrado.

Onde configurar (escolha uma):
  A) PowerShell (sessao atual):
     `$env:GH_TOKEN = 'ghp_...'
     ./scripts/create-github-issues.ps1

  B) Arquivo ipaper-checklist-management/.env (nao commitar):
     GH_TOKEN=ghp_...

Criar PAT: https://github.com/settings/tokens/new
  - Note: ipaper-checklist-management issues
  - Expiration: conforme politica do time
  - Scopes: repo (ou public_repo se repo publico)
"@
}

$SkipAssignees = -not ($env:ASSIGN_ISSUE_OWNERS -eq "1")
if ($SkipAssignees) {
  Write-Host "Assignees: omitidos (defina ASSIGN_ISSUE_OWNERS=1 para assign automatico)" -ForegroundColor Yellow
}

$Assignees = @{
  Joao      = if ($env:ASSIGNEE_JOAO) { $env:ASSIGNEE_JOAO } else { "joaomacedx" }
  Guilherme = if ($env:ASSIGNEE_GUILHERME) { $env:ASSIGNEE_GUILHERME } else { $null }
  Caio      = if ($env:ASSIGNEE_CAIO) { $env:ASSIGNEE_CAIO } else { "LandimRadix" }
}

function Resolve-Logins {
  param([string[]]$Names)
  $logins = [System.Collections.Generic.List[string]]::new()
  foreach ($n in $Names) {
    if ($n -match "Jo") { if ($Assignees.Joao) { $logins.Add($Assignees.Joao) } }
    if ($n -match "Guilherme") { if ($Assignees.Guilherme) { $logins.Add($Assignees.Guilherme) } }
    if ($n -match "Caio") { if ($Assignees.Caio) { $logins.Add($Assignees.Caio) } }
  }
  return ($logins | Select-Object -Unique)
}

function Invoke-CreateIssue {
  param(
    [string]$Title,
    [string]$Body,
    [string[]]$Labels,
    [string[]]$AssigneeNames = @()
  )
  $payload = [ordered]@{
    title  = $Title
    body   = $Body
    labels = $Labels
  }
  $logins = @()
  if (-not $SkipAssignees) {
    $logins = Resolve-Logins -Names $AssigneeNames
  }
  if ($logins.Count -gt 0) { $payload.assignees = $logins }

  $headers = @{
    Authorization        = "Bearer $Token"
    Accept               = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
  }
  $uri = "https://api.github.com/repos/$Repo/issues"
  $json = $payload | ConvertTo-Json -Depth 6 -Compress
  $r = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $json -ContentType "application/json; charset=utf-8"
  return [PSCustomObject]@{ Number = $r.number; Url = $r.html_url }
}

function Ensure-Label {
  param([string]$Name, [string]$Color, [string]$Description)
  $headers = @{
    Authorization        = "Bearer $Token"
    Accept               = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
  }
  $uri = "https://api.github.com/repos/$Repo/labels"
  $existing = Invoke-RestMethod -Uri $uri -Headers $headers
  if ($existing.name -contains $Name) { return }
  $body = @{ name = $Name; color = $Color; description = $Description } | ConvertTo-Json -Compress
  try {
    Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
  } catch {
    Write-Warning "Label '$Name': $_"
  }
}

function New-IssueBody {
  param(
    [string]$Spec, [string]$Research, [string]$Plan, [string]$Tasks,
    [string]$Assignee, [string]$Frs, [string]$BlockedBy = ""
  )
  $blockedLine = ""
  if ($BlockedBy) { $blockedLine = "- Blocked by: $BlockedBy`n" }
  return @"
## Spec
- SDD: ``$Spec``
- Research: ``$Research``
- Plan: ``$Plan``
- Tasks: ``$Tasks``
- Prototype: ``ipaper-checklist-management/docs/prototype/LOVABLE-PROTOTYPE.md``

## Assignee
- $Assignee

## Functional Requirements
$Frs

## Acceptance
- [ ] Testes Test-First passing
- [ ] Matriz FR->teste atualizada em progress.md
- [ ] flows-code-review / flows-design-review quando aplicavel

## Dependencies
$blockedLine
"@
}

$accept = "- [ ] Testes Test-First passing"

Write-Host "Creating labels..."
@(
  @("epic", "5319E7", "Epic parent"),
  @("feature/001-foundation", "006B63", "App foundation"),
  @("feature/002-kpis", "0E8A16", "Checklist KPIs"),
  @("feature/003-trends", "1D76DB", "Task trends"),
  @("feature/004-alerts", "D93F0B", "Alerts"),
  @("type/frontend", "FBCA04", "UI"),
  @("type/backend", "C5DEF5", "Services"),
  @("type/test", "BFD4F2", "Tests")
) | ForEach-Object { Ensure-Label -Name $_[0] -Color $_[1] -Description $_[2] }

$base = "ipaper-checklist-management/specs"
$C = @{}

# EPIC 001
$C["EPIC-001"] = Invoke-CreateIssue -Title '[Epic] App Foundation and Fusion Shell - InField Challenge' -Labels @("epic", "feature/001-foundation") -AssigneeNames @("Guilherme") -Body (New-IssueBody -Spec "$base/001-checklist-management/spec.md" -Research "$base/001-checklist-management/research.md" -Plan "$base/001-checklist-management/plan.md" -Tasks "$base/001-checklist-management/tasks.md" -Assignee "Guilherme (epic)" -Frs "AR-001..AR-006; FR-001..FR-013")

$C["001-1"] = Invoke-CreateIssue -Title '[001] Fusion bootstrap - loading, error, CogniteSdkProvider' -Labels @("feature/001-foundation", "type/frontend", "type/test") -AssigneeNames @("Joao") -Body (New-IssueBody -Spec "$base/001-checklist-management/spec.md" -Research "$base/001-checklist-management/research.md" -Plan "$base/001-checklist-management/plan.md" -Tasks "$base/001-checklist-management/tasks.md" -Assignee "Joao T1-T2" -Frs "FR-001..FR-004")
$C["001-2"] = Invoke-CreateIssue -Title '[001] HostAppContext and host-synced page state' -Labels @("feature/001-foundation", "type/backend", "type/test") -AssigneeNames @("Guilherme") -Body (New-IssueBody -Spec "$base/001-checklist-management/spec.md" -Research "$base/001-checklist-management/research.md" -Plan "$base/001-checklist-management/plan.md" -Tasks "$base/001-checklist-management/tasks.md" -Assignee "Guilherme T3-T6" -Frs "FR-010, FR-011" -BlockedBy "#$($C['001-1'].Number)")
$C["001-3"] = Invoke-CreateIssue -Title '[001] AppShell and AppSidebar - Aura and IP tokens' -Labels @("feature/001-foundation", "type/frontend", "type/test") -AssigneeNames @("Caio") -Body (New-IssueBody -Spec "$base/001-checklist-management/spec.md" -Research "$base/001-checklist-management/research.md" -Plan "$base/001-checklist-management/plan.md" -Tasks "$base/001-checklist-management/tasks.md" -Assignee "Caio T7-T9" -Frs "FR-005..FR-009" -BlockedBy "#$($C['001-2'].Number)")
$C["001-4"] = Invoke-CreateIssue -Title '[001] Module placeholders and remove welcome scaffold' -Labels @("feature/001-foundation", "type/frontend") -AssigneeNames @("Joao", "Caio") -Body (New-IssueBody -Spec "$base/001-checklist-management/spec.md" -Research "$base/001-checklist-management/research.md" -Plan "$base/001-checklist-management/plan.md" -Tasks "$base/001-checklist-management/tasks.md" -Assignee "Joao T11 + Caio T10" -Frs "FR-012, FR-013" -BlockedBy "#$($C['001-3'].Number)")
$C["001-5"] = Invoke-CreateIssue -Title '[001] Integration tests - shell navigation and reload state' -Labels @("feature/001-foundation", "type/test") -AssigneeNames @("Guilherme") -Body (New-IssueBody -Spec "$base/001-checklist-management/spec.md" -Research "$base/001-checklist-management/research.md" -Plan "$base/001-checklist-management/plan.md" -Tasks "$base/001-checklist-management/tasks.md" -Assignee "Guilherme T12-T13" -Frs "FR-001..FR-012 validation" -BlockedBy "#$($C['001-3'].Number), #$($C['001-4'].Number)")

# EPIC 002
$C["EPIC-002"] = Invoke-CreateIssue -Title '[Epic] Checklist KPIs and Overview - InField Challenge' -Labels @("epic", "feature/002-kpis") -AssigneeNames @("Joao") -Body (New-IssueBody -Spec "$base/002-checklist-kpis/spec.md" -Research "$base/002-checklist-kpis/research.md" -Plan "$base/002-checklist-kpis/plan.md" -Tasks "$base/002-checklist-kpis/tasks.md" -Assignee "Joao (epic)" -Frs "AR-101..AR-107" -BlockedBy "#$($C['EPIC-001'].Number)")

$C["002-1"] = Invoke-CreateIssue -Title '[002] Data layer - ChecklistService and status aggregation' -Labels @("feature/002-kpis", "type/backend", "type/test") -AssigneeNames @("Guilherme") -Body (New-IssueBody -Spec "$base/002-checklist-kpis/spec.md" -Research "$base/002-checklist-kpis/research.md" -Plan "$base/002-checklist-kpis/plan.md" -Tasks "$base/002-checklist-kpis/tasks.md" -Assignee "Guilherme T1-T4" -Frs "FR-001, FR-002" -BlockedBy "#$($C['001-3'].Number)")
$C["002-2"] = Invoke-CreateIssue -Title '[002] Overview page - KPI cards and status charts' -Labels @("feature/002-kpis", "type/frontend", "type/test") -AssigneeNames @("Joao") -Body (New-IssueBody -Spec "$base/002-checklist-kpis/spec.md" -Research "$base/002-checklist-kpis/research.md" -Plan "$base/002-checklist-kpis/plan.md" -Tasks "$base/002-checklist-kpis/tasks.md" -Assignee "Joao T5-T7" -Frs "FR-003, FR-004, FR-005" -BlockedBy "#$($C['002-1'].Number)")
$C["002-3"] = Invoke-CreateIssue -Title '[002] Checklist list - search, filters, sort, host-sync' -Labels @("feature/002-kpis", "type/frontend", "type/test") -AssigneeNames @("Caio") -Body (New-IssueBody -Spec "$base/002-checklist-kpis/spec.md" -Research "$base/002-checklist-kpis/research.md" -Plan "$base/002-checklist-kpis/plan.md" -Tasks "$base/002-checklist-kpis/tasks.md" -Assignee "Caio T8-T11" -Frs "FR-006, FR-007, FR-008" -BlockedBy "#$($C['002-1'].Number)")
$C["002-4"] = Invoke-CreateIssue -Title '[002] Checklist detail - task results table' -Labels @("feature/002-kpis", "type/frontend", "type/test") -AssigneeNames @("Joao") -Body (New-IssueBody -Spec "$base/002-checklist-kpis/spec.md" -Research "$base/002-checklist-kpis/research.md" -Plan "$base/002-checklist-kpis/plan.md" -Tasks "$base/002-checklist-kpis/tasks.md" -Assignee "Joao T12-T13" -Frs "FR-009, FR-010" -BlockedBy "#$($C['002-1'].Number)")
$C["002-5"] = Invoke-CreateIssue -Title '[002] Overview view plug-in no AppShell' -Labels @("feature/002-kpis", "type/frontend") -AssigneeNames @("Joao") -Body (New-IssueBody -Spec "$base/002-checklist-kpis/spec.md" -Research "$base/002-checklist-kpis/research.md" -Plan "$base/002-checklist-kpis/plan.md" -Tasks "$base/002-checklist-kpis/tasks.md" -Assignee "Joao" -Frs "FR-003..FR-005 shell integration" -BlockedBy "#$($C['001-3'].Number), #$($C['002-2'].Number)")
$C["002-6"] = Invoke-CreateIssue -Title '[002] Integration tests - overview, list, detail' -Labels @("feature/002-kpis", "type/test") -AssigneeNames @("Caio") -Body (New-IssueBody -Spec "$base/002-checklist-kpis/spec.md" -Research "$base/002-checklist-kpis/research.md" -Plan "$base/002-checklist-kpis/plan.md" -Tasks "$base/002-checklist-kpis/tasks.md" -Assignee "Caio T14" -Frs "All FRs 002" -BlockedBy "#$($C['002-2'].Number), #$($C['002-3'].Number), #$($C['002-4'].Number)")

# EPIC 003
$C["EPIC-003"] = Invoke-CreateIssue -Title '[Epic] Task Result Trends and Analytics - InField Challenge' -Labels @("epic", "feature/003-trends") -AssigneeNames @("Caio") -Body (New-IssueBody -Spec "$base/003-task-result-trends/spec.md" -Research "$base/003-task-result-trends/research.md" -Plan "$base/003-task-result-trends/plan.md" -Tasks "$base/003-task-result-trends/tasks.md" -Assignee "Caio (epic)" -Frs "AR-201..AR-205" -BlockedBy "#$($C['EPIC-002'].Number)")

$C["003-1"] = Invoke-CreateIssue -Title '[003] TaskResultService - aggregates OK and Not OK' -Labels @("feature/003-trends", "type/backend", "type/test") -AssigneeNames @("Guilherme") -Body (New-IssueBody -Spec "$base/003-task-result-trends/spec.md" -Research "$base/003-task-result-trends/research.md" -Plan "$base/003-task-result-trends/plan.md" -Tasks "$base/003-task-result-trends/tasks.md" -Assignee "Guilherme T1-T2, T5-T6" -Frs "FR-001, FR-002, FR-006, FR-007" -BlockedBy "#$($C['002-1'].Number)")
$C["003-2"] = Invoke-CreateIssue -Title '[003] Task Results dashboard - breakdown charts' -Labels @("feature/003-trends", "type/frontend", "type/test") -AssigneeNames @("Joao") -Body (New-IssueBody -Spec "$base/003-task-result-trends/spec.md" -Research "$base/003-task-result-trends/research.md" -Plan "$base/003-task-result-trends/plan.md" -Tasks "$base/003-task-result-trends/tasks.md" -Assignee "Joao T7-T8" -Frs "FR-003, FR-004, FR-005" -BlockedBy "#$($C['003-1'].Number)")
$C["003-3"] = Invoke-CreateIssue -Title '[003] Time-series KPIs - period selector and trend charts' -Labels @("feature/003-trends", "type/frontend", "type/test") -AssigneeNames @("Caio") -Body (New-IssueBody -Spec "$base/003-task-result-trends/spec.md" -Research "$base/003-task-result-trends/research.md" -Plan "$base/003-task-result-trends/plan.md" -Tasks "$base/003-task-result-trends/tasks.md" -Assignee "Caio T9-T10" -Frs "FR-006, FR-007, FR-008" -BlockedBy "#$($C['003-1'].Number)")
$C["003-4"] = Invoke-CreateIssue -Title '[003] Recurring Not OK analysis' -Labels @("feature/003-trends", "type/backend", "type/test") -AssigneeNames @("Joao") -Body (New-IssueBody -Spec "$base/003-task-result-trends/spec.md" -Research "$base/003-task-result-trends/research.md" -Plan "$base/003-task-result-trends/plan.md" -Tasks "$base/003-task-result-trends/tasks.md" -Assignee "Joao T3-T4" -Frs "FR-009" -BlockedBy "#$($C['003-1'].Number)")
$C["003-5"] = Invoke-CreateIssue -Title '[003] Integration tests - analytics views' -Labels @("feature/003-trends", "type/test") -AssigneeNames @("Caio") -Body (New-IssueBody -Spec "$base/003-task-result-trends/spec.md" -Research "$base/003-task-result-trends/research.md" -Plan "$base/003-task-result-trends/plan.md" -Tasks "$base/003-task-result-trends/tasks.md" -Assignee "Caio T11" -Frs "All FRs 003" -BlockedBy "#$($C['003-2'].Number), #$($C['003-3'].Number)")

# EPIC 004
$C["EPIC-004"] = Invoke-CreateIssue -Title '[Epic] Alerts and Notifications - InField Challenge' -Labels @("epic", "feature/004-alerts") -AssigneeNames @("Caio") -Body (New-IssueBody -Spec "$base/004-alerts-notifications/spec.md" -Research "$base/004-alerts-notifications/research.md" -Plan "$base/004-alerts-notifications/plan.md" -Tasks "$base/004-alerts-notifications/tasks.md" -Assignee "Caio (epic)" -Frs "AR-301..AR-310" -BlockedBy "#$($C['EPIC-002'].Number)")

$C["004-1"] = Invoke-CreateIssue -Title '[004] AlertRule model and AlertRuleService CRUD' -Labels @("feature/004-alerts", "type/backend", "type/test") -AssigneeNames @("Joao") -Body (New-IssueBody -Spec "$base/004-alerts-notifications/spec.md" -Research "$base/004-alerts-notifications/research.md" -Plan "$base/004-alerts-notifications/plan.md" -Tasks "$base/004-alerts-notifications/tasks.md" -Assignee "Joao T1-T2" -Frs "FR-001, FR-002")
$C["004-2"] = Invoke-CreateIssue -Title '[004] Alerts UI - rules table and wizard' -Labels @("feature/004-alerts", "type/frontend", "type/test") -AssigneeNames @("Joao", "Caio") -Body (New-IssueBody -Spec "$base/004-alerts-notifications/spec.md" -Research "$base/004-alerts-notifications/research.md" -Plan "$base/004-alerts-notifications/plan.md" -Tasks "$base/004-alerts-notifications/tasks.md" -Assignee "Joao T5-T6 + Caio T7-T8" -Frs "FR-003..FR-005, FR-010" -BlockedBy "#$($C['004-1'].Number)")
$C["004-3"] = Invoke-CreateIssue -Title '[004] Notification dispatcher - trigger evaluation' -Labels @("feature/004-alerts", "type/backend", "type/test") -AssigneeNames @("Guilherme") -Body (New-IssueBody -Spec "$base/004-alerts-notifications/spec.md" -Research "$base/004-alerts-notifications/research.md" -Plan "$base/004-alerts-notifications/plan.md" -Tasks "$base/004-alerts-notifications/tasks.md" -Assignee "Guilherme T3-T4, T11" -Frs "FR-006, FR-007, FR-008" -BlockedBy "#$($C['004-1'].Number), #$($C['002-1'].Number)")
$C["004-4"] = Invoke-CreateIssue -Title '[004] Channel adapters - email and Teams stub' -Labels @("feature/004-alerts", "type/backend", "type/test") -AssigneeNames @("Caio") -Body (New-IssueBody -Spec "$base/004-alerts-notifications/spec.md" -Research "$base/004-alerts-notifications/research.md" -Plan "$base/004-alerts-notifications/plan.md" -Tasks "$base/004-alerts-notifications/tasks.md" -Assignee "Caio T9-T10" -Frs "FR-009" -BlockedBy "#$($C['004-3'].Number)")
$C["004-5"] = Invoke-CreateIssue -Title '[004] Integration tests - rule CRUD and trigger flow' -Labels @("feature/004-alerts", "type/test") -AssigneeNames @("Guilherme") -Body (New-IssueBody -Spec "$base/004-alerts-notifications/spec.md" -Research "$base/004-alerts-notifications/research.md" -Plan "$base/004-alerts-notifications/plan.md" -Tasks "$base/004-alerts-notifications/tasks.md" -Assignee "Guilherme" -Frs "All FRs 004 pipeline" -BlockedBy "#$($C['004-2'].Number), #$($C['004-3'].Number)")

Write-Host ""
Write-Host "=== Issues created ===" -ForegroundColor Green
$C.GetEnumerator() | Sort-Object Name | ForEach-Object {
  Write-Host ("{0,-12} #{1} {2}" -f $_.Key, $_.Value.Number, $_.Value.Url)
}

$outPath = Join-Path (Split-Path $PSScriptRoot -Parent) "docs\requirements\GITHUB-ISSUES-CREATED.md"
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# GitHub Issues - InField Challenge")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Key | Issue | URL |")
[void]$sb.AppendLine("| --- | --- | --- |")
$C.GetEnumerator() | Sort-Object Name | ForEach-Object {
  [void]$sb.AppendLine("| $($_.Key) | #$($_.Value.Number) | $($_.Value.Url) |")
}
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.UTF8Encoding]::new($false))
Write-Host "Index: $outPath"
