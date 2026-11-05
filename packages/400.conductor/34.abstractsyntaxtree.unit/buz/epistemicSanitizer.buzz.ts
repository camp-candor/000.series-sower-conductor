export function sanitizeContextByOmission(
  text: string,
  omittedTopicIds: string[] = []
): string {
  let sanitized = text;

  // 1. Physically scrub prohibited topic references
  for (const topicId of omittedTopicIds) {
    const regex = new RegExp(`\\b${topicId}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '[REDACTED_TOPIC]');
  }

  // 2. Strip internal chain-of-thought or camera brackets
  sanitized = sanitized
    .replace(/<camera_parenthetical>[\s\S]*?<\/camera_parenthetical>/gi, '')
    .replace(/<internal_reasoning>[\s\S]*?<\/internal_reasoning>/gi, '')
    .trim();

  return sanitized;
}
