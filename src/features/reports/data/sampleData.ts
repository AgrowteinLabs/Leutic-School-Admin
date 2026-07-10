// ============================================================
// SAMPLE DATA — Reports & Analytics
// Mirrors the schema from Microservice 9: Reporting & Analytics
// ============================================================

// ─── 1. Academic Performance ────────────────────────────────
export const classPerformanceData = [
  { class: "6-A", maths: 78, science: 82, english: 74, hindi: 80, social: 76 },
  { class: "6-B", maths: 72, science: 68, english: 80, hindi: 75, social: 70 },
  { class: "7-A", maths: 85, science: 88, english: 79, hindi: 82, social: 84 },
  { class: "7-B", maths: 70, science: 75, english: 72, hindi: 78, social: 68 },
  { class: "8-A", maths: 82, science: 80, english: 85, hindi: 77, social: 81 },
  { class: "8-B", maths: 65, science: 70, english: 68, hindi: 72, social: 66 },
  { class: "9-A", maths: 88, science: 92, english: 84, hindi: 86, social: 90 },
  { class: "9-B", maths: 74, science: 76, english: 78, hindi: 80, social: 72 },
  { class: "10-A", maths: 90, science: 94, english: 88, hindi: 85, social: 92 },
  { class: "10-B", maths: 68, science: 72, english: 70, hindi: 74, social: 69 },
];

export const subjectPerformanceData = [
  { subject: "Mathematics", average: 77, passRate: 88, topScore: 99, bottomScore: 28 },
  { subject: "Science", average: 80, passRate: 91, topScore: 98, bottomScore: 32 },
  { subject: "English", average: 78, passRate: 90, topScore: 97, bottomScore: 35 },
  { subject: "Hindi", average: 79, passRate: 92, topScore: 96, bottomScore: 38 },
  { subject: "Social Studies", average: 76, passRate: 87, topScore: 95, bottomScore: 30 },
];

export const examComparisonData = [
  { exam: "Unit Test 1", classAvg: 72, schoolAvg: 70, topPerformer: 96 },
  { exam: "Unit Test 2", classAvg: 75, schoolAvg: 73, topPerformer: 98 },
  { exam: "Mid Term", classAvg: 78, schoolAvg: 76, topPerformer: 97 },
  { exam: "Unit Test 3", classAvg: 74, schoolAvg: 72, topPerformer: 95 },
  { exam: "Unit Test 4", classAvg: 80, schoolAvg: 77, topPerformer: 99 },
  { exam: "Annual", classAvg: 82, schoolAvg: 79, topPerformer: 98 },
];

export const teacherPerformanceData = [
  { teacher: "Dr. Lakshmi K.", subject: "Mathematics", avgMarks: 82, passRate: 94, students: 45 },
  { teacher: "Mr. Manoj P.", subject: "Science", avgMarks: 78, passRate: 88, students: 42 },
  { teacher: "Ms. Dhanya S.", subject: "English", avgMarks: 85, passRate: 96, students: 40 },
  { teacher: "Mr. Suresh M.", subject: "Hindi", avgMarks: 80, passRate: 92, students: 38 },
  { teacher: "Ms. Priya R.", subject: "Social Studies", avgMarks: 76, passRate: 86, students: 44 },
  { teacher: "Mr. Arun T.", subject: "Mathematics", avgMarks: 70, passRate: 82, students: 43 },
  { teacher: "Ms. Renjini V.", subject: "Science", avgMarks: 84, passRate: 93, students: 41 },
];

// ─── 2. Attendance ──────────────────────────────────────────
export const dailyAttendanceData = [
  { class: "6-A", total: 45, present: 42, absent: 2, halfDay: 1, percentage: 93.3 },
  { class: "6-B", total: 43, present: 38, absent: 4, halfDay: 1, percentage: 88.4 },
  { class: "7-A", total: 44, present: 43, absent: 1, halfDay: 0, percentage: 97.7 },
  { class: "7-B", total: 42, present: 36, absent: 5, halfDay: 1, percentage: 85.7 },
  { class: "8-A", total: 46, present: 44, absent: 1, halfDay: 1, percentage: 95.7 },
  { class: "8-B", total: 40, present: 34, absent: 4, halfDay: 2, percentage: 85.0 },
  { class: "9-A", total: 44, present: 42, absent: 1, halfDay: 1, percentage: 95.5 },
  { class: "9-B", total: 43, present: 39, absent: 3, halfDay: 1, percentage: 90.7 },
  { class: "10-A", total: 45, present: 44, absent: 0, halfDay: 1, percentage: 97.8 },
  { class: "10-B", total: 41, present: 35, absent: 4, halfDay: 2, percentage: 85.4 },
];

