// ============================================
// PRINTFLOW SUPABASE CONFIG
// ============================================

const SUPABASE_URL =
    "https://cfppcswvfvkevbtachrw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_iRZybbXYZSA7MORMBu4dZA_mhyASvNY";


// ============================================
// CHECK SUPABASE LIBRARY
// ============================================

if (
    typeof window.supabase === "undefined"
) {

    console.error(
        "PrintFlow: Supabase library was not loaded."
    );

} else {

    // ========================================
    // CREATE SUPABASE CLIENT
    // ========================================

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    console.log(
        "PrintFlow: Supabase client initialized."
    );

}
