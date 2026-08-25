# CHIKCHAT — Agent Rules

## Output Rules

### Reviews must be saved as artifacts

Whenever the user asks to review anything — code, UI references, documentation,
architecture, designs, or any other material — the review output MUST be saved
as a document artifact (`.md` file) in addition to being shown in the chat response.

The artifact must:
- Use proper Markdown formatting.
- Have a descriptive filename that clearly reflects what was reviewed.
- Be saved under the appropriate documentation/review directory.
- Contain the complete review, not merely a summary of the chat response.

Examples:
- `ui_review.md`
- `chikchat_audit.md`
- `chat_page_review.md`
- `architecture_review.md`

Do not create review artifacts for ordinary implementation tasks unless the user
explicitly asks for a review or the task requires a formal review.