export const attendanceTrendData = [
  { week: "Week 1", percentage: 91, target: 90 },
  { week: "Week 2", percentage: 89, target: 90 },
  { week: "Week 3", percentage: 93, target: 90 },
  { week: "Week 4", percentage: 87, target: 90 },
  { week: "Week 5", percentage: 92, target: 90 },
  { week: "Week 6", percentage: 94, target: 90 },
  { week: "Week 7", percentage: 88, target: 90 },
  { week: "Week 8", percentage: 91, target: 90 },
  { week: "Week 9", percentage: 95, target: 90 },
  { week: "Week 10", percentage: 90, target: 90 },
  { week: "Week 11", percentage: 93, target: 90 },
  { week: "Week 12", percentage: 92, target: 90 },
];

export const chronicAbsentees = [
  { id: "STU001", name: "Arjun Nair", class: "9-B", attendance: 62, daysAbsent: 38, status: "critical" as const },
  { id: "STU002", name: "Meera Das", class: "8-B", attendance: 68, daysAbsent: 32, status: "critical" as const },
  { id: "STU003", name: "Rahul S.", class: "7-B", attendance: 71, daysAbsent: 29, status: "warning" as const },
  { id: "STU004", name: "Sneha K.", class: "10-B", attendance: 73, daysAbsent: 27, status: "warning" as const },
  { id: "STU005", name: "Vishnu M.", class: "6-B", attendance: 74, daysAbsent: 26, status: "warning" as const },
  { id: "STU006", name: "Aishwarya R.", class: "9-A", attendance: 75, daysAbsent: 25, status: "warning" as const },
];

// ─── 3. Financial ───────────────────────────────────────────
export const feeCollectionSummary = {
  totalFees: 2450000,
  collected: 1960000,
  pending: 367500,
  overdue: 122500,
  collectionRate: 80,
};

export const classWiseFeeData = [
  { class: "6-A", total: 225000, collected: 202500, rate: 90 },
  { class: "6-B", total: 215000, collected: 172000, rate: 80 },
  { class: "7-A", total: 220000, collected: 209000, rate: 95 },
  { class: "7-B", total: 210000, collected: 168000, rate: 80 },
  { class: "8-A", total: 230000, collected: 207000, rate: 90 },
  { class: "8-B", total: 200000, collected: 150000, rate: 75 },
  { class: "9-A", total: 275000, collected: 247500, rate: 90 },
  { class: "9-B", total: 265000, collected: 212000, rate: 80 },
  { class: "10-A", total: 290000, collected: 275500, rate: 95 },
  { class: "10-B", total: 280000, collected: 196000, rate: 70 },
];

export const feeDefaulters = [
  { id: "STU012", name: "Ajay Kumar", class: "10-B", amount: 15000, daysOverdue: 45, reminders: 3 },
  { id: "STU018", name: "Priya Menon", class: "8-B", amount: 12000, daysOverdue: 38, reminders: 3 },
  { id: "STU024", name: "Ravi Teja", class: "9-B", amount: 18000, daysOverdue: 30, reminders: 2 },
  { id: "STU031", name: "Kavitha S.", class: "7-B", amount: 10000, daysOverdue: 25, reminders: 2 },
  { id: "STU036", name: "Mohammed F.", class: "6-B", amount: 8500, daysOverdue: 20, reminders: 1 },
  { id: "STU042", name: "Deepa N.", class: "10-B", amount: 15000, daysOverdue: 15, reminders: 1 },
];

export const feeReminderFunnel = [
  { stage: "Reminders Sent", count: 245 },
  { stage: "Delivered", count: 238 },
  { stage: "Read", count: 189 },
  { stage: "Clicked Pay", count: 98 },
  { stage: "Payment Done", count: 72 },
];

// ─── 4. Assessment & Quiz ───────────────────────────────────
export const quizPerformanceData = [
  { quiz: "Science Week 1", avgScore: 72, participation: 88, avgTime: 18, allottedTime: 30 },
  { quiz: "Math Challenge", avgScore: 68, participation: 92, avgTime: 22, allottedTime: 30 },
  { quiz: "English Vocab", avgScore: 81, participation: 76, avgTime: 12, allottedTime: 20 },
  { quiz: "GK Rapid Fire", avgScore: 65, participation: 95, avgTime: 8, allottedTime: 15 },
  { quiz: "Science Week 2", avgScore: 78, participation: 85, avgTime: 20, allottedTime: 30 },
  { quiz: "Math Olympiad", avgScore: 58, participation: 70, avgTime: 28, allottedTime: 30 },
];

