# llm-ci-pipeline

A minimal GitHub repo demonstrating **LLM regression testing in CI/CD** using **Promptfoo** and **GitHub Actions**.

This project is designed to show how to:

- run repeatable prompt evaluations against an LLM
- compare outputs against expected behavior
- fail CI when tests persistently fail (with flakiness detection)
- generate evaluation artifacts for review

## What this repo demonstrates

This repo simulates a simple support assistant with three evaluation categories:

1. **Factual correctness**
2. **Policy compliance**
3. **Tone / brevity / formatting**
4. **Semantic similarity**

It is intentionally small so it can be understood quickly and adapted to real production systems.

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
├── promptfooconfig.js
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
OPENAI_MODEL=gpt-3.5-turbo
```

If `OPENAI_MODEL` is not set, the provider ID will be incomplete. Set it in `.env` or as an environment variable.

## How the evaluation works

The tests are defined in `tests/support-tests.csv` and include:

- a user question
- the expected answer or behavior
- assertion types
- optional rubric information

The prompt template is stored in `prompts/support-assistant.txt`.

Promptfoo combines the prompt with each test case and evaluates the response.

## Flakiness detection

LLM outputs are non-deterministic, so a test may fail sporadically without indicating a real regression. To handle this, `eval:ci` runs each test 3 times (`--repeat 3`) and `scripts/check-threshold.js` groups the results:

- **Passing** — all repeats pass
- **Flaky** — some repeats pass, some fail (logged as a warning, does not break the build)
- **Persistently failing** — all repeats fail (breaks the build)

This replaces a blanket pass-rate threshold with targeted failure detection.

## Running in GitHub Actions

Set the following repository secret:

- `OPENAI_API_KEY_PROMPTFOO`

Optional repository variable or secret:

- `OPENAI_MODEL`

Then every push or pull request to `main` will run the evaluation workflow.

## Example freelance use cases

This pattern can be adapted for projects such as:

- prompt regression testing
- chatbot QA before deployment
- RAG answer validation
- tone / compliance validation
- automated AI release gates in CI/CD

## Notes

- LLM outputs are non-deterministic; keep tests focused on **behavioral expectations**, not exact wording.
- In production, create larger datasets and separate tests by business domain.
- For real projects, consider adding model comparison, cost tracking, and trace capture.

## License

MIT
