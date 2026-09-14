const SUPABASE_URL =
    "https://cfppcswvfvkevbtachrw.supabase.co/rest/v1/";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_iRZybbXYZSA7MORMBu4dZA_mhyASvNY";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );