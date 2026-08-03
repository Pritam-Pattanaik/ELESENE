const { createClient } = require('@supabase/supabase-js');
require('../config/env')

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
