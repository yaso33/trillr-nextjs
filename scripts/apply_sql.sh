#!/bin/bash

# Check if a file path is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_sql_file>"
  exit 1
fi

# Check if the SQL file exists
if [ ! -f "$1" ]; then
  echo "Error: SQL file not found at '$1'"
  exit 1
fi

# Check if SUPABASE_CONN_STRING is set
if [ -z "$SUPABASE_CONN_STRING" ]; then
  echo "Error: SUPABASE_CONN_STRING environment variable is not set."
  echo "Please set it to your Supabase connection string."
  exit 1
fi

# Execute the SQL file
psql "$SUPABASE_CONN_STRING" -f "$1"

echo "SQL script '$1' executed successfully."
