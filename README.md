# llm-ci-pipeline

A minimal GitHub repo demonstrating **LLM regression testing in CI/CD** using **Promptfoo** and **GitHub Actions**.

This project is designed to show how to:

- run repeatable prompt evaluations against an LLM
- compare outputs against expected behavior
- fail CI when quality drops below a threshold
- generate evaluation artifacts for review

## What this repo demonstrates

This repo simulates a simple support assistant with three evaluation categories:

1. **Factual correctness**
2. **Policy compliance**
3. **Tone / brevity / formatting**

It is intentionally small so it can be understood quickly and adapted to real client work.

## Stack

- [Promptfoo](https://www.promptfoo.dev/) for LLM evaluation
- GitHub Actions for CI
- OpenAI-compatible provider configuration via environment variables

## Repository structure

```text
.
├── .github/workflows/llm-eval.yml
├── prompts/
│   └── support-assistant.txt
├── scripts/
│   └── check-threshold.js
├── tests/
│   └── support-tests.csv
├── .env.example
├── package.json
├── promptfooconfig.yaml
└── README.md
```

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Then populate `.env` with your model provider settings.

### 3. Run the evaluation locally

```bash
npm run eval
```

### 4. View the latest report

Promptfoo will write results under `.promptfoo/`.

## Environment variables

This sample uses the OpenAI provider via Promptfoo.

Required:

```bash
OPENAI_API_KEY_PROMPTFOO=your_key_here
```

Optional:

```bash
OPENAI_MODEL=gpt-4.1-mini
```

If `OPENAI_MODEL` is not provided, the config defaults to `gpt-4.1-mini`.

## How the evaluation works

The tests are defined in `tests/support-tests.csv` and include:

- a user question
- the expected answer or behavior
- assertion types
- optional rubric information

The prompt template is stored in `prompts/support-assistant.txt`.

Promptfoo combines the prompt with each test case and evaluates the response.

## Threshold enforcement

This repo includes `scripts/check-threshold.js`, which reads the latest Promptfoo JSON output and fails the build if the pass rate falls below a configurable threshold.

Default threshold:

- **85% passing**

Override locally:

```bash
PASS_RATE_THRESHOLD=0.9 npm run eval:ci
```

## Running in GitHub Actions

Set the following repository secret:

- `OPENAI_API_KEY_PROMPTFOO`

Optional repository variable or secret:

- `OPENAI_MODEL`

Then every push or pull request to `main` will run the evaluation workflow.

## Example freelance use cases

This pattern can be adapted for client engagements such as:

- prompt regression testing
- chatbot QA before deployment
- RAG answer validation
- tone / compliance validation
- automated AI release gates in CI/CD

## Notes

- LLM outputs are probabilistic; keep tests focused on **behavioral expectations**, not exact wording.
- In production, create larger datasets and separate tests by business domain.
- For real client projects, consider adding model comparison, cost tracking, and trace capture.

## License

MIT
