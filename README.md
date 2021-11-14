# policyer-github

Github provider to test and validate github events.

[visit policyer repository](https://github.com/niradler/policyer)

## Getting Started

```yaml
# Add checks folder to your repository and create validate_branch.yml file
configuration:
  provider: github-provider
  type: github
checks:
  - id: validate-branch-name
    name: check if pr title start with PR.
    severity: High
    steps:
      - path: env.GITHUB_HEAD_REF
        condition: equal
        value: true
        utility: regex
        utilityProps:
          - "/^FIX-/"
```

and add github action:

```yaml
# Add github action file .github/workflows/policyer.yml
name: Policyer

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Policyer GitHub Action
        uses: policyerorg/policyer-action@v0.0.2-alpha
        with:
          verbose: false
          provider: policyer-github
          internal: false
          checks_path: ./checks
```
