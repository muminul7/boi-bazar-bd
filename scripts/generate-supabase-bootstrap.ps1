param(
  [string]$OutputPath = "scripts/supabase-bootstrap.sql",
  [string]$AdminEmail = "admin@gmail.com"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$migrationsDir = Join-Path $repoRoot "supabase/migrations"
$resolvedOutputPath = Join-Path $repoRoot $OutputPath

if (-not (Test-Path -LiteralPath $migrationsDir)) {
  throw "Migrations directory not found: $migrationsDir"
}

$migrationFiles = Get-ChildItem -LiteralPath $migrationsDir -Filter "*.sql" | Sort-Object Name

if ($migrationFiles.Count -eq 0) {
  throw "No migration files found in $migrationsDir"
}

$sqlSections = [System.Collections.Generic.List[string]]::new()

$sqlSections.Add("-- Generated bootstrap SQL for a fresh Supabase project")
$sqlSections.Add("-- Source migrations are concatenated in filename order from supabase/migrations")
$sqlSections.Add("-- Run this in Supabase SQL Editor on a new project")
$sqlSections.Add("")

foreach ($file in $migrationFiles) {
  $sqlSections.Add("-- ==================================================")
  $sqlSections.Add("-- Migration: $($file.Name)")
  $sqlSections.Add("-- ==================================================")
  $sqlSections.Add((Get-Content -LiteralPath $file.FullName -Raw).TrimEnd())
  $sqlSections.Add("")
}

if (-not [string]::IsNullOrWhiteSpace($AdminEmail)) {
  $escapedEmail = $AdminEmail.Replace("'", "''")
  $sqlSections.Add("-- ==================================================")
  $sqlSections.Add("-- Optional: grant admin role to an existing auth user")
  $sqlSections.Add("-- Requires the auth user to already exist in Authentication -> Users")
  $sqlSections.Add("-- ==================================================")
  $sqlSections.Add("insert into public.user_roles (user_id, role)")
  $sqlSections.Add("select id, 'admin'::public.app_role")
  $sqlSections.Add("from auth.users")
  $sqlSections.Add("where email = '$escapedEmail'")
  $sqlSections.Add("on conflict (user_id, role) do nothing;")
  $sqlSections.Add("")
}

$outputDir = Split-Path -Parent $resolvedOutputPath
if (-not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

[System.IO.File]::WriteAllText(
  $resolvedOutputPath,
  ($sqlSections -join [Environment]::NewLine),
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host "Created bootstrap SQL:"
Write-Host $resolvedOutputPath
