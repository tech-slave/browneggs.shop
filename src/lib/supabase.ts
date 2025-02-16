import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qwhyqudqnbslipoqgloj.supabase.co";
const supabaseAnon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aHlxdWRxbmJzbGlwb3FnbG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MDQ5OTksImV4cCI6MjA1NTA4MDk5OX0.QmZD3e6plOqy7XUHD1jROytzg03V3IQ_MxBg0JljUKw";

export const supabase = createClient(supabaseUrl, supabaseAnon);