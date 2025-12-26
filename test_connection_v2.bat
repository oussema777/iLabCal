@echo off
echo Testing connection to NEW Supabase project...
echo Host: db.muicvfhufelyvnqsffcc.supabase.co
echo Port: 5432
echo.
powershell -Command "Test-NetConnection -ComputerName db.muicvfhufelyvnqsffcc.supabase.co -Port 5432"
pause
