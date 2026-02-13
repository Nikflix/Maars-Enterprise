import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zlmpdpgtkwmvlpufjyok.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbXBkcGd0a3dtdmxwdWZqeW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTc4NDMsImV4cCI6MjA4NjA3Mzg0M30.J0gtBPv8npnME_iO-Yvdd2h5yY-gaNMuHXMj0onNe3I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