export const quizParticipationByClass = [
  { class: "6-A", quizzesTaken: 12, avgParticipation: 88 },
  { class: "6-B", quizzesTaken: 10, avgParticipation: 72 },
  { class: "7-A", quizzesTaken: 14, avgParticipation: 95 },
  { class: "7-B", quizzesTaken: 9, avgParticipation: 68 },
  { class: "8-A", quizzesTaken: 13, avgParticipation: 90 },
  { class: "8-B", quizzesTaken: 8, avgParticipation: 62 },
  { class: "9-A", quizzesTaken: 15, avgParticipation: 94 },
  { class: "9-B", quizzesTaken: 11, avgParticipation: 78 },
  { class: "10-A", quizzesTaken: 14, avgParticipation: 92 },
  { class: "10-B", quizzesTaken: 7, avgParticipation: 58 },
];

export const competitionResults = [
  { name: "Inter-School Science Fair", date: "Mar 15, 2026", type: "Inter-School", position: "1st", student: "Anika R. (10-A)", points: 50 },
  { name: "District Math Olympiad", date: "Feb 28, 2026", type: "Inter-School", position: "2nd", student: "Rohan K. (9-A)", points: 35 },
  { name: "Annual Arts Fest", date: "Feb 14, 2026", type: "School", position: "1st", student: "Meera S. (8-A)", points: 40 },
  { name: "Regional Quiz Bowl", date: "Jan 20, 2026", type: "Inter-School", position: "3rd", student: "Arjun T. (10-A)", points: 25 },
  { name: "Sports Day 100m Sprint", date: "Jan 10, 2026", type: "School", position: "1st", student: "Vishnu M. (9-A)", points: 30 },
];

// ─── 5. Community & Engagement ──────────────────────────────
export const communityActivityData = [
  { week: "W1", teacherPosts: 12, studentPosts: 28, replies: 85, reactions: 210 },
  { week: "W2", teacherPosts: 15, studentPosts: 32, replies: 92, reactions: 245 },
  { week: "W3", teacherPosts: 10, studentPosts: 25, replies: 70, reactions: 180 },
  { week: "W4", teacherPosts: 18, studentPosts: 35, replies: 105, reactions: 290 },
  { week: "W5", teacherPosts: 14, studentPosts: 30, replies: 88, reactions: 230 },
  { week: "W6", teacherPosts: 20, studentPosts: 40, replies: 120, reactions: 320 },
  { week: "W7", teacherPosts: 16, studentPosts: 34, replies: 95, reactions: 260 },
  { week: "W8", teacherPosts: 22, studentPosts: 42, replies: 130, reactions: 350 },
];

export const parentEngagementData = [
  { metric: "Daily Logins", value: 342, change: 12, trend: "up" as const },
  { metric: "Child Record Views", value: 528, change: 8, trend: "up" as const },
  { metric: "Bus Location Checks", value: 186, change: -5, trend: "down" as const },
  { metric: "Fee Payments", value: 72, change: 15, trend: "up" as const },
  { metric: "Community Reactions", value: 210, change: 22, trend: "up" as const },
  { metric: "Notification Opens", value: 456, change: -3, trend: "down" as const },
];

// ─── 6. Notification Analytics ──────────────────────────────
export const notificationDeliveryData = [
  { role: "Parents", sent: 450, delivered: 438, read: 312, rate: 71.2 },
  { role: "Students", sent: 380, delivered: 375, read: 298, rate: 79.5 },
  { role: "Teachers", sent: 120, delivered: 120, read: 108, rate: 90.0 },
  { role: "Drivers", sent: 45, delivered: 44, read: 40, rate: 90.9 },
];

export const notificationTimelineData = [
  { time: "< 5 min", count: 280 },
  { time: "5-15 min", count: 190 },
  { time: "15-30 min", count: 120 },
  { time: "30-60 min", count: 85 },
  { time: "1-4 hrs", count: 60 },
  { time: "4-12 hrs", count: 35 },
  { time: "> 12 hrs", count: 18 },
];

export const smsFallbackData = [
  { month: "Jan", pushFailed: 22, smsSent: 18, smsDelivered: 16 },
  { month: "Feb", pushFailed: 18, smsSent: 15, smsDelivered: 14 },
  { month: "Mar", pushFailed: 28, smsSent: 25, smsDelivered: 22 },
  { month: "Apr", pushFailed: 15, smsSent: 12, smsDelivered: 11 },
  { month: "May", pushFailed: 20, smsSent: 18, smsDelivered: 17 },
];

