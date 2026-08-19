import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Language } from "@/lib/types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // App header & brand
    app_title: "Click2Ration",
    portal_subtitle: "Delivery Agent Secure Field Portal",
    hub_label: "Hub",
    logout: "Sign Out",
    
    // Navigation
    nav_home: "Dashboard",
    nav_deliveries: "Deliveries",
    nav_history: "History",
    nav_notifications: "Notifications",
    nav_performance: "Performance",

    // Dashboard
    greeting_prefix: "Welcome back,",
    daily_overview: "Today's Delivery Dispatch Ledger",
    today_progress: "Route Progress",
    assigned_kpi: "Assigned",
    active_kpi: "Active",
    completed_kpi: "Completed",
    held_kpi: "Admin Hold",
    quick_demo_cases: "Synthetic Demo Cases",
    demo_case_1_btn: "Demo: Normal (Low Risk)",
    demo_case_2_btn: "Demo: Additional Verification",
    demo_case_3_btn: "Demo: Administrative Hold",
    demo_reset_btn: "Reset Demo Queue",
    live_route_banner: "Navigation Service Integration — Future Scope (Simulated Waypoints)",
    active_task_banner: "Active In-Transit Task",
    continue_delivery: "Continue Delivery",
    no_active_delivery: "No delivery in progress. Select a pending task below.",

    // Delivery List & Statuses
    status_ASSIGNED: "Assigned",
    status_ACCEPTED: "Accepted",
    status_ON_THE_WAY: "On the Way",
    status_ARRIVED: "Arrived",
    status_VERIFICATION: "In Verification",
    status_DELIVERED: "Delivered",
    status_DELAYED: "Delayed",

    // Risk Instructions
    risk_standard: "Standard delivery verification required.",
    risk_additional: "Additional beneficiary verification required.",
    risk_admin_hold: "Administrative verification required before completion.",

    // Task details
    order_id: "Order ID",
    beneficiary_id: "Beneficiary ID",
    ration_card: "Ration Card",
    aadhaar_last4: "Aadhaar Last 4",
    address: "Delivery Address",
    commodities: "Assigned Commodities",
    preferred_time: "Preferred Window",
    contact_beneficiary: "Contact Beneficiary",
    report_delay: "Report Delay",
    operational_instruction: "Operational Directive (AI Risk Engine)",
    
    // Action buttons
    btn_accept: "Accept Delivery",
    btn_start_journey: "Start Journey (On The Way)",
    btn_mark_arrived: "Mark Arrived",
    btn_proceed_verification: "Proceed to Verification",
    btn_view_proof: "View Digital Proof",
    btn_request_admin: "Request Admin Review",

    // Verification wizard
    verify_title: "Doorstep Beneficiary Verification",
    verify_subtitle: "Zero-Trust Identity Authentication Gateway",
    method_select: "Select Verification Protocol",
    method_biometric: "Biometric Authentication",
    method_biometric_badge: "MANTRA MT100 — PROPOSED HARDWARE INTEGRATION",
    method_otp: "Secure Beneficiary OTP",
    otp_sent_to: "Secure one-time passkey transmitted to beneficiary mobile",
    otp_placeholder: "Enter 6-digit OTP",
    otp_time_left: "Valid for",
    otp_seconds: "seconds",
    otp_resend: "Resend Code",
    otp_verify_btn: "Verify OTP and Complete",
    bio_status_idle: "Ready for fingerprint capture",
    bio_status_connecting: "Initializing Mantra RD Service...",
    bio_status_scanning: "Capturing biometric scan...",
    bio_status_verifying: "Validating against UIDAI identity gateway...",
    bio_start_scan: "Capture Fingerprint",
    bio_simulated_notice: "SIMULATED BIOMETRIC VERIFICATION",

    // Failure message
    verify_failed_headline: "Identity Verification Unsuccessful",
    verify_failed_msg: "Identity verification unsuccessful. Additional verification or administrative assistance is required.",
    retry_verification: "Retry Verification",
    switch_to_otp: "Switch to Secure OTP Fallback",
    escalate_to_admin: "Escalate to Shop Administrator",

    // Digital Proof (e-POD)
    proof_headline: "Digital Proof of Delivery (e-POD)",
    proof_confirmed: "Delivery Successfully Authenticated and Sealed",
    proof_order_id: "Order Identifier",
    proof_agent: "Authorized Agent ID",
    proof_timestamp: "Timestamp",
    proof_method: "Verification Method",
    proof_tx_ref: "Cryptographic Transaction Reference",
    proof_geotag: "GPS Geotag Confirmation",
    proof_history_sync: "Ration Behaviour History Baseline Updated",
    proof_done_btn: "Return to Deliveries Ledger",

    // History & Performance
    history_title: "Delivery History and Audit Ledger",
    history_subtitle: "Historical verification logs and immutable receipts",
    perf_title: "Operational Performance Metrics",
    perf_total_assigned: "Total Assigned",
    perf_completed: "Completed Deliveries",
    perf_success_rate: "Verification Success Rate",
    perf_avg_time: "Average Delivery Time",
    perf_delayed: "Delayed Tasks",

    // Admin Hold
    admin_hold_notice: "This delivery is on administrative hold by the Central AI Fraud Intelligence Engine. Delivery agent cannot override independently. Please await shop administrator clearance.",

    // Language Toggle
    lang_toggle: "English"
  },
  ta: {
    // App header & brand
    app_title: "கிளிக்டூரேஷன்",
    portal_subtitle: "விநியோக முகவர் பாதுகாப்பு தளம்",
    hub_label: "மையம்",
    logout: "வெளியேறு",

    // Navigation
    nav_home: "முகப்பு",
    nav_deliveries: "விநியோகங்கள்",
    nav_history: "வரலாறு",
    nav_notifications: "அறிவிப்புகள்",
    nav_performance: "செயல்திறன்",

    // Dashboard
    greeting_prefix: "வணக்கம்,",
    daily_overview: "இன்றைய விநியோக பட்டியல்",
    today_progress: "பாதை முன்னேற்றம்",
    assigned_kpi: "ஒதுக்கப்பட்டது",
    active_kpi: "நடப்பில்",
    completed_kpi: "நிறைவுற்றது",
    held_kpi: "நிர்வாக நிறுத்தம்",
    quick_demo_cases: "செயற்கை மாதிரி வழக்குகள்",
    demo_case_1_btn: "மாதிரி: இயல்பானது (குறைந்த ஆபத்து)",
    demo_case_2_btn: "மாதிரி: கூடுதல் சரிபார்ப்பு",
    demo_case_3_btn: "மாதிரி: நிர்வாக நிறுத்தம்",
    demo_reset_btn: "பட்டியலை மீட்டமை",
    live_route_banner: "வழிசெலுத்தல் சேவை இணைப்பு — எதிர்கால திட்டம் (மாதிரி வழிகள்)",
    active_task_banner: "நடப்பில் உள்ள விநியோக பணி",
    continue_delivery: "விநியோகத்தை தொடரவும்",
    no_active_delivery: "நடப்பில் எந்த விநியோகமும் இல்லை. கீழே உள்ள பணியைத் தேர்ந்தெடுக்கவும்.",

    // Delivery List & Statuses
    status_ASSIGNED: "ஒதுக்கப்பட்டது",
    status_ACCEPTED: "ஏற்றுக்கொள்ளப்பட்டது",
    status_ON_THE_WAY: "வழியில்",
    status_ARRIVED: "வந்து சேர்ந்தது",
    status_VERIFICATION: "சரிபார்ப்பில்",
    status_DELIVERED: "விநியோகிக்கப்பட்டது",
    status_DELAYED: "தாமதமானது",

    // Risk Instructions
    risk_standard: "நிலையான விநியோக சரிபார்ப்பு தேவை.",
    risk_additional: "கூடுதல் பயனாளி சரிபார்ப்பு தேவை.",
    risk_admin_hold: "நிறைவு செய்வதற்கு முன் நிர்வாக சரிபார்ப்பு தேவை.",

    // Task details
    order_id: "ஆர்டர் எண்",
    beneficiary_id: "பயனாளி குறியீடு",
    ration_card: "ரேஷன் கார்டு",
    aadhaar_last4: "ஆதார் கடைசி 4",
    address: "விநியோக முகவரி",
    commodities: "ஒதுக்கப்பட்ட பொருட்கள்",
    preferred_time: "விருப்பப்பட்ட நேரம்",
    contact_beneficiary: "பயனாளியை தொடர்பு கொள்க",
    report_delay: "தாமதத்தை தெரிவிக்கவும்",
    operational_instruction: "செயல்பாட்டு உத்தரவு (AI இடர் பிரிவு)",

    // Action buttons
    btn_accept: "ஏற்றுக்கொள்ளவும்",
    btn_start_journey: "பயணத்தை தொடங்கு (வழியில்)",
    btn_mark_arrived: "வந்து சேர்ந்ததை பதிவு செய்",
    btn_proceed_verification: "சரிபார்ப்புக்கு செல்லவும்",
    btn_view_proof: "டிஜிட்டல் சான்றைக் காண்க",
    btn_request_admin: "நிர்வாக மறுஆய்வு கோரிக்கை",

    // Verification wizard
    verify_title: "வீட்டு வாசலில் பயனாளி சரிபார்ப்பு",
    verify_subtitle: "பாதுகாப்பான அடையாள சரிபார்ப்பு முகப்பு",
    method_select: "சரிபார்ப்பு முறையைத் தேர்வுசெய்க",
    method_biometric: "கைரேகை அடையாள சரிபார்ப்பு",
    method_biometric_badge: "மந்த்ரா MT100 — முன்மொழியப்பட்ட வன்பொருள் இணைப்பு",
    method_otp: "பாதுகாப்பான பயனாளி OTP",
    otp_sent_to: "பயனாளியின் மொபைலுக்கு 6 இலக்க ரகசிய குறியீடு அனுப்பப்பட்டது",
    otp_placeholder: "6 இலக்க OTP-ஐ உள்ளிடவும்",
    otp_time_left: "செல்லுபடியாகும் காலம்",
    otp_seconds: "வினாடிகள்",
    otp_resend: "மீண்டும் அனுப்புக",
    otp_verify_btn: "OTP சரிபார்த்து முடிக்கவும்",
    bio_status_idle: "கைரேகை பதிவு செய்ய தயார்",
    bio_status_connecting: "மந்த்ரா RD சேவையை இணைக்கிறது...",
    bio_status_scanning: "கைரேகை பதிவு செய்யப்படுகிறது...",
    bio_status_verifying: "UIDAI தரவுகளுடன் சரிபார்க்கப்படுகிறது...",
    bio_start_scan: "கைரேகையை பதிவு செய்",
    bio_simulated_notice: "மாதிரி கைரேகை சரிபார்ப்பு முறை",

    // Failure message
    verify_failed_headline: "அடையாள சரிபார்ப்பு தோல்வியடைந்தது",
    verify_failed_msg: "அடையாள சரிபார்ப்பு வெற்றியடையவில்லை. கூடுதல் சரிபார்ப்பு அல்லது நிர்வாக உதவி தேவைப்படுகிறது.",
    retry_verification: "மீண்டும் முயற்சிக்கவும்",
    switch_to_otp: "பாதுகாப்பான OTP முறைக்கு மாறவும்",
    escalate_to_admin: "கடை நிர்வாகியிடம் ஒப்படைக்கவும்",

    // Digital Proof (e-POD)
    proof_headline: "டிஜிட்டல் விநியோக சான்று (e-POD)",
    proof_confirmed: "விநியோகம் வெற்றிகரமாக சரிபார்க்கப்பட்டு பதிவு செய்யப்பட்டது",
    proof_order_id: "ஆர்டர் குறியீடு",
    proof_agent: "அங்கீகரிக்கப்பட்ட முகவர் எண்",
    proof_timestamp: "நேர முத்திரை",
    proof_method: "சரிபார்ப்பு முறை",
    proof_tx_ref: "பாதுகாப்பு பரிவர்த்தனை குறியீடு",
    proof_geotag: "GPS புவிக்குறியீடு உறுதிப்படுத்தல்",
    proof_history_sync: "ரேஷன் நடத்தை வரலாற்று தரவு புதுப்பிக்கப்பட்டது",
    proof_done_btn: "விநியோக பட்டியலுக்கு திரும்பு",

    // History & Performance
    history_title: "விநியோக வரலாறு மற்றும் தணிக்கை பட்டியல்",
    history_subtitle: "வரலாற்று சரிபார்ப்பு பதிவுகள் மற்றும் ரசீதுகள்",
    perf_title: "செயல்பாட்டு செயல்திறன் அளவீடுகள்",
    perf_total_assigned: "மொத்தம் ஒதுக்கப்பட்டது",
    perf_completed: "முடிக்கப்பட்ட விநியோகங்கள்",
    perf_success_rate: "சரிபார்ப்பு வெற்றி விகிதம்",
    perf_avg_time: "சராசரி விநியோக நேரம்",
    perf_delayed: "தாமதமான பணிகள்",

    // Admin Hold
    admin_hold_notice: "இந்த விநியோகம் மத்திய AI அமைப்பால் நிர்வாக ஆய்வில் வைக்கப்பட்டுள்ளது. முகவர் தானாக இதை மாற்ற முடியாது. கடை நிர்வாகியின் ஒப்புதலுக்காக காத்திருக்கவும்.",

    // Language Toggle
    lang_toggle: "தமிழ்"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
