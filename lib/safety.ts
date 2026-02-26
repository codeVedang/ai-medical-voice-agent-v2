export const emergencyKeywords = [
    "chest pain",
    "heart attack",
    "stroke",
    "suicide",
    "kill myself",
    "can't breathe",
    "cannot breathe",
    "shortness of breath",
    "trouble breathing",
    "severe breathlessness",
    "bleeding heavily",
    "loss of consciousness",
    "passed out",
    "fainted",
    "choking",
    "severe allergic reaction",
    "anaphylaxis",
    "seizure",
    "overdose",
    "poisoned",
    "sudden weakness",
    "slurred speech",
    "vision loss"
];

export function checkEmergency(transcript: string): boolean {
    if (!transcript) return false;

    const lowerTranscript = transcript.toLowerCase();

    return emergencyKeywords.some(keyword => lowerTranscript.includes(keyword));
}
