## What changed

<!-- Describe the behavior that changed, not the implementation mechanics. -->

## Risk

<!-- What could this break? Who/what is affected if it's wrong? -->

## Verification

Commands run and their actual results (not expected results — paste real output or link to CI):

```
$ ./bin/verify
<paste result>
```

For a change that crosses a real integration boundary (API, DB, UI talking to API, infra), link an end-to-end
reproduction too (see AGENTS.md "Verification process").

## Evidence

<!-- Link test output, API response, screenshot, or trace. Remove secrets before attaching. -->

## Verification gaps

<!-- What you did NOT verify, and why (e.g. "did not test against a cold Postgres — no migration in this change"). -->
