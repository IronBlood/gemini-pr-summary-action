# Gemini PR Summary Action

Summarize pull requests with Gemini and post the summary as a PR comment.

> NOTE: currently this action expects to work with small PRs.

## Usage

```yml
- uses: IronBlood/gemini-pr-summary-action@v0.1.0
  with:
    github_token: ${{ github.token }}
  env:
    # Checkout the doc: Using secrets in GitHub Actions
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    # Optional. Use whatever model you want, e.g. gemini-2.5-flash, gemini-2.5-pro. If not set, gemini-2.0-flash will be used.
    GEMINI_MODEL: gemini-2.0-flash
```

## License

MIT
