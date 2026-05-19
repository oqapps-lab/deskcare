#!/bin/bash
# Walk every screen via deep-link openurl. Screenshot each.
set -u
QA=D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C
OUT=/tmp/qa_walk
mkdir -p $OUT

shot() {
    local name=$1
    local url=$2
    echo "--- $name → $url"
    xcrun simctl openurl $QA "$url" 2>&1 | tail -1
    sleep 6
    ~/.claude/bin/ios-shot $QA $OUT/${name}.png > /dev/null
}

shot 01_home    "exp://127.0.0.1:8083/--/main/home"
shot 02_library "exp://127.0.0.1:8083/--/main/library"
shot 03_programs "exp://127.0.0.1:8083/--/main/programs"
shot 04_profile "exp://127.0.0.1:8083/--/main/profile"
shot 05_sciatica "exp://127.0.0.1:8083/--/programs/sciatica"
shot 06_eye_prog "exp://127.0.0.1:8083/--/programs/eye"
shot 07_symptom_checker "exp://127.0.0.1:8083/--/programs/symptom-checker"
shot 08_settings "exp://127.0.0.1:8083/--/profile/settings"
shot 09_progress "exp://127.0.0.1:8083/--/profile/progress"
shot 10_pain_hist "exp://127.0.0.1:8083/--/profile/pain-history"
shot 11_delete_acc "exp://127.0.0.1:8083/--/profile/delete-account"
shot 12_notif "exp://127.0.0.1:8083/--/settings/notifications"
shot 13_welcome "exp://127.0.0.1:8083/--/onboarding/welcome"
shot 14_quiz_zone "exp://127.0.0.1:8083/--/onboarding/quiz/zone"
shot 15_quiz_freq "exp://127.0.0.1:8083/--/onboarding/quiz/frequency"
shot 16_quiz_work "exp://127.0.0.1:8083/--/onboarding/quiz/work"
shot 17_quiz_goal "exp://127.0.0.1:8083/--/onboarding/quiz/goal"
shot 18_labor "exp://127.0.0.1:8083/--/onboarding/labor-illusion"
shot 19_plan "exp://127.0.0.1:8083/--/onboarding/plan"
shot 20_permission "exp://127.0.0.1:8083/--/onboarding/permission"
shot 21_paywall "exp://127.0.0.1:8083/--/onboarding/paywall"
shot 22_rate_app "exp://127.0.0.1:8083/--/modals/rate-app"
shot 23_milestone "exp://127.0.0.1:8083/--/modals/milestone"
shot 24_share "exp://127.0.0.1:8083/--/modals/share"
shot 25_push_primer "exp://127.0.0.1:8083/--/modals/push-primer"
shot 26_signin "exp://127.0.0.1:8083/--/auth/sign-in"
shot 27_signup "exp://127.0.0.1:8083/--/auth/sign-up"
shot 28_eye_break "exp://127.0.0.1:8083/--/eye/break"
shot 29_pain_checkin "exp://127.0.0.1:8083/--/pain/check-in"
shot 30_no_conn "exp://127.0.0.1:8083/--/errors/no-connection"
shot 31_maintenance "exp://127.0.0.1:8083/--/system/maintenance"
shot 32_force_update "exp://127.0.0.1:8083/--/system/force-update"
shot 33_exercise_detail "exp://127.0.0.1:8083/--/library/seated-cat-cow"
shot 34_preview "exp://127.0.0.1:8083/--/exercise/preview?routine=neck-quick-2min"
shot 35_player_routine "exp://127.0.0.1:8083/--/exercise/player?routine=neck-quick-2min"
shot 36_player_single "exp://127.0.0.1:8083/--/exercise/player?exercise=seated-cat-cow"
shot 37_complete "exp://127.0.0.1:8083/--/exercise/complete?duration=125&moves=4"
shot 38_sync "exp://127.0.0.1:8083/--/sync"
echo "--- DONE ---"
