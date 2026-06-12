# Publishing

## GitHub Pages deployment

The dashboard is served at <https://julio0029.github.io/Axone-dashboard/>.

### Source mode

**GH Pages source: GitHub Actions** (switched 2026-06-12).

Deployment is handled by the `deploy_pages` job in `.github/workflows/validate_and_publish.yml`.
The deploy is gated on both `secret_scan` and `validate_html_json` passing — a failing CI run will block deployment entirely, which is intentional. Bad content cannot reach the live page unless all validation gates are green.

### Workflow jobs

| Job | Purpose |
|---|---|
| `secret_scan` | Scans all tracked files for credential patterns before publish |
| `validate_html_json` | Checks structural integrity of HTML and JSON files |
| `deploy_pages` | Uploads repo root as Pages artifact and deploys (runs only if both gates pass) |

### Local build

Run `python3 build_dashboard.py` to regenerate `index.html` and supporting assets from source data.
