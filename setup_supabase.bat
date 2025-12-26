@echo off
echo Backing up old SQLite migrations...
if exist "prisma\migrations" (
    rename "prisma\migrations" "migrations_sqlite_backup_%random%"
)

echo.
echo Initializing Supabase Database (this may take a moment)...
call npx prisma migrate dev --name init_supabase

echo.
echo Generating Prisma Client...
call npx prisma generate

echo.
echo Setup Complete! You can now run 'npm run dev'.
pause
