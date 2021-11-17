# policyer-github

Github provider to test and validate github sdk calls.

[visit policyer repository](https://github.com/niradler/policyer)

## Getting Started

```yaml
# Create checks/validate_branch.yml file
configuration:
  provider: github-provider
  type: github
checks:
  - id: validate-branch-name
    name: check if branch start with Fix-.
    severity: High
    steps:
      - path: env.GITHUB_HEAD_REF
        condition: equal
        value: true
        utility: regex
        utilityProps:
          - "/^FIX-/"
```

```yaml
# Create checks/validate_pr_title.yml file
configuration:
  provider: github-provider
  type: rest
  validEvents:
    - pull_request
  domain: pulls
  action: get
  args:
    owner: context.payload.pull_request.base.user.login
    repo: context.payload.pull_request.base.repo.name
    pull_number: context.payload.pull_request.number
checks:
  - id: validate-pr-title
    name: check if pr title start with FIX.
    severity: High
    steps:
      - path: data.title
        condition: equal
        value: true
        utility: regex
        utilityProps:
          - "/^FIX/i"
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
        uses: policyerorg/policyer-action@v0.0.3-alpha
        with:
          verbose: false
          provider: policyer-github
          internal: false
          checks_path: ./checks
```

Links for github documentation:

- https://docs.github.com/en/rest/reference
- https://octokit.github.io/rest.js/v18
-
