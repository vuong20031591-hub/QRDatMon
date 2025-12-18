#!/bin/bash

echo "=== Commit 1: Auth Refactoring ==="
git commit -m "[Update] Refactor auth to shared module for both apps

- Create shared AuthManager in core:common module
- Support both Staff and Customer auth with separate methods
- Remove old AuthManager from app-staff
- Update both apps to use shared AuthManager with separate prefs
- Staff uses 'staff_auth_prefs', Customer uses 'customer_auth_prefs'"

echo ""
ech