// ─── 7. Transportation ─────────────────────────────────────
export const busRouteData = [
  { bus: "KL-01-AB-1234", driver: "Rajeev K.", route: "North Circuit", sessions: 22, avgDuration: "1h 15m", status: "active" as const },
  { bus: "KL-01-CD-5678", driver: "Sunil M.", route: "South Circuit", sessions: 20, avgDuration: "1h 30m", status: "active" as const },
  { bus: "KL-01-EF-9012", driver: "Babu P.", route: "East Wing", sessions: 18, avgDuration: "55m", status: "active" as const },
  { bus: "KL-01-GH-3456", driver: "Deepak R.", route: "West Connect", sessions: 21, avgDuration: "1h 10m", status: "idle" as const },
  { bus: "KL-01-IJ-7890", driver: "Mohan S.", route: "Central Express", sessions: 24, avgDuration: "1h 05m", status: "active" as const },
];

export const driverActivityData = [
  { day: "Mon", activeSessions: 5, totalHours: 6.2, idleEvents: 1 },
  { day: "Tue", activeSessions: 5, totalHours: 6.5, idleEvents: 0 },
  { day: "Wed", activeSessions: 5, totalHours: 5.8, idleEvents: 2 },
  { day: "Thu", activeSessions: 5, totalHours: 6.0, idleEvents: 1 },
  { day: "Fri", activeSessions: 5, totalHours: 6.3, idleEvents: 0 },
  { day: "Sat", activeSessions: 3, totalHours: 3.5, idleEvents: 0 },
];

// ─── 8. Aura Points & Gamification ─────────────────────────
export const auraLeaderboard = [
  { rank: 1, name: "Anika Rajan", class: "10-A", totalAura: 1250, quizPoints: 480, attendancePoints: 320, communityPoints: 280, badges: 8, avatar: "/Avatar/Female Avatar Age15.png" },
  { rank: 2, name: "Rohan Kumar", class: "9-A", totalAura: 1180, quizPoints: 420, attendancePoints: 340, communityPoints: 250, badges: 7, avatar: "/Avatar/Male Avatar Age15.png" },
  { rank: 3, name: "Sneha Pillai", class: "10-A", totalAura: 1120, quizPoints: 390, attendancePoints: 360, communityPoints: 220, badges: 6, avatar: "/Avatar/Female Avatar Age14.png" },
  { rank: 4, name: "Arjun Thomas", class: "9-A", totalAura: 1050, quizPoints: 350, attendancePoints: 300, communityPoints: 260, badges: 6, avatar: "/Avatar/Male Avatar Age14.png" },
  { rank: 5, name: "Meera Sharma", class: "8-A", totalAura: 980, quizPoints: 340, attendancePoints: 280, communityPoints: 230, badges: 5, avatar: "/Avatar/Female Avatar Age13.png" },
  { rank: 6, name: "Vishnu Mohan", class: "9-B", totalAura: 920, quizPoints: 310, attendancePoints: 290, communityPoints: 190, badges: 5, avatar: "/Avatar/Male Avatar Age13.png" },
  { rank: 7, name: "Priya Nair", class: "8-A", totalAura: 870, quizPoints: 280, attendancePoints: 310, communityPoints: 160, badges: 4, avatar: "/Avatar/Female Avatar Age12.png" },
  { rank: 8, name: "Kiran Dev", class: "7-A", totalAura: 820, quizPoints: 260, attendancePoints: 270, communityPoints: 180, badges: 4, avatar: "/Avatar/Male Avatar Age12.png" },
];

export const auraEarningTrend = [
  { month: "Sep", quiz: 2800, attendance: 3200, community: 1800, events: 900 },
  { month: "Oct", quiz: 3200, attendance: 3400, community: 2100, events: 1200 },
  { month: "Nov", quiz: 2900, attendance: 3100, community: 2400, events: 800 },
  { month: "Dec", quiz: 2400, attendance: 2800, community: 1600, events: 400 },
  { month: "Jan", quiz: 3500, attendance: 3500, community: 2600, events: 1500 },
  { month: "Feb", quiz: 3800, attendance: 3600, community: 2900, events: 1800 },
  { month: "Mar", quiz: 4200, attendance: 3700, community: 3200, events: 2000 },
];

export const badgeDistribution = [
  { badge: "Math Master", icon: "calculate", count: 24, rarity: "common" as const },
  { badge: "Science Whiz", icon: "science", count: 18, rarity: "common" as const },
  { badge: "Quiz Champion", icon: "emoji_events", count: 12, rarity: "uncommon" as const },
  { badge: "Perfect Attendance", icon: "verified", count: 8, rarity: "rare" as const },
  { badge: "Community Star", icon: "star", count: 6, rarity: "rare" as const },
  { badge: "Resource Explorer", icon: "explore", count: 15, rarity: "common" as const },
  { badge: "Helping Hand", icon: "volunteer_activism", count: 4, rarity: "epic" as const },
  { badge: "Top Contributor", icon: "military_tech", count: 2, rarity: "legendary" as const },
];
