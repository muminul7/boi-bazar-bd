param(
  [string]$Email = "admin@gmail.com",
  [string]$Password = "admin",
  [string]$EnvPath = ".env"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Import-EnvFile {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  foreach ($rawLine in Get-Content -LiteralPath $Path) {
    $line = $rawLine.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      continue
    }

    $separatorIndex = $line.IndexOf("=")
    if ($separatorIndex -lt 1) {
      continue
    }

    $name = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim()

    if (
      (($value.StartsWith('"')) -and ($value.EndsWith('"'))) -or
      (($value.StartsWith("'")) -and ($value.EndsWith("'")))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, "Process"))) {
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

function Get-RequiredEnv {
  param([string]$Name)

  $value = [Environment]::GetEnvironmentVariable($Name, "Process")
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing required environment variable: $Name"
  }

  return $value
}

function Get-ErrorMessage {
  param([System.Management.Automation.ErrorRecord]$ErrorRecord)

  $details = $ErrorRecord.ErrorDetails.Message
  if (-not [string]::IsNullOrWhiteSpace($details)) {
    return $details
  }

  return $ErrorRecord.Exception.Message
}

function Invoke-SupabaseJson {
  param(
    [string]$Method,
    [string]$Uri,
    [hashtable]$Headers,
    [object]$Body
  )

  $request = @{
    Method  = $Method
    Uri     = $Uri
    Headers = $Headers
  }

  if ($null -ne $Body) {
    $request.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  try {
    return Invoke-RestMethod @request
  } catch {
    throw "Request to $Uri failed: $(Get-ErrorMessage $_)"
  }
}

function Find-UserByEmail {
  param(
    [string]$SupabaseUrl,
    [hashtable]$Headers,
    [string]$EmailAddress
  )

  $page = 1
  $perPage = 1000
  $normalizedEmail = $EmailAddress.ToLowerInvariant()

  while ($true) {
    $uri = "$SupabaseUrl/auth/v1/admin/users?page=$page&per_page=$perPage"
    $response = Invoke-SupabaseJson -Method "GET" -Uri $uri -Headers $Headers -Body $null
    $users = @($response.users)

    foreach ($user in $users) {
      if ($user.email -and $user.email.ToLowerInvariant() -eq $normalizedEmail) {
        return $user
      }
    }

    if ($users.Count -lt $perPage) {
      return $null
    }

    $page += 1
  }
}

Import-EnvFile -Path $EnvPath

$supabaseUrl = (Get-RequiredEnv -Name "SUPABASE_URL").TrimEnd("/")
$serviceRoleKey = Get-RequiredEnv -Name "SUPABASE_SERVICE_ROLE_KEY"

if ($Password.Length -lt 6) {
  Write-Warning "The supplied password is shorter than 6 characters. Supabase password policy may reject it."
}

$authHeaders = @{
  "apikey"        = $serviceRoleKey
  "Authorization" = "Bearer $serviceRoleKey"
  "Content-Type"  = "application/json"
}

$restHeaders = @{
  "apikey"        = $serviceRoleKey
  "Authorization" = "Bearer $serviceRoleKey"
  "Content-Type"  = "application/json"
  "Prefer"        = "return=representation"
}

$existingUser = Find-UserByEmail -SupabaseUrl $supabaseUrl -Headers $authHeaders -EmailAddress $Email

if ($null -eq $existingUser) {
  $createResponse = Invoke-SupabaseJson `
    -Method "POST" `
    -Uri "$supabaseUrl/auth/v1/admin/users" `
    -Headers $authHeaders `
    -Body @{
      email = $Email
      password = $Password
      email_confirm = $true
    }

  $user = if ($null -ne $createResponse.user) { $createResponse.user } else { $createResponse }
  Write-Host "Created auth user: $($user.email)"
} else {
  $updateResponse = Invoke-SupabaseJson `
    -Method "PUT" `
    -Uri "$supabaseUrl/auth/v1/admin/users/$($existingUser.id)" `
    -Headers $authHeaders `
    -Body @{
      email = $Email
      password = $Password
      email_confirm = $true
    }

  $user = if ($null -ne $updateResponse.user) { $updateResponse.user } else { $updateResponse }
  Write-Host "Updated existing auth user: $($user.email)"
}

$encodedUserId = [uri]::EscapeDataString($user.id)
$roleRows = Invoke-SupabaseJson `
  -Method "GET" `
  -Uri "$supabaseUrl/rest/v1/user_roles?user_id=eq.$encodedUserId&role=eq.admin&select=id" `
  -Headers @{
    "apikey"        = $serviceRoleKey
    "Authorization" = "Bearer $serviceRoleKey"
  } `
  -Body $null

if (@($roleRows).Count -eq 0) {
  Invoke-SupabaseJson `
    -Method "POST" `
    -Uri "$supabaseUrl/rest/v1/user_roles" `
    -Headers $restHeaders `
    -Body @{
      user_id = $user.id
      role = "admin"
    } | Out-Null

  Write-Host "Assigned admin role."
} else {
  Write-Host "Admin role already assigned."
}

Write-Host ""
Write-Host "Admin bootstrap completed."
Write-Host "Email: $Email"
Write-Host "User ID: $($user.id)"
