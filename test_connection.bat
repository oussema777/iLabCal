@echo off
echo Testing connection to Supabase (port 5432)...
powershell -Command "Test-NetConnection -ComputerName db.lebjdrknrypqdqwmekhj.supabase.co -Port 5432"
pause